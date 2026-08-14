import { supabase } from "@/integrations/supabase/client";
import {
  createAccountingEvent,
  type AccountingEventResult,
} from "@/services/accountingPostingService";

export interface FinancialTransaction {
  id: string;
  amount: number;
  type: "debit" | "credit";
  accountId: string;
  description: string;
  referenceId: string;
  referenceType: string;
  date: string;
}

interface SalaryData {
  total_salary: number;
  gosi_subscription?: number;
  employee_name?: string;
}

interface ProjectExpenseData {
  amount: number;
  description: string;
  date: string;
}

interface CapitalTransactionData {
  id: string;
  amount: number;
  transaction_type: "increase" | "decrease";
  effective_date: string;
}

/** دليل الحسابات القياسي المطلوب للأتمتة؛ لا يُنشأ تلقائياً من الواجهة. */
export const STANDARD_ACCOUNTS: Record<string, { name: string; type: string; balance: string }> = {
  "1110": { name: "النقدية", type: "asset", balance: "debit" },
  "1120": { name: "المدينون", type: "asset", balance: "debit" },
  "2110": { name: "رواتب مستحقة الدفع", type: "liability", balance: "credit" },
  "2120": { name: "التأمينات الاجتماعية المستحقة", type: "liability", balance: "credit" },
  "2130": { name: "مصروفات مستحقة", type: "liability", balance: "credit" },
  "3100": { name: "رأس المال", type: "equity", balance: "credit" },
  "5110": { name: "مصروف الرواتب والأجور", type: "expense", balance: "debit" },
  "5120": { name: "مصروفات المشاريع", type: "expense", balance: "debit" },
};

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function getActiveCompanyId(): Promise<string> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("يجب تسجيل الدخول قبل إنشاء حدث مالي");
  }

  const { data: membership, error: membershipError } = await supabase
    .from("users_companies")
    .select("company_id, is_default, created_at")
    .eq("user_id", user.id)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (membershipError || !membership?.company_id) {
    throw new Error("لا توجد شركة نشطة مرتبطة بحسابك");
  }

  return membership.company_id;
}

/**
 * يطابق أرقام الحسابات مع دليل حسابات الشركة الحالية أو حسابات النظام العامة.
 * لا تنشئ الخدمة حسابات تلقائياً لأن إنشاء الدليل يتطلب موافقة وإدارة مالية.
 */
export async function resolveAccountIds(
  accountNumbers: string[],
  companyId: string
): Promise<Record<string, string>> {
  const uniqueNumbers = [...new Set(accountNumbers)];
  const { data, error } = await supabase
    .from("chart_of_accounts")
    .select("id, account_number, company_id, is_active")
    .in("account_number", uniqueNumbers)
    .eq("is_active", true);

  if (error) throw error;

  const accountMap: Record<string, string> = {};
  for (const number of uniqueNumbers) {
    const account = (data ?? []).find(
      (candidate) =>
        candidate.account_number === number && candidate.company_id === companyId
    ) ?? (data ?? []).find(
      (candidate) => candidate.account_number === number && candidate.company_id === null
    );

    if (!account) {
      throw new Error(`الحساب ${number} غير مهيأ للشركة الحالية أو غير نشط`);
    }

    accountMap[number] = account.id;
  }

  return accountMap;
}

export class FinancialIntegrationService {
  /**
   * ينشئ حدثاً محاسبياً في مسودة عبر RPC. يتحقق الخادم من التوازن والصلاحية
   * وعزل الشركة ويمنع التكرار عبر المصدر والحدث ومفتاح الإعادة.
   */
  static async createAutomaticJournalEntry(
    description: string,
    transactions: FinancialTransaction[],
    referenceType: string,
    referenceId: string
  ): Promise<AccountingEventResult> {
    if (!UUID_PATTERN.test(referenceId)) {
      throw new Error("مرجع الحدث المالي يجب أن يكون UUID صالحاً");
    }

    const totalDebit = transactions
      .filter((transaction) => transaction.type === "debit")
      .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);
    const totalCredit = transactions
      .filter((transaction) => transaction.type === "credit")
      .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);

    if (transactions.length < 2 || Math.abs(totalDebit - totalCredit) > 0.009) {
      throw new Error("القيد المحاسبي غير متوازن");
    }

    const companyId = await getActiveCompanyId();
    const accountMap = await resolveAccountIds(
      transactions.map((transaction) => transaction.accountId),
      companyId
    );

    return createAccountingEvent({
      companyId,
      sourceType: referenceType,
      sourceId: referenceId,
      eventType: `${referenceType}_accrued`,
      entryDate: transactions[0]?.date?.slice(0, 10) || new Date().toISOString().slice(0, 10),
      description,
      currency: "SAR",
      idempotencyKey: crypto.randomUUID(),
      autoPost: false,
      lines: transactions.map((transaction) => ({
        account_id: accountMap[transaction.accountId],
        description: transaction.description,
        debit: transaction.type === "debit" ? Number(transaction.amount) : 0,
        credit: transaction.type === "credit" ? Number(transaction.amount) : 0,
        currency: "SAR",
      })),
    });
  }

  static async linkEmployeeSalary(
    employeeId: string,
    salaryData: SalaryData
  ): Promise<AccountingEventResult> {
    const grossSalary = Number(salaryData.total_salary || 0);
    const gosiAmount = Number(salaryData.gosi_subscription || 0);
    const netSalary = grossSalary - gosiAmount;

    if (grossSalary <= 0 || netSalary < 0) {
      throw new Error("قيم الراتب غير صالحة للترحيل");
    }

    const transactions: FinancialTransaction[] = [
      {
        id: `salary-${employeeId}-gross`,
        amount: grossSalary,
        type: "debit",
        accountId: "5110",
        description: "مصروف راتب الموظف",
        referenceId: employeeId,
        referenceType: "employee_salary",
        date: new Date().toISOString(),
      },
      {
        id: `salary-${employeeId}-net`,
        amount: netSalary,
        type: "credit",
        accountId: "2110",
        description: "رواتب مستحقة الدفع",
        referenceId: employeeId,
        referenceType: "employee_salary",
        date: new Date().toISOString(),
      },
    ];

    if (gosiAmount > 0) {
      transactions.push({
        id: `salary-${employeeId}-gosi`,
        amount: gosiAmount,
        type: "credit",
        accountId: "2120",
        description: "تأمينات اجتماعية مستحقة",
        referenceId: employeeId,
        referenceType: "employee_salary",
        date: new Date().toISOString(),
      });
    }

    return this.createAutomaticJournalEntry(
      `استحقاق راتب ${salaryData.employee_name || "موظف"}`,
      transactions,
      "employee_salary",
      employeeId
    );
  }

  static async linkProjectExpense(
    projectId: string,
    expenseData: ProjectExpenseData
  ): Promise<AccountingEventResult> {
    const amount = Number(expenseData.amount || 0);
    if (amount <= 0) throw new Error("قيمة مصروف المشروع يجب أن تكون موجبة");

    return this.createAutomaticJournalEntry(
      `مصروف مشروع - ${expenseData.description}`,
      [
        {
          id: `project-${projectId}-expense`,
          amount,
          type: "debit",
          accountId: "5120",
          description: expenseData.description,
          referenceId: projectId,
          referenceType: "project_expense",
          date: expenseData.date,
        },
        {
          id: `project-${projectId}-payable`,
          amount,
          type: "credit",
          accountId: "2130",
          description: expenseData.description,
          referenceId: projectId,
          referenceType: "project_expense",
          date: expenseData.date,
        },
      ],
      "project_expense",
      projectId
    );
  }

  static async linkCapitalTransaction(
    capitalData: CapitalTransactionData
  ): Promise<AccountingEventResult> {
    const amount = Number(capitalData.amount || 0);
    if (amount <= 0) throw new Error("قيمة رأس المال يجب أن تكون موجبة");

    const isIncrease = capitalData.transaction_type === "increase";
    return this.createAutomaticJournalEntry(
      isIncrease ? "زيادة رأس المال" : "تخفيض رأس المال",
      [
        {
          id: `capital-${capitalData.id}`,
          amount,
          type: isIncrease ? "debit" : "credit",
          accountId: "1110",
          description: isIncrease ? "زيادة نقدية لرأس المال" : "تخفيض نقدي لرأس المال",
          referenceId: capitalData.id,
          referenceType: "capital_transaction",
          date: capitalData.effective_date,
        },
        {
          id: `capital-equity-${capitalData.id}`,
          amount,
          type: isIncrease ? "credit" : "debit",
          accountId: "3100",
          description: isIncrease ? "زيادة حقوق الملكية" : "تخفيض حقوق الملكية",
          referenceId: capitalData.id,
          referenceType: "capital_transaction",
          date: capitalData.effective_date,
        },
      ],
      "capital_transaction",
      capitalData.id
    );
  }
}
