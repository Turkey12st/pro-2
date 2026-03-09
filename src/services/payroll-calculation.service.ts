import { supabase } from '@/integrations/supabase/client';

export interface PayrollCalculation {
  baseSalary: number;
  housingAllowance: number;
  transportationAllowance: number;
  otherAllowances: number;
  grossPay: number;
  gosiEmployee: number;
  gosiCompany: number;
  totalDeductions: number;
  netPay: number;
}

export interface PayrollSummary {
  totalGrossPay: number;
  totalNetPay: number;
  totalDeductions: number;
  totalGosiEmployee: number;
  totalGosiCompany: number;
  employeeCount: number;
}

/**
 * خدمة حساب الرواتب - تضمن الاتساق بين HR و Payroll و Finance
 */
export class PayrollCalculationService {
  // نسب التأمينات الاجتماعية (GOSI) حسب نظام المملكة
  static readonly GOSI_EMPLOYEE_RATE_SAUDI = 0.0975; // 9.75% للسعوديين
  static readonly GOSI_COMPANY_RATE_SAUDI = 0.1175;  // 11.75% للسعوديين
  static readonly GOSI_EMPLOYEE_RATE_NON_SAUDI = 0;   // 0% لغير السعوديين
  static readonly GOSI_COMPANY_RATE_NON_SAUDI = 0.02;  // 2% لغير السعوديين (أخطار مهنية)

  /**
   * حساب الراتب الإجمالي والصافي لموظف واحد
   */
  static calculateEmployeePay(
    baseSalary: number,
    housingAllowance: number,
    transportationAllowance: number,
    otherAllowances: number,
    nationality: string
  ): PayrollCalculation {
    const grossPay = baseSalary + housingAllowance + transportationAllowance + otherAllowances;

    const isSaudi = nationality === 'سعودي' || nationality?.toLowerCase() === 'saudi';
    
    // حساب GOSI على الراتب الأساسي + بدل السكن فقط
    const gosiBase = baseSalary + housingAllowance;
    const gosiEmployee = isSaudi
      ? Math.round(gosiBase * this.GOSI_EMPLOYEE_RATE_SAUDI * 100) / 100
      : 0;
    const gosiCompany = isSaudi
      ? Math.round(gosiBase * this.GOSI_COMPANY_RATE_SAUDI * 100) / 100
      : Math.round(gosiBase * this.GOSI_COMPANY_RATE_NON_SAUDI * 100) / 100;

    const totalDeductions = gosiEmployee;
    const netPay = grossPay - totalDeductions;

    return {
      baseSalary,
      housingAllowance,
      transportationAllowance,
      otherAllowances,
      grossPay,
      gosiEmployee,
      gosiCompany,
      totalDeductions,
      netPay,
    };
  }

  /**
   * حساب الراتب لموظف من قاعدة البيانات
   */
  static async calculateForEmployee(employeeId: string): Promise<PayrollCalculation | null> {
    const { data: employee, error } = await supabase
      .from('employees')
      .select('base_salary, salary, housing_allowance, transportation_allowance, other_allowances, nationality')
      .eq('id', employeeId)
      .single();

    if (error || !employee) return null;

    return this.calculateEmployeePay(
      employee.base_salary || employee.salary || 0,
      employee.housing_allowance || 0,
      employee.transportation_allowance || 0,
      0, // other allowances from JSON
      employee.nationality
    );
  }

  /**
   * إنشاء/تحديث سجل راتب في دورة معينة
   */
  static async upsertSalaryRecord(
    employeeId: string,
    cycleId: string,
    companyId?: string
  ): Promise<boolean> {
    try {
      const calculation = await this.calculateForEmployee(employeeId);
      if (!calculation) return false;

      const { error } = await supabase
        .from('employee_salaries')
        .upsert(
          {
            employee_id: employeeId,
            payroll_cycle_id: cycleId,
            base_salary: calculation.baseSalary,
            housing_allowance: calculation.housingAllowance,
            transportation_allowance: calculation.transportationAllowance,
            allowances_total: calculation.housingAllowance + calculation.transportationAllowance + calculation.otherAllowances,
            deductions_total: calculation.totalDeductions,
            gosi_employee: calculation.gosiEmployee,
            gosi_company: calculation.gosiCompany,
            gross_pay: calculation.grossPay,
            net_pay: calculation.netPay,
            status: 'draft',
            company_id: companyId,
          },
          { onConflict: 'employee_id,payroll_cycle_id' }
        );

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('خطأ في إنشاء سجل الراتب:', error);
      return false;
    }
  }

  /**
   * حساب ملخص الرواتب لدورة كاملة
   */
  static async calculateCycleSummary(cycleId: string): Promise<PayrollSummary> {
    const { data, error } = await supabase
      .from('employee_salaries')
      .select('gross_pay, net_pay, deductions_total, gosi_employee, gosi_company')
      .eq('payroll_cycle_id', cycleId);

    if (error || !data) {
      return { totalGrossPay: 0, totalNetPay: 0, totalDeductions: 0, totalGosiEmployee: 0, totalGosiCompany: 0, employeeCount: 0 };
    }

    return {
      totalGrossPay: data.reduce((s, r) => s + (r.gross_pay || 0), 0),
      totalNetPay: data.reduce((s, r) => s + (r.net_pay || 0), 0),
      totalDeductions: data.reduce((s, r) => s + (r.deductions_total || 0), 0),
      totalGosiEmployee: data.reduce((s, r) => s + (r.gosi_employee || 0), 0),
      totalGosiCompany: data.reduce((s, r) => s + (r.gosi_company || 0), 0),
      employeeCount: data.length,
    };
  }

  /**
   * توليد جميع سجلات الرواتب لدورة معينة
   */
  static async generateCyclePayroll(cycleId: string, companyId?: string): Promise<{ success: number; failed: number }> {
    // جلب جميع الموظفين النشطين
    const query = supabase
      .from('employees')
      .select('id')
      .eq('is_active', true);

    if (companyId) {
      query.eq('company_id', companyId);
    }

    const { data: employees, error } = await query;
    if (error || !employees) return { success: 0, failed: 0 };

    let success = 0;
    let failed = 0;

    for (const emp of employees) {
      const result = await this.upsertSalaryRecord(emp.id, cycleId, companyId);
      if (result) success++;
      else failed++;
    }

    return { success, failed };
  }
}
