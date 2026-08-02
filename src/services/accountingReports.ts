import { supabase } from "@/integrations/supabase/client";

export type AccountType = "asset" | "liability" | "equity" | "revenue" | "expense";

export interface LedgerRow {
  entry_id: string;
  entry_date: string;
  entry_description: string;
  reference_number: string | null;
  line_description: string | null;
  debit: number;
  credit: number;
  account_id: string;
  account_number: string;
  account_name: string;
  account_type: AccountType;
}

export interface ReportSection {
  title: string;
  items: any[];
  total?: number;
}

export interface ReportData {
  sections: ReportSection[];
  summary?: { label: string; value: number; isNet?: boolean }[];
  type: string;
}

/** جلب حركات دفتر الأستاذ (بنود القيود المرحّلة) خلال فترة */
export async function fetchLedgerRows(startDate: string, endDate: string): Promise<LedgerRow[]> {
  const { data, error } = await supabase
    .from("journal_entry_items")
    .select(
      `id, debit, credit, description, account_id,
       chart_of_accounts:account_id ( account_number, account_name, account_type ),
       journal_entries!inner ( id, entry_date, description, reference_number, status )`
    )
    .eq("journal_entries.status", "posted")
    .gte("journal_entries.entry_date", startDate)
    .lte("journal_entries.entry_date", endDate);

  if (error) throw error;

  return (data ?? []).map((row: any) => ({
    entry_id: row.journal_entries?.id,
    entry_date: row.journal_entries?.entry_date,
    entry_description: row.journal_entries?.description ?? "",
    reference_number: row.journal_entries?.reference_number ?? null,
    line_description: row.description ?? null,
    debit: Number(row.debit) || 0,
    credit: Number(row.credit) || 0,
    account_id: row.account_id,
    account_number: row.chart_of_accounts?.account_number ?? "—",
    account_name: row.chart_of_accounts?.account_name ?? "حساب غير معروف",
    account_type: (row.chart_of_accounts?.account_type ?? "asset") as AccountType,
  }));
}

interface AccountBalance {
  account_id: string;
  account_number: string;
  account_name: string;
  account_type: AccountType;
  debit: number;
  credit: number;
  /** الرصيد بالإشارة الطبيعية للحساب */
  balance: number;
}

export function aggregateByAccount(rows: LedgerRow[]): AccountBalance[] {
  const map = new Map<string, AccountBalance>();
  for (const r of rows) {
    const key = r.account_id ?? r.account_number;
    const acc =
      map.get(key) ??
      {
        account_id: r.account_id,
        account_number: r.account_number,
        account_name: r.account_name,
        account_type: r.account_type,
        debit: 0,
        credit: 0,
        balance: 0,
      };
    acc.debit += r.debit;
    acc.credit += r.credit;
    map.set(key, acc);
  }
  const list = [...map.values()];
  for (const a of list) {
    const naturalDebit = a.account_type === "asset" || a.account_type === "expense";
    a.balance = naturalDebit ? a.debit - a.credit : a.credit - a.debit;
  }
  return list.sort((a, b) => a.account_number.localeCompare(b.account_number));
}

const toItem = (a: AccountBalance) => ({
  id: a.account_id,
  date: a.account_number,
  description: `${a.account_number} - ${a.account_name}`,
  amount: a.balance,
  debit: a.debit,
  credit: a.credit,
});

const sum = (list: AccountBalance[]) => list.reduce((s, a) => s + a.balance, 0);
const byType = (list: AccountBalance[], type: AccountType) => list.filter((a) => a.account_type === type);
/** الأصول/الخصوم المتداولة تبدأ بـ 11 / 21 حسب دليل الحسابات */
const startsWith = (list: AccountBalance[], prefix: string) =>
  list.filter((a) => a.account_number.startsWith(prefix));

/** ميزان المراجعة */
export function buildTrialBalance(rows: LedgerRow[]): ReportData {
  const accounts = aggregateByAccount(rows);
  const totalDebit = accounts.reduce((s, a) => s + a.debit, 0);
  const totalCredit = accounts.reduce((s, a) => s + a.credit, 0);
  return {
    sections: [{ title: "ميزان المراجعة", items: accounts.map(toItem) }],
    summary: [
      { label: "إجمالي المدين", value: totalDebit },
      { label: "إجمالي الدائن", value: totalCredit },
      { label: "الفرق", value: totalDebit - totalCredit, isNet: true },
    ],
    type: "trial-balance",
  };
}

/** قائمة الدخل — مبنية على أنواع الحسابات */
export function buildIncomeStatement(rows: LedgerRow[]): ReportData {
  const accounts = aggregateByAccount(rows);
  const revenues = byType(accounts, "revenue");
  const expenses = byType(accounts, "expense");
  const cogs = expenses.filter((a) => a.account_number.startsWith("51"));
  const opex = expenses.filter((a) => !a.account_number.startsWith("51"));

  const totalRevenue = sum(revenues);
  const totalCogs = sum(cogs);
  const grossProfit = totalRevenue - totalCogs;
  const totalOpex = sum(opex);
  const netIncome = grossProfit - totalOpex;

  return {
    sections: [
      { title: "الإيرادات", items: revenues.map(toItem), total: totalRevenue },
      { title: "تكلفة الإيرادات", items: cogs.map(toItem), total: totalCogs },
      { title: "المصروفات التشغيلية", items: opex.map(toItem), total: totalOpex },
    ],
    summary: [
      { label: "إجمالي الإيرادات", value: totalRevenue },
      { label: "مجمل الربح", value: grossProfit },
      { label: "إجمالي المصروفات التشغيلية", value: totalOpex },
      { label: "صافي الربح", value: netIncome, isNet: true },
    ],
    type: "income-statement",
  };
}

/** قائمة المركز المالي */
export function buildBalanceSheet(rows: LedgerRow[]): ReportData {
  const accounts = aggregateByAccount(rows);
  const assets = byType(accounts, "asset");
  const liabilities = byType(accounts, "liability");
  const equity = byType(accounts, "equity");

  const currentAssets = startsWith(assets, "11");
  const nonCurrentAssets = assets.filter((a) => !a.account_number.startsWith("11"));
  const currentLiabilities = startsWith(liabilities, "21");
  const nonCurrentLiabilities = liabilities.filter((a) => !a.account_number.startsWith("21"));

  const netIncome = sum(byType(accounts, "revenue")) - sum(byType(accounts, "expense"));
  const totalAssets = sum(assets);
  const totalLiabilities = sum(liabilities);
  const totalEquity = sum(equity) + netIncome;

  return {
    sections: [
      { title: "الأصول المتداولة", items: currentAssets.map(toItem), total: sum(currentAssets) },
      { title: "الأصول غير المتداولة", items: nonCurrentAssets.map(toItem), total: sum(nonCurrentAssets) },
      { title: "الخصوم المتداولة", items: currentLiabilities.map(toItem), total: sum(currentLiabilities) },
      { title: "الخصوم غير المتداولة", items: nonCurrentLiabilities.map(toItem), total: sum(nonCurrentLiabilities) },
      {
        title: "حقوق الملكية",
        items: [...equity.map(toItem), { id: "net-income", date: "", description: "صافي ربح الفترة", amount: netIncome }],
        total: totalEquity,
      },
    ],
    summary: [
      { label: "إجمالي الأصول", value: totalAssets },
      { label: "إجمالي الخصوم", value: totalLiabilities },
      { label: "إجمالي حقوق الملكية", value: totalEquity },
      { label: "الفرق (أصول - خصوم - ملكية)", value: totalAssets - totalLiabilities - totalEquity, isNet: true },
    ],
    type: "balance-sheet",
  };
}

/** قائمة التدفقات النقدية — حركة الحسابات النقدية (11xx نقدية/بنوك) */
export function buildCashFlowStatement(rows: LedgerRow[]): ReportData {
  const cashRows = rows.filter((r) => r.account_number.startsWith("111"));
  const cashEntryIds = new Set(cashRows.map((r) => r.entry_id));
  const counterRows = rows.filter((r) => cashEntryIds.has(r.entry_id) && !r.account_number.startsWith("111"));

  const classify = (r: LedgerRow) => {
    if (r.account_type === "revenue" || r.account_type === "expense") return "operating";
    if (r.account_number.startsWith("12")) return "investing";
    if (r.account_type === "equity" || r.account_number.startsWith("22")) return "financing";
    return "operating";
  };

  const buckets: Record<string, any[]> = { operating: [], investing: [], financing: [] };
  const totals: Record<string, number> = { operating: 0, investing: 0, financing: 0 };

  for (const r of counterRows) {
    // أثر الحركة على النقدية = عكس اتجاه الطرف المقابل
    const cashEffect = r.credit - r.debit;
    const bucket = classify(r);
    buckets[bucket].push({
      id: r.entry_id,
      date: r.entry_date,
      description: `${r.account_number} - ${r.account_name}: ${r.line_description || r.entry_description}`,
      amount: cashEffect,
    });
    totals[bucket] += cashEffect;
  }

  const net = totals.operating + totals.investing + totals.financing;
  const cashMovement = cashRows.reduce((s, r) => s + r.debit - r.credit, 0);

  return {
    sections: [
      { title: "الأنشطة التشغيلية", items: buckets.operating, total: totals.operating },
      { title: "الأنشطة الاستثمارية", items: buckets.investing, total: totals.investing },
      { title: "الأنشطة التمويلية", items: buckets.financing, total: totals.financing },
    ],
    summary: [
      { label: "صافي التدفق من التشغيل", value: totals.operating },
      { label: "صافي التدفق من الاستثمار", value: totals.investing },
      { label: "صافي التدفق من التمويل", value: totals.financing },
      { label: "صافي التغير في النقدية", value: net || cashMovement, isNet: true },
    ],
    type: "cash-flow",
  };
}

/** دفتر الأستاذ العام */
export function buildGeneralLedger(rows: LedgerRow[]): ReportData {
  const grouped = new Map<string, LedgerRow[]>();
  for (const r of rows) {
    const key = `${r.account_number} - ${r.account_name}`;
    grouped.set(key, [...(grouped.get(key) ?? []), r]);
  }
  return {
    sections: [...grouped.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([title, items]) => ({
        title: `حساب: ${title}`,
        items: items
          .sort((a, b) => a.entry_date.localeCompare(b.entry_date))
          .map((r) => ({
            id: r.entry_id,
            date: r.entry_date,
            description: r.line_description || r.entry_description,
            debit: r.debit,
            credit: r.credit,
            amount: r.debit - r.credit,
          })),
        total: items.reduce((s, r) => s + r.debit - r.credit, 0),
      })),
    type: "general-ledger",
  };
}

export async function generateFinancialReport(
  reportType: string,
  startDate: string,
  endDate: string
): Promise<ReportData> {
  const rows = await fetchLedgerRows(startDate, endDate);
  switch (reportType) {
    case "balance-sheet":
      return buildBalanceSheet(rows);
    case "cash-flow":
      return buildCashFlowStatement(rows);
    case "general-ledger":
      return buildGeneralLedger(rows);
    case "trial-balance":
      return buildTrialBalance(rows);
    default:
      return buildIncomeStatement(rows);
  }
}
