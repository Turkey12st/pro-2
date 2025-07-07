import { supabase } from '@/integrations/supabase/client';
import { FinancialIntegrationService } from './financialIntegrationService';

export interface AutomationRule {
  id: string;
  name: string;
  type: 'salary_payment' | 'document_expiry' | 'project_milestone' | 'capital_change';
  conditions: any;
  actions: any;
  isActive: boolean;
  lastExecuted?: string;
}

export class AutomationService {
  // معالجة دفع الرواتب التلقائي
  static async processMonthlyPayroll() {
    try {
      // جلب جميع الموظفين النشطين
      const { data: employees, error: employeesError } = await supabase
        .from('employees')
        .select('*')
        .eq('contract_type', 'active');

      if (employeesError) throw employeesError;

      for (const employee of employees || []) {
        // التحقق من عدم وجود راتب مدفوع لهذا الشهر
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();
        
        const { data: existingSalary } = await supabase
          .from('salary_records')
          .select('id')
          .eq('employee_id', employee.id)
          .gte('payment_date', `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`)
          .lt('payment_date', `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-01`)
          .single();

        if (!existingSalary) {
          // إنشاء سجل راتب جديد
          const salaryData = {
            employee_id: employee.id,
            base_salary: employee.salary,
            housing_allowance: employee.housing_allowance || 0,
            transportation_allowance: employee.transportation_allowance || 0,
            other_allowances: employee.other_allowances || [],
            gosi_subscription: employee.gosi_subscription || 0,
            total_salary: employee.salary + (employee.housing_allowance || 0) + (employee.transportation_allowance || 0),
            payment_date: new Date().toISOString().split('T')[0],
            status: 'pending'
          };

          const { data: salaryRecord, error: salaryError } = await supabase
            .from('salary_records')
            .insert(salaryData)
            .select()
            .single();

          if (salaryError) throw salaryError;

          // ربط الراتب بالنظام المحاسبي
          await FinancialIntegrationService.linkEmployeeSalary(employee.id, {
            ...salaryData,
            employee_name: employee.name
          });

          // إنشاء إشعار
          await this.createNotification({
            title: 'تم إنشاء راتب جديد',
            description: `تم إنشاء راتب شهري للموظف ${employee.name}`,
            type: 'info',
            priority: 'medium',
            reference_type: 'salary',
            reference_id: salaryRecord.id
          });
        }
      }

      return { success: true, message: 'تم معالجة الرواتب الشهرية بنجاح' };
    } catch (error) {
      console.error('Error in monthly payroll processing:', error);
      throw error;
    }
  }

  // التحقق من انتهاء صلاحية المستندات
  static async checkDocumentExpiry() {
    try {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

      const { data: expiringDocs, error } = await supabase
        .from('company_documents')
        .select('*')
        .lte('expiry_date', thirtyDaysFromNow.toISOString().split('T')[0])
        .eq('status', 'active');

      if (error) throw error;

      for (const doc of expiringDocs || []) {
        const daysUntilExpiry = Math.ceil(
          (new Date(doc.expiry_date).getTime() - new Date().getTime()) / (1000 * 3600 * 24)
        );

        let priority: 'low' | 'medium' | 'high' = 'low';
        if (daysUntilExpiry <= 7) priority = 'high';
        else if (daysUntilExpiry <= 15) priority = 'medium';

        await this.createNotification({
          title: 'تنبيه انتهاء صلاحية مستند',
          description: `سينتهي مستند "${doc.title}" خلال ${daysUntilExpiry} يوم`,
          type: daysUntilExpiry <= 0 ? 'error' : 'warning',
          priority,
          reference_type: 'document',
          reference_id: doc.id,
          due_date: doc.expiry_date
        });
      }

      return { success: true, count: expiringDocs?.length || 0 };
    } catch (error) {
      console.error('Error checking document expiry:', error);
      throw error;
    }
  }

  // مراقبة أهداف المشاريع
  static async monitorProjectMilestones() {
    try {
      const { data: projects, error } = await supabase
        .from('projects')
        .select('*')
        .in('status', ['active', 'in_progress']);

      if (error) throw error;

      for (const project of projects || []) {
        // التحقق من تجاوز المشروع للموعد المحدد
        if (project.end_date && new Date(project.end_date) < new Date()) {
          await this.createNotification({
            title: 'تأخير في مشروع',
            description: `المشروع "${project.title}" متأخر عن الموعد المحدد`,
            type: 'warning',
            priority: 'high',
            reference_type: 'project',
            reference_id: project.id
          });
        }

        // التحقق من تجاوز الميزانية
        if (project.budget && project.actual_cost > project.budget) {
          await this.createNotification({
            title: 'تجاوز الميزانية',
            description: `المشروع "${project.title}" تجاوز الميزانية المخصصة`,
            type: 'error',
            priority: 'high',
            reference_type: 'project',
            reference_id: project.id
          });
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Error monitoring project milestones:', error);
      throw error;
    }
  }

  // تحديث البيانات المحاسبية التلقائي
  static async syncAccountingData() {
    try {
      // مزامنة جميع المعاملات المعلقة
      const { data: pendingTransactions, error } = await supabase
        .from('accounting_transactions')
        .select('*')
        .eq('status', 'pending')
        .limit(100);

      if (error) throw error;

      let processedCount = 0;
      for (const transaction of pendingTransactions || []) {
        try {
          // معالجة المعاملة حسب نوعها
          if (transaction.reference_type === 'salary') {
            await this.processSalaryTransaction(transaction);
          } else if (transaction.reference_type === 'capital') {
            await this.processCapitalTransaction(transaction);
          }

          // تحديث حالة المعاملة
          await supabase
            .from('accounting_transactions')
            .update({ status: 'completed' })
            .eq('id', transaction.id);

          processedCount++;
        } catch (error) {
          console.error(`Error processing transaction ${transaction.id}:`, error);
          // تسجيل الخطأ في المعاملة
          await supabase
            .from('accounting_transactions')
            .update({ 
              status: 'error',
              description: `${transaction.description} - خطأ: ${error}`
            })
            .eq('id', transaction.id);
        }
      }

      return { success: true, processed: processedCount };
    } catch (error) {
      console.error('Error syncing accounting data:', error);
      throw error;
    }
  }

  // معالجة معاملة راتب
  private static async processSalaryTransaction(transaction: any) {
    // التحقق من وجود حسابات محاسبية للموظف
    const { data: employeeAccounts } = await supabase
      .from('employee_accounts')
      .select('*')
      .eq('employee_id', transaction.reference_id);

    if (!employeeAccounts || employeeAccounts.length === 0) {
      // إنشاء حسابات محاسبية للموظف
      const { data: employee } = await supabase
        .from('employees')
        .select('name, employment_number')
        .eq('id', transaction.reference_id)
        .single();

      if (employee) {
        await supabase.rpc('create_employee_accounts', {
          emp_id: transaction.reference_id,
          emp_name: employee.name
        });
      }
    }
  }

  // معالجة معاملة رأس المال
  private static async processCapitalTransaction(transaction: any) {
    // تحديث جدول إدارة رأس المال
    const currentYear = new Date().getFullYear();
    
    const { data: capitalManagement } = await supabase
      .from('capital_management')
      .select('*')
      .eq('fiscal_year', currentYear)
      .single();

    if (capitalManagement) {
      const newTotal = transaction.debit_amount 
        ? capitalManagement.total_capital + transaction.debit_amount
        : capitalManagement.total_capital - transaction.credit_amount;

      await supabase
        .from('capital_management')
        .update({
          total_capital: newTotal,
          available_capital: newTotal - capitalManagement.reserved_capital,
          last_updated: new Date().toISOString()
        })
        .eq('fiscal_year', currentYear);
    }
  }

  // إنشاء إشعار
  private static async createNotification(notificationData: {
    title: string;
    description: string;
    type: 'success' | 'warning' | 'error' | 'info';
    priority: 'low' | 'medium' | 'high';
    reference_type: string;
    reference_id: string;
    due_date?: string;
  }) {
    try {
      await supabase
        .from('notifications')
        .insert({
          ...notificationData,
          status: 'unread',
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  }

  // تشغيل جميع المهام التلقائية
  static async runAllAutomations() {
    const results = {
      payroll: null as any,
      documents: null as any,
      projects: null as any,
      accounting: null as any,
      errors: [] as string[]
    };

    try {
      results.payroll = await this.processMonthlyPayroll();
    } catch (error) {
      results.errors.push(`Payroll: ${error}`);
    }

    try {
      results.documents = await this.checkDocumentExpiry();
    } catch (error) {
      results.errors.push(`Documents: ${error}`);
    }

    try {
      results.projects = await this.monitorProjectMilestones();
    } catch (error) {
      results.errors.push(`Projects: ${error}`);
    }

    try {
      results.accounting = await this.syncAccountingData();
    } catch (error) {
      results.errors.push(`Accounting: ${error}`);
    }

    return results;
  }
}