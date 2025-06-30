
// خدمة الربط المالي العالمي
import { supabase } from '@/integrations/supabase/client';

export interface FinancialTransaction {
  id: string;
  amount: number;
  type: 'debit' | 'credit';
  accountId: string;
  description: string;
  referenceId: string;
  referenceType: string;
  date: string;
}

export class FinancialIntegrationService {
  // إنشاء قيد محاسبي تلقائي
  static async createAutomaticJournalEntry(
    description: string,
    transactions: FinancialTransaction[],
    referenceType: string,
    referenceId: string
  ) {
    try {
      // التحقق من توازن القيد (مجموع المدين = مجموع الدائن)
      const totalDebit = transactions
        .filter(t => t.type === 'debit')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const totalCredit = transactions
        .filter(t => t.type === 'credit')
        .reduce((sum, t) => sum + t.amount, 0);

      if (Math.abs(totalDebit - totalCredit) > 0.01) {
        throw new Error('Journal entry is not balanced');
      }

      // إنشاء القيد الرئيسي
      const { data: journalEntry, error: journalError } = await supabase
        .from('journal_entries')
        .insert({
          entry_name: description,
          description,
          entry_date: new Date().toISOString().split('T')[0],
          total_debit: totalDebit,
          total_credit: totalCredit,
          status: 'posted',
          entry_type: 'automatic',
          financial_statement_section: 'balance_sheet'
        })
        .select()
        .single();

      if (journalError) throw journalError;

      // إنشاء بنود القيد
      const journalItems = transactions.map(transaction => ({
        journal_entry_id: journalEntry.id,
        account_id: transaction.accountId,
        description: transaction.description,
        debit: transaction.type === 'debit' ? transaction.amount : 0,
        credit: transaction.type === 'credit' ? transaction.amount : 0
      }));

      const { error: itemsError } = await supabase
        .from('journal_entry_items')
        .insert(journalItems);

      if (itemsError) throw itemsError;

      // تسجيل المعاملة في جدول المعاملات المحاسبية
      const accountingTransactions = transactions.map(transaction => ({
        journal_entry_id: journalEntry.id,
        account_id: transaction.accountId,
        reference_id: referenceId,
        reference_type: referenceType,
        transaction_date: new Date().toISOString().split('T')[0],
        debit_amount: transaction.type === 'debit' ? transaction.amount : 0,
        credit_amount: transaction.type === 'credit' ? transaction.amount : 0,
        description: transaction.description,
        status: 'completed',
        auto_generated: true
      }));

      await supabase
        .from('accounting_transactions')
        .insert(accountingTransactions);

      return journalEntry;
    } catch (error) {
      console.error('Error creating automatic journal entry:', error);
      throw error;
    }
  }

  // ربط راتب الموظف بالنظام المحاسبي
  static async linkEmployeeSalary(employeeId: string, salaryData: any) {
    const transactions: FinancialTransaction[] = [
      {
        id: `salary-${employeeId}-gross`,
        amount: salaryData.total_salary,
        type: 'debit',
        accountId: '1001', // حساب مصروف الرواتب
        description: `راتب الموظف - إجمالي`,
        referenceId: employeeId,
        referenceType: 'employee_salary',
        date: new Date().toISOString()
      },
      {
        id: `salary-${employeeId}-net`,
        amount: salaryData.total_salary - (salaryData.gosi_subscription || 0),
        type: 'credit',
        accountId: '2001', // حساب الرواتب المستحقة
        description: `راتب الموظف - صافي`,
        referenceId: employeeId,
        referenceType: 'employee_salary',
        date: new Date().toISOString()
      }
    ];

    // إضافة التأمينات الاجتماعية إذا وُجدت
    if (salaryData.gosi_subscription > 0) {
      transactions.push({
        id: `salary-${employeeId}-gosi`,
        amount: salaryData.gosi_subscription,
        type: 'credit',
        accountId: '2002', // حساب التأمينات الاجتماعية
        description: `تأمينات اجتماعية`,
        referenceId: employeeId,
        referenceType: 'employee_salary',
        date: new Date().toISOString()
      });
    }

    return await this.createAutomaticJournalEntry(
      `راتب الموظف - ${salaryData.employee_name}`,
      transactions,
      'employee_salary',
      employeeId
    );
  }

  // ربط مصروفات المشروع
  static async linkProjectExpense(projectId: string, expenseData: any) {
    const transactions: FinancialTransaction[] = [
      {
        id: `project-${projectId}-expense`,
        amount: expenseData.amount,
        type: 'debit',
        accountId: '5001', // حساب مصروفات المشاريع
        description: expenseData.description,
        referenceId: projectId,
        referenceType: 'project_expense',
        date: expenseData.date
      },
      {
        id: `project-${projectId}-payable`,
        amount: expenseData.amount,
        type: 'credit',
        accountId: '2003', // حساب المصروفات المستحقة
        description: expenseData.description,
        referenceId: projectId,
        referenceType: 'project_expense',
        date: expenseData.date
      }
    ];

    return await this.createAutomaticJournalEntry(
      `مصروف مشروع - ${expenseData.description}`,
      transactions,
      'project_expense',
      projectId
    );
  }

  // ربط رأس المال
  static async linkCapitalTransaction(capitalData: any) {
    const transactions: FinancialTransaction[] = [
      {
        id: `capital-${capitalData.id}`,
        amount: capitalData.amount,
        type: capitalData.transaction_type === 'increase' ? 'debit' : 'credit',
        accountId: '1000', // حساب النقدية
        description: `${capitalData.transaction_type === 'increase' ? 'زيادة' : 'تخفيض'} رأس المال`,
        referenceId: capitalData.id,
        referenceType: 'capital_transaction',
        date: capitalData.effective_date
      },
      {
        id: `capital-equity-${capitalData.id}`,
        amount: capitalData.amount,
        type: capitalData.transaction_type === 'increase' ? 'credit' : 'debit',
        accountId: '3001', // حساب رأس المال
        description: `${capitalData.transaction_type === 'increase' ? 'زيادة' : 'تخفيض'} رأس المال`,
        referenceId: capitalData.id,
        referenceType: 'capital_transaction',
        date: capitalData.effective_date
      }
    ];

    return await this.createAutomaticJournalEntry(
      `معاملة رأس المال`,
      transactions,
      'capital_transaction',
      capitalData.id
    );
  }
}
