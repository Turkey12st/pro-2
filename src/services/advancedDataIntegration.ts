
import { supabase } from "@/integrations/supabase/client";

export class AdvancedDataIntegrationService {
  // ضمان الترابط الشامل للبيانات على طراز أنظمة ERP العالمية
  static async ensureComprehensiveDataIntegrity() {
    try {
      await this.syncEmployeeData();
      await this.syncProjectData();
      await this.syncFinancialData();
      await this.syncPerformanceMetrics();
      await this.generateSystemReports();
    } catch (error) {
      console.error('Error in comprehensive data integration:', error);
      throw error;
    }
  }

  // مزامنة بيانات الموظفين مع جميع الأنظمة
  private static async syncEmployeeData() {
    const { data: employees, error } = await supabase
      .from('employees')
      .select('*');

    if (error) throw error;

    for (const employee of employees || []) {
      // التأكد من وجود الحسابات المحاسبية
      const { data: accounts } = await supabase
        .from('employee_accounts')
        .select('id')
        .eq('employee_id', employee.id);

      if (!accounts || accounts.length === 0) {
        await supabase.rpc('create_employee_accounts', {
          emp_id: employee.id,
          emp_name: employee.name
        });
      }

      // التأكد من وجود سجل أداء
      const { data: performance } = await supabase
        .from('employee_performance')
        .select('id')
        .eq('employee_id', employee.id)
        .limit(1);

      if (!performance || performance.length === 0) {
        await supabase
          .from('employee_performance')
          .insert({
            employee_id: employee.id,
            evaluation_period: 'تقييم أولي',
            performance_score: 75,
            attendance_rate: 100
          });
      }
    }
  }

  // مزامنة بيانات المشاريع
  private static async syncProjectData() {
    const { data: projects, error } = await supabase
      .from('projects')
      .select('*');

    if (error) throw error;

    for (const project of projects || []) {
      // حساب تقدم المشروع بناءً على المهام
      const { data: tasks } = await supabase
        .from('project_tasks')
        .select('status')
        .eq('project_id', project.id);

      if (tasks && tasks.length > 0) {
        const completedTasks = tasks.filter(task => task.status === 'completed').length;
        const progress = Math.round((completedTasks / tasks.length) * 100);

        await supabase
          .from('projects')
          .update({
            progress,
            total_tasks: tasks.length,
            completed_tasks: completedTasks
          })
          .eq('id', project.id);
      }

      // حساب التكلفة الفعلية من تخصيصات الموظفين
      const { data: assignments } = await supabase
        .from('project_employee_assignments')
        .select('total_cost')
        .eq('project_id', project.id);

      if (assignments) {
        const actualCost = assignments.reduce((sum, assignment) => 
          sum + (assignment.total_cost || 0), 0);

        await supabase
          .from('projects')
          .update({ actual_cost: actualCost })
          .eq('id', project.id);
      }
    }
  }

  // مزامنة البيانات المالية
  private static async syncFinancialData() {
    // ربط القيود المحاسبية بالرواتب
    const { data: salaryRecords } = await supabase
      .from('salary_records')
      .select('*')
      .eq('status', 'paid');

    for (const salaryRecord of salaryRecords || []) {
      const { data: existingEntry } = await supabase
        .from('payroll_journal_entries')
        .select('id')
        .eq('salary_record_id', salaryRecord.id)
        .limit(1);

      if (!existingEntry || existingEntry.length === 0) {
        await supabase.rpc('create_salary_journal_entry', {
          emp_id: salaryRecord.employee_id,
          salary_record_id: salaryRecord.id
        });
      }
    }
  }

  // مزامنة مؤشرات الأداء
  private static async syncPerformanceMetrics() {
    const { data: employees } = await supabase
      .from('employees')
      .select('id');

    for (const employee of employees || []) {
      await supabase.rpc('calculate_employee_kpi', {
        emp_id: employee.id
      });
    }
  }

  // إنشاء تقارير النظام
  private static async generateSystemReports() {
    // حساب إجماليات النظام
    const { data: employees } = await supabase
      .from('employees')
      .select('salary');

    const { data: projects } = await supabase
      .from('projects')
      .select('budget, actual_cost');

    const { data: partners } = await supabase
      .from('company_partners')
      .select('share_value');

    const totalSalaries = employees?.reduce((sum, emp) => sum + (emp.salary || 0), 0) || 0;
    const totalBudgets = projects?.reduce((sum, proj) => sum + (proj.budget || 0), 0) || 0;
    const totalCapital = partners?.reduce((sum, partner) => sum + (partner.share_value || 0), 0) || 0;

    // تحديث إدارة رأس المال
    await supabase
      .from('capital_management')
      .upsert({
        fiscal_year: new Date().getFullYear(),
        total_capital: totalCapital,
        available_capital: totalCapital - totalSalaries - totalBudgets,
        reserved_capital: totalSalaries + totalBudgets,
        last_updated: new Date().toISOString()
      });
  }

  // تحليل الاتجاهات والتنبؤات
  static async generateTrendAnalysis() {
    const currentYear = new Date().getFullYear();
    
    // تحليل اتجاه الرواتب
    const { data: salaryTrend } = await supabase
      .from('salary_records')
      .select('total_salary, payment_date')
      .gte('payment_date', `${currentYear}-01-01`)
      .order('payment_date');

    // تحليل أداء المشاريع
    const { data: projectPerformance } = await supabase
      .from('projects')
      .select('budget, actual_cost, progress, status')
      .not('status', 'eq', 'cancelled');

    // تحليل أداء الموظفين
    const { data: employeePerformance } = await supabase
      .from('employee_performance')
      .select('performance_score, evaluation_date')
      .gte('evaluation_date', `${currentYear}-01-01`);

    return {
      salaryTrend: salaryTrend || [],
      projectPerformance: projectPerformance || [],
      employeePerformance: employeePerformance || []
    };
  }

  // إنشاء لوحة تحكم تفاعلية
  static async getDashboardMetrics() {
    const [
      { data: employees },
      { data: projects },
      { data: financials },
      { data: partners }
    ] = await Promise.all([
      supabase.from('employees').select(`
        *,
        employee_accounts(balance),
        employee_performance(performance_score),
        project_employee_assignments(total_cost)
      `),
      supabase.from('projects').select(`
        *,
        project_employee_assignments(total_cost),
        project_tasks(status)
      `),
      supabase.from('journal_entries').select('*').limit(10),
      supabase.from('company_partners').select('*')
    ]);

    return {
      employees: employees || [],
      projects: projects || [],
      financials: financials || [],
      partners: partners || [],
      summary: {
        totalEmployees: employees?.length || 0,
        totalProjects: projects?.length || 0,
        totalCapital: partners?.reduce((sum, p) => sum + (p.share_value || 0), 0) || 0,
        avgPerformance: employees?.reduce((sum, emp) => {
          const perf = emp.employee_performance?.[0]?.performance_score || 0;
          return sum + perf;
        }, 0) / (employees?.length || 1) || 0
      }
    };
  }
}
