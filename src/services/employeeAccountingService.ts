import { supabase } from "@/integrations/supabase/client";

export interface EmployeeAccountingData {
  id: string;
  name: string;
  employment_number: string;
  department: string;
  position: string;
  salary: number;
  accounts: EmployeeAccount[];
  performance: EmployeePerformance;
  assignments: ProjectAssignment[];
  incentives: EmployeeIncentive[];
}

export interface EmployeeAccount {
  id: string;
  account_number: string;
  account_name: string;
  account_type: string;
  balance: number;
}

export interface EmployeePerformance {
  id: string;
  performance_score: number;
  task_completion_rate: number;
  project_success_rate: number;
  attendance_rate: number;
  kpi_metrics: any;
}

export interface ProjectAssignment {
  id: string;
  project_id: string;
  project_title: string;
  role_in_project: string;
  hourly_rate: number;
  total_hours: number;
  total_cost: number;
}

export interface EmployeeIncentive {
  id: string;
  incentive_type: string;
  amount: number;
  status: string;
  award_date: string;
}

export class EmployeeAccountingService {
  // جلب البيانات المحاسبية الشاملة للموظف
  static async getEmployeeAccountingData(employeeId: string): Promise<EmployeeAccountingData | null> {
    try {
      // جلب بيانات الموظف الأساسية
      const { data: employee, error: empError } = await supabase
        .from('employees')
        .select('*')
        .eq('id', employeeId)
        .single();

      if (empError) throw empError;

      // جلب الحسابات المحاسبية
      const { data: accounts, error: accError } = await supabase
        .from('employee_accounts')
        .select('*')
        .eq('employee_id', employeeId);

      if (accError) throw accError;

      // جلب مؤشرات الأداء
      const { data: performance, error: perfError } = await supabase
        .from('employee_performance')
        .select('*')
        .eq('employee_id', employeeId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (perfError && perfError.code !== 'PGRST116') throw perfError;

      // جلب تخصيصات المشاريع
      const { data: assignments, error: assignError } = await supabase
        .from('project_employee_assignments')
        .select(`
          *,
          projects (
            title
          )
        `)
        .eq('employee_id', employeeId)
        .eq('is_active', true);

      if (assignError) throw assignError;

      // جلب الحوافز
      const { data: incentives, error: incError } = await supabase
        .from('employee_incentives')
        .select('*')
        .eq('employee_id', employeeId)
        .order('award_date', { ascending: false });

      if (incError) throw incError;

      // معالجة بيانات الأداء
      const performanceData: EmployeePerformance = performance ? {
        id: performance.id,
        performance_score: performance.performance_score || 0,
        task_completion_rate: performance.tasks_completed || 0,
        project_success_rate: performance.projects_completed || 0,
        attendance_rate: performance.attendance_rate || 100,
        kpi_metrics: performance.kpi_metrics || {}
      } : {
        id: '',
        performance_score: 0,
        task_completion_rate: 0,
        project_success_rate: 0,
        attendance_rate: 100,
        kpi_metrics: {}
      };

      return {
        id: employee.id,
        name: employee.name,
        employment_number: employee.employment_number || '',
        department: employee.department,
        position: employee.position,
        salary: employee.salary,
        accounts: accounts || [],
        performance: performanceData,
        assignments: assignments?.map(a => ({
          id: a.id,
          project_id: a.project_id,
          project_title: a.projects?.title || '',
          role_in_project: a.role_in_project,
          hourly_rate: a.hourly_rate || 0,
          total_hours: a.total_hours || 0,
          total_cost: a.total_cost || 0
        })) || [],
        incentives: incentives || []
      };
    } catch (error) {
      console.error('Error fetching employee accounting data:', error);
      return null;
    }
  }

  // تحديث مؤشرات الأداء
  static async updateEmployeeKPI(employeeId: string) {
    try {
      const { data, error } = await supabase.rpc('calculate_employee_kpi', {
        emp_id: employeeId
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating employee KPI:', error);
      throw error;
    }
  }

  // إضافة حافز للموظف
  static async addEmployeeIncentive(incentiveData: {
    employee_id: string;
    incentive_type: string;
    amount: number;
    awarded_for: string;
    created_by: string;
  }) {
    try {
      const { data, error } = await supabase
        .from('employee_incentives')
        .insert([incentiveData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding employee incentive:', error);
      throw error;
    }
  }

  // تخصيص موظف لمشروع
  static async assignEmployeeToProject(assignmentData: {
    project_id: string;
    employee_id: string;
    role_in_project: string;
    hourly_rate?: number;
  }) {
    try {
      const { data, error } = await supabase
        .from('project_employee_assignments')
        .insert([assignmentData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error assigning employee to project:', error);
      throw error;
    }
  }

  // إنشاء قيد محاسبي للراتب
  static async createSalaryJournalEntry(employeeId: string, salaryRecordId: string) {
    try {
      const { data, error } = await supabase.rpc('create_salary_journal_entry', {
        emp_id: employeeId,
        salary_record_id: salaryRecordId
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating salary journal entry:', error);
      throw error;
    }
  }

  // جلب تقرير مالي شامل للموظف
  static async getEmployeeFinancialReport(employeeId: string, startDate: string, endDate: string) {
    try {
      // جلب قيود الرواتب
      const { data: salaryEntries, error: salaryError } = await supabase
        .from('payroll_journal_entries')
        .select(`
          *,
          journal_entries (
            description,
            entry_date,
            reference_number
          )
        `)
        .eq('employee_id', employeeId)
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      if (salaryError) throw salaryError;

      // جلب الحوافز في الفترة
      const { data: incentives, error: incentivesError } = await supabase
        .from('employee_incentives')
        .select('*')
        .eq('employee_id', employeeId)
        .gte('award_date', startDate)
        .lte('award_date', endDate);

      if (incentivesError) throw incentivesError;

      // حساب الإجماليات
      const totalSalaries = salaryEntries?.reduce((sum, entry) => sum + (entry.gross_salary || 0), 0) || 0;
      const totalDeductions = salaryEntries?.reduce((sum, entry) => sum + (entry.total_deductions || 0), 0) || 0;
      const totalIncentives = incentives?.reduce((sum, inc) => sum + (inc.amount || 0), 0) || 0;

      return {
        employee_id: employeeId,
        period: { start: startDate, end: endDate },
        salary_entries: salaryEntries || [],
        incentives: incentives || [],
        summary: {
          total_salaries: totalSalaries,
          total_deductions: totalDeductions,
          total_incentives: totalIncentives,
          net_compensation: totalSalaries - totalDeductions + totalIncentives
        }
      };
    } catch (error) {
      console.error('Error generating financial report:', error);
      throw error;
    }
  }

  // جلب كل الموظفين مع بياناتهم المحاسبية
  static async getAllEmployeesAccounting() {
    try {
      const { data: employees, error } = await supabase
        .from('employees')
        .select(`
          *,
          employee_accounts (
            id,
            account_number,
            account_name,
            account_type,
            balance
          ),
          employee_performance (
            performance_score,
            kpi_metrics,
            attendance_rate
          ),
          project_employee_assignments (
            project_id,
            role_in_project,
            total_cost,
            projects (
              title,
              status
            )
          )
        `)
        .order('name');

      if (error) throw error;
      return employees;
    } catch (error) {
      console.error('Error fetching all employees accounting data:', error);
      throw error;
    }
  }
}
