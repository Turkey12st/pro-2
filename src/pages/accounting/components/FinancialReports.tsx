import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileText, Download, Loader2, FileSpreadsheet, File } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { exportToExcel, exportToCSV, exportToPDF } from "@/utils/exportHelpers";

interface JournalEntryItem {
  id: string;
  journal_entry_id: string;
  account_id: string;
  description: string | null;
  debit: number | null;
  credit: number | null;
}

interface JournalEntry {
  id: string;
  entry_date: string;
  description: string;
  total_debit: number;
  total_credit: number;
  status: string;
  entry_type: string | null;
  financial_statement_section: string | null;
  items?: JournalEntryItem[];
}

interface ReportSection {
  title: string;
  items: any[];
  total?: number;
}

interface ReportData {
  sections: ReportSection[];
  summary?: { label: string; value: number; isNet?: boolean }[];
  type: string;
}

export default function FinancialReports() {
  const { toast } = useToast();
  const [reportType, setReportType] = useState("income-statement");
  const [period, setPeriod] = useState("current-month");
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [reportTitle, setReportTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);

  // جلب البيانات من قاعدة البيانات
  const fetchJournalEntries = async () => {
    try {
      const { startDate, endDate } = getDateRange(period);
      
      const { data, error } = await supabase
        .from('journal_entries')
        .select(`
          *,
          items:journal_entry_items(*)
        `)
        .gte('entry_date', startDate)
        .lte('entry_date', endDate)
        .eq('status', 'posted');

      if (error) throw error;
      setJournalEntries(data || []);
      return data || [];
    } catch (error) {
      console.error('Error fetching journal entries:', error);
      toast({
        title: "خطأ في جلب البيانات",
        description: "حدث خطأ أثناء جلب القيود المحاسبية",
        variant: "destructive"
      });
      return [];
    }
  };

  // حساب نطاق التاريخ بناءً على الفترة
  const getDateRange = (selectedPeriod: string) => {
    const now = new Date();
    let startDate: string;
    let endDate: string = now.toISOString().split('T')[0];

    switch (selectedPeriod) {
      case 'current-month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        break;
      case 'previous-month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0];
        endDate = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0];
        break;
      case 'current-quarter':
        const quarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), quarter * 3, 1).toISOString().split('T')[0];
        break;
      case 'year-to-date':
        startDate = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
        break;
      case 'previous-year':
        startDate = new Date(now.getFullYear() - 1, 0, 1).toISOString().split('T')[0];
        endDate = new Date(now.getFullYear() - 1, 11, 31).toISOString().split('T')[0];
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    }

    return { startDate, endDate };
  };

  // قائمة الدخل - وفق المعايير الدولية IFRS
  const generateIncomeStatement = (entries: JournalEntry[]): ReportData => {
    const revenues: any[] = [];
    const costOfSales: any[] = [];
    const operatingExpenses: any[] = [];
    const otherIncome: any[] = [];
    const financingCosts: any[] = [];

    entries.forEach(entry => {
      const section = entry.financial_statement_section || entry.entry_type;
      const item = {
        id: entry.id,
        date: entry.entry_date,
        description: entry.description,
        amount: entry.total_debit || entry.total_credit || 0
      };

      switch (section) {
        case 'revenue':
        case 'income':
          revenues.push(item);
          break;
        case 'cost_of_sales':
        case 'cogs':
          costOfSales.push(item);
          break;
        case 'expense':
        case 'operating_expense':
          operatingExpenses.push(item);
          break;
        case 'other_income':
          otherIncome.push(item);
          break;
        case 'financing':
        case 'interest':
          financingCosts.push(item);
          break;
      }
    });

    const totalRevenue = revenues.reduce((sum, e) => sum + e.amount, 0);
    const totalCostOfSales = costOfSales.reduce((sum, e) => sum + e.amount, 0);
    const grossProfit = totalRevenue - totalCostOfSales;
    const totalOperatingExpenses = operatingExpenses.reduce((sum, e) => sum + e.amount, 0);
    const operatingProfit = grossProfit - totalOperatingExpenses;
    const totalOtherIncome = otherIncome.reduce((sum, e) => sum + e.amount, 0);
    const totalFinancingCosts = financingCosts.reduce((sum, e) => sum + e.amount, 0);
    const netIncome = operatingProfit + totalOtherIncome - totalFinancingCosts;

    return {
      sections: [
        { title: "الإيرادات", items: revenues, total: totalRevenue },
        { title: "تكلفة المبيعات", items: costOfSales, total: totalCostOfSales },
        { title: "المصروفات التشغيلية", items: operatingExpenses, total: totalOperatingExpenses },
        { title: "الإيرادات الأخرى", items: otherIncome, total: totalOtherIncome },
        { title: "تكاليف التمويل", items: financingCosts, total: totalFinancingCosts },
      ],
      summary: [
        { label: "إجمالي الإيرادات", value: totalRevenue },
        { label: "مجمل الربح", value: grossProfit },
        { label: "الربح التشغيلي", value: operatingProfit },
        { label: "صافي الربح", value: netIncome, isNet: true },
      ],
      type: "income-statement",
    };
  };

  // قائمة المركز المالي - وفق المعايير الدولية
  const generateBalanceSheet = (entries: JournalEntry[]): ReportData => {
    const currentAssets: any[] = [];
    const nonCurrentAssets: any[] = [];
    const currentLiabilities: any[] = [];
    const nonCurrentLiabilities: any[] = [];
    const equity: any[] = [];

    entries.forEach(entry => {
      const section = entry.financial_statement_section;
      const item = {
        id: entry.id,
        date: entry.entry_date,
        description: entry.description,
        amount: Math.abs(entry.total_debit - entry.total_credit)
      };

      switch (section) {
        case 'current_asset':
          currentAssets.push(item);
          break;
        case 'non_current_asset':
        case 'fixed_asset':
          nonCurrentAssets.push(item);
          break;
        case 'current_liability':
          currentLiabilities.push(item);
          break;
        case 'non_current_liability':
        case 'long_term_liability':
          nonCurrentLiabilities.push(item);
          break;
        case 'equity':
        case 'capital':
          equity.push(item);
          break;
      }
    });

    const totalCurrentAssets = currentAssets.reduce((sum, e) => sum + e.amount, 0);
    const totalNonCurrentAssets = nonCurrentAssets.reduce((sum, e) => sum + e.amount, 0);
    const totalAssets = totalCurrentAssets + totalNonCurrentAssets;
    const totalCurrentLiabilities = currentLiabilities.reduce((sum, e) => sum + e.amount, 0);
    const totalNonCurrentLiabilities = nonCurrentLiabilities.reduce((sum, e) => sum + e.amount, 0);
    const totalLiabilities = totalCurrentLiabilities + totalNonCurrentLiabilities;
    const totalEquity = equity.reduce((sum, e) => sum + e.amount, 0);

    return {
      sections: [
        { title: "الأصول المتداولة", items: currentAssets, total: totalCurrentAssets },
        { title: "الأصول غير المتداولة", items: nonCurrentAssets, total: totalNonCurrentAssets },
        { title: "الخصوم المتداولة", items: currentLiabilities, total: totalCurrentLiabilities },
        { title: "الخصوم غير المتداولة", items: nonCurrentLiabilities, total: totalNonCurrentLiabilities },
        { title: "حقوق الملكية", items: equity, total: totalEquity },
      ],
      summary: [
        { label: "إجمالي الأصول", value: totalAssets },
        { label: "إجمالي الخصوم", value: totalLiabilities },
        { label: "إجمالي حقوق الملكية", value: totalEquity },
        { label: "التحقق (أصول = خصوم + ملكية)", value: totalAssets - (totalLiabilities + totalEquity), isNet: true },
      ],
      type: "balance-sheet",
    };
  };

  // قائمة التدفقات النقدية
  const generateCashFlowStatement = (entries: JournalEntry[]): ReportData => {
    const operatingActivities: any[] = [];
    const investingActivities: any[] = [];
    const financingActivities: any[] = [];

    entries.forEach(entry => {
      const section = entry.financial_statement_section;
      const item = {
        id: entry.id,
        date: entry.entry_date,
        description: entry.description,
        amount: entry.total_debit - entry.total_credit
      };

      if (['operating', 'revenue', 'expense'].includes(section || '')) {
        operatingActivities.push(item);
      } else if (['investing', 'fixed_asset'].includes(section || '')) {
        investingActivities.push(item);
      } else if (['financing', 'loan', 'capital'].includes(section || '')) {
        financingActivities.push(item);
      }
    });

    const cashFromOperating = operatingActivities.reduce((sum, e) => sum + e.amount, 0);
    const cashFromInvesting = investingActivities.reduce((sum, e) => sum + e.amount, 0);
    const cashFromFinancing = financingActivities.reduce((sum, e) => sum + e.amount, 0);
    const netCashFlow = cashFromOperating + cashFromInvesting + cashFromFinancing;

    return {
      sections: [
        { title: "التدفقات النقدية من الأنشطة التشغيلية", items: operatingActivities, total: cashFromOperating },
        { title: "التدفقات النقدية من الأنشطة الاستثمارية", items: investingActivities, total: cashFromInvesting },
        { title: "التدفقات النقدية من الأنشطة التمويلية", items: financingActivities, total: cashFromFinancing },
      ],
      summary: [
        { label: "صافي التدفق النقدي من التشغيل", value: cashFromOperating },
        { label: "صافي التدفق النقدي من الاستثمار", value: cashFromInvesting },
        { label: "صافي التدفق النقدي من التمويل", value: cashFromFinancing },
        { label: "صافي التغير في النقدية", value: netCashFlow, isNet: true },
      ],
      type: "cash-flow",
    };
  };

  // دفتر الأستاذ العام
  const generateGeneralLedger = (entries: JournalEntry[]): ReportData => {
    const groupedByAccount: { [key: string]: any[] } = {};

    entries.forEach(entry => {
      if (entry.items) {
        entry.items.forEach(item => {
          const accountId = item.account_id || 'غير محدد';
          if (!groupedByAccount[accountId]) {
            groupedByAccount[accountId] = [];
          }
          groupedByAccount[accountId].push({
            id: item.id,
            date: entry.entry_date,
            description: item.description || entry.description,
            debit: item.debit || 0,
            credit: item.credit || 0
          });
        });
      }
    });

    return {
      sections: Object.entries(groupedByAccount).map(([account, items]) => ({
        title: `حساب: ${account}`,
        items,
        total: items.reduce((sum, i) => sum + (i.debit - i.credit), 0)
      })),
      type: "general-ledger",
    };
  };

  const handleGenerateReport = async () => {
    setIsLoading(true);
    setReportData(null);

    try {
      const entries = await fetchJournalEntries();

      let report: ReportData;
      switch (reportType) {
        case "income-statement":
          report = generateIncomeStatement(entries);
          break;
        case "balance-sheet":
          report = generateBalanceSheet(entries);
          break;
        case "cash-flow":
          report = generateCashFlowStatement(entries);
          break;
        case "general-ledger":
          report = generateGeneralLedger(entries);
          break;
        default:
          report = generateIncomeStatement(entries);
      }

      setReportData(report);
      setReportTitle(`${getReportTypeName(reportType)} - ${getPeriodName(period)}`);
      
      toast({
        title: "تم إنشاء التقرير",
        description: `تم إنشاء ${getReportTypeName(reportType)} بنجاح`,
      });
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إنشاء التقرير",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = (format: 'excel' | 'csv' | 'pdf') => {
    if (!reportData) return;

    const flatData = reportData.sections.flatMap(section =>
      section.items.map(item => ({
        ...item,
        section: section.title
      }))
    );

    const columns = [
      { header: 'القسم', key: 'section', width: 20 },
      { header: 'التاريخ', key: 'date', width: 12 },
      { header: 'الوصف', key: 'description', width: 30 },
      { header: 'المبلغ', key: 'amount', width: 15 },
    ];

    const options = {
      filename: `${reportType}_${period}`,
      title: reportTitle,
      sheetName: getReportTypeName(reportType)
    };

    switch (format) {
      case 'excel':
        exportToExcel(flatData, columns, options);
        break;
      case 'csv':
        exportToCSV(flatData, columns, options);
        break;
      case 'pdf':
        exportToPDF(flatData, columns, options);
        break;
    }

    toast({
      title: "تم التصدير",
      description: `تم تصدير التقرير بصيغة ${format.toUpperCase()}`,
    });
  };

  const getReportTypeName = (type: string) => {
    const names: { [key: string]: string } = {
      "income-statement": "قائمة الدخل",
      "balance-sheet": "قائمة المركز المالي",
      "cash-flow": "قائمة التدفقات النقدية",
      "general-ledger": "دفتر الأستاذ العام"
    };
    return names[type] || "التقرير";
  };

  const getPeriodName = (p: string) => {
    const names: { [key: string]: string } = {
      "current-month": "الشهر الحالي",
      "previous-month": "الشهر السابق",
      "current-quarter": "الربع الحالي",
      "year-to-date": "منذ بداية العام",
      "previous-year": "العام السابق"
    };
    return names[p] || "المحددة";
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 2
    }).format(value);
  };

  const renderReportTables = () => {
    if (!reportData) return null;

    return (
      <Card className="mt-8">
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle>{reportTitle}</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => handleExport('excel')}>
              <FileSpreadsheet className="h-4 w-4 ml-2" />
              Excel
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleExport('csv')}>
              <File className="h-4 w-4 ml-2" />
              CSV
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleExport('pdf')}>
              <Download className="h-4 w-4 ml-2" />
              PDF
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {reportData.sections.map((section, index) => (
            <div key={index} className="mb-6">
              <div className="flex justify-between items-center border-b-2 border-primary/20 pb-2 mb-3">
                <h3 className="text-lg font-semibold">{section.title}</h3>
                {section.total !== undefined && (
                  <span className="font-bold text-primary">{formatCurrency(section.total)}</span>
                )}
              </div>
              {section.items.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>التاريخ</TableHead>
                      <TableHead>الوصف</TableHead>
                      {reportData.type === 'general-ledger' ? (
                        <>
                          <TableHead className="text-left">مدين</TableHead>
                          <TableHead className="text-left">دائن</TableHead>
                        </>
                      ) : (
                        <TableHead className="text-left">المبلغ</TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {section.items.map((item, itemIndex) => (
                      <TableRow key={itemIndex}>
                        <TableCell>{item.date}</TableCell>
                        <TableCell>{item.description}</TableCell>
                        {reportData.type === 'general-ledger' ? (
                          <>
                            <TableCell className="text-left">{formatCurrency(item.debit || 0)}</TableCell>
                            <TableCell className="text-left">{formatCurrency(item.credit || 0)}</TableCell>
                          </>
                        ) : (
                          <TableCell className="text-left">{formatCurrency(item.amount)}</TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground text-center py-4">لا توجد بيانات</p>
              )}
            </div>
          ))}

          {reportData.summary && (
            <div className="mt-8 pt-4 border-t-4 border-primary/30 bg-muted/30 rounded-lg p-4">
              <h3 className="text-lg font-bold mb-4">ملخص التقرير</h3>
              <div className="grid gap-3">
                {reportData.summary.map((item, index) => (
                  <div 
                    key={index} 
                    className={`flex justify-between items-center p-3 rounded-lg ${
                      item.isNet ? 'bg-primary text-primary-foreground font-bold text-lg' : 'bg-background'
                    }`}
                  >
                    <span>{item.label}</span>
                    <span>{formatCurrency(item.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            التقارير المالية
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            إنشاء تقارير مالية متوافقة مع المعايير الدولية IFRS
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">نوع التقرير</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر نوع التقرير" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income-statement">قائمة الدخل</SelectItem>
                  <SelectItem value="balance-sheet">قائمة المركز المالي</SelectItem>
                  <SelectItem value="cash-flow">قائمة التدفقات النقدية</SelectItem>
                  <SelectItem value="general-ledger">دفتر الأستاذ العام</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">الفترة الزمنية</label>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الفترة الزمنية" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current-month">الشهر الحالي</SelectItem>
                  <SelectItem value="previous-month">الشهر السابق</SelectItem>
                  <SelectItem value="current-quarter">الربع الحالي</SelectItem>
                  <SelectItem value="year-to-date">منذ بداية العام</SelectItem>
                  <SelectItem value="previous-year">العام السابق</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button
            className="w-full mt-6"
            onClick={handleGenerateReport}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin ml-2" />
            ) : (
              <FileText className="h-4 w-4 ml-2" />
            )}
            إنشاء {getReportTypeName(reportType)}
          </Button>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="text-center py-12">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-muted-foreground">جاري تحميل التقرير...</p>
        </div>
      )}

      {!isLoading && reportData && renderReportTables()}
    </div>
  );
}
