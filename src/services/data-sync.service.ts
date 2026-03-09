import { supabase } from '@/integrations/supabase/client';

export interface SyncEvent {
  sourceModule: string;
  sourceTable: string;
  recordId: string;
  action: 'INSERT' | 'UPDATE' | 'DELETE';
  changes?: Record<string, any>;
  syncedToModules?: string[];
}

export interface DataIntegrityResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * خدمة مزامنة البيانات المركزية - مصدر واحد للحقيقة
 * تضمن ترابط البيانات بين وحدات HR و Payroll و Finance
 */
export class DataSyncService {
  /**
   * تسجيل حدث مزامنة في سجل المزامنة المركزي
   */
  static async logSync(event: SyncEvent): Promise<void> {
    try {
      await supabase.from('data_sync_log').insert({
        source_module: event.sourceModule,
        source_table: event.sourceTable,
        record_id: event.recordId,
        action: event.action,
        synced_to_modules: event.syncedToModules || [],
        changes: event.changes || {},
        status: 'synced',
      });
    } catch (error) {
      console.error('خطأ في تسجيل المزامنة:', error);
    }
  }

  /**
   * مزامنة تغييرات الموظف إلى الوحدات المرتبطة
   * عند تعديل بيانات موظف → يُحدّث الرواتب والمالية
   */
  static async syncEmployeeChanges(
    employeeId: string,
    changes: Record<string, any>
  ): Promise<{ success: boolean; affectedModules: string[] }> {
    const affectedModules: string[] = [];

    try {
      // إذا تغير الراتب → تحديث الرواتب (يتم تلقائياً عبر trigger)
      if (changes.salary || changes.base_salary || changes.housing_allowance || changes.transportation_allowance) {
        affectedModules.push('payroll');
      }

      // إذا تغير القسم → تحديث مراكز التكلفة
      if (changes.department_id) {
        affectedModules.push('finance', 'projects');
      }

      // تسجيل المزامنة
      await this.logSync({
        sourceModule: 'hr',
        sourceTable: 'employees',
        recordId: employeeId,
        action: 'UPDATE',
        changes,
        syncedToModules: affectedModules,
      });

      return { success: true, affectedModules };
    } catch (error) {
      console.error('خطأ في مزامنة تغييرات الموظف:', error);
      return { success: false, affectedModules };
    }
  }

  /**
   * التحقق من سلامة البيانات بين الوحدات
   */
  static async validateDataIntegrity(module: string): Promise<DataIntegrityResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      if (module === 'payroll' || module === 'all') {
        // التحقق من أن كل سجل رواتب مرتبط بموظف نشط
        const { data: orphanedSalaries } = await supabase
          .from('employee_salaries')
          .select('id, employee_id, employees!inner(id, is_active)')
          .eq('is_active', true);

        if (orphanedSalaries) {
          const inactive = orphanedSalaries.filter(
            (s: any) => !s.employees?.is_active
          );
          if (inactive.length > 0) {
            warnings.push(
              `يوجد ${inactive.length} سجل رواتب لموظفين غير نشطين`
            );
          }
        }
      }

      if (module === 'finance' || module === 'all') {
        // التحقق من توازن القيود المحاسبية
        const { data: unbalanced } = await supabase
          .from('journal_entries')
          .select('id, total_debit, total_credit')
          .neq('total_debit', 0);

        if (unbalanced) {
          const imbalanced = unbalanced.filter(
            (e: any) => Math.abs((e.total_debit || 0) - (e.total_credit || 0)) > 0.01
          );
          if (imbalanced.length > 0) {
            errors.push(
              `يوجد ${imbalanced.length} قيد محاسبي غير متوازن`
            );
          }
        }
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
      };
    } catch (error) {
      console.error('خطأ في التحقق من سلامة البيانات:', error);
      return {
        isValid: false,
        errors: ['فشل في التحقق من سلامة البيانات'],
        warnings,
      };
    }
  }

  /**
   * حساب تأثير التغييرات قبل الحفظ (معاينة التأثير)
   */
  static async previewImpact(
    entityType: 'employee' | 'salary' | 'department',
    entityId: string,
    changes: Record<string, any>
  ): Promise<{ salaryRecords: number; financialTransactions: number; description: string }> {
    let salaryRecords = 0;
    let financialTransactions = 0;
    let description = '';

    try {
      if (entityType === 'employee') {
        // عدد سجلات الرواتب المتأثرة
        const { count: salaryCount } = await supabase
          .from('employee_salaries')
          .select('id', { count: 'exact', head: true })
          .eq('employee_id', entityId)
          .eq('status', 'draft');

        salaryRecords = salaryCount || 0;

        if (changes.salary || changes.base_salary) {
          description = `سيتم تحديث ${salaryRecords} سجل رواتب في الدورات المفتوحة`;
        }

        if (changes.department_id) {
          description += `${description ? '، و' : ''}سيتم تحديث مركز التكلفة في التقارير المالية`;
        }
      }

      if (entityType === 'salary') {
        // عند اعتماد الراتب → سيُنشئ قيد مالي
        financialTransactions = 1;
        description = 'سيتم إنشاء قيد محاسبي تلقائي عند الاعتماد';
      }

      return { salaryRecords, financialTransactions, description };
    } catch (error) {
      console.error('خطأ في معاينة التأثير:', error);
      return { salaryRecords: 0, financialTransactions: 0, description: 'غير قادر على حساب التأثير' };
    }
  }

  /**
   * جلب سجل المزامنة الأخير
   */
  static async getRecentSyncLog(limit = 20) {
    const { data, error } = await supabase
      .from('data_sync_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  }
}
