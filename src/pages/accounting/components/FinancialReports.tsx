import React, { useState } from "react";
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
import { FileText, Download } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";


// Hardcoded mock data to simulate journal entries from a database
const MOCK_JOURNAL_ENTRIES = [
  // Revenue entries
  { id: 1, date: "2024-07-15", type: "revenue", account: "المبيعات", description: "بيع منتجات", amount: 5000, period: "current-month", category: "revenue" },
  { id: 2, date: "2024-07-20", type: "revenue", account: "المبيعات", description: "خدمات استشارية", amount: 2500, period: "current-month", category: "revenue" },
  { id: 3, date: "2024-06-10", type: "revenue", account: "المبيعات", description: "بيع منتجات", amount: 4000, period: "previous-month", category: "revenue" },
  // Expense entries
  { id: 4, date: "2024-07-05", type: "expense", account: "الإيجار", description: "إيجار المكتب", amount: 1500, period: "current-month", category: "expense" },
  { id: 5, date: "2024-07-18", type: "expense", account: "الرواتب", description: "رواتب الموظفين", amount: 3000, period: "current-month", category: "expense" },
  { id: 6, date: "2024-06-25", type: "expense", account: "المرافق", description: "فواتير الكهرباء", amount: 500, period: "previous-month", category: "expense" },
  // Asset entries
  { id: 7, date: "2024-07-01", type: "asset", account: "النقدية", description: "رصيد بداية الشهر", amount: 10000, period: "current-month", category: "asset" },
  { id: 8, date: "2024-07-01", type: "asset", account: "المعدات", description: "شراء معدات", amount: 7000, period: "current-month", category: "asset" },
  // Liability and Equity entries
  { id: 9, date: "2024-07-03", type: "liability", account: "قرض بنكي", description: "قرض قصير الأجل", amount: 5000, period: "current-month", category: "liability" },
  { id: 10, date: "2024-07-01", type: "equity", account: "رأس المال", description: "استثمار المالك", amount: 15000, period: "current-month", category: "equity" },
];

export default function FinancialReports() {
  const { toast } = useToast();
  const [reportType, setReportType] = useState("income-statement");
  const [period, setPeriod] = useState("current-month");
  const [reportData, setReportData] = useState(null);
  const [reportTitle, setReportTitle] = useState("");

  // Function to filter journal entries based on the selected period
  const filterEntriesByPeriod = (entries, selectedPeriod) => {
    return entries.filter(entry => entry.period === selectedPeriod);
  };

  // Function to generate the Income Statement
  const generateIncomeStatement = (entries) => {
    const revenues = entries.filter(e => e.category === "revenue");
    const expenses = entries.filter(e => e.category === "expense");

    const totalRevenue = revenues.reduce((sum, entry) => sum + entry.amount, 0);
    const totalExpenses = expenses.reduce((sum, entry) => sum + entry.amount, 0);
    const netIncome = totalRevenue - totalExpenses;

    const report = {
      sections: [
        { title: "الإيرادات", items: revenues },
        { title: "المصروفات", items: expenses },
      ],
      summary: [
        { label: "إجمالي الإيرادات", value: totalRevenue },
        { label: "إجمالي المصروفات", value: totalExpenses },
        { label: "صافي الدخل", value: netIncome },
      ],
    };
    return report;
  };

  // Function to generate the Balance Sheet
  const generateBalanceSheet = (entries) => {
    const assets = entries.filter(e => e.category === "asset");
    const liabilities = entries.filter(e => e.category === "liability");
    const equity = entries.filter(e => e.category === "equity");
    
    const totalAssets = assets.reduce((sum, entry) => sum + entry.amount, 0);
    const totalLiabilities = liabilities.reduce((sum, entry) => sum + entry.amount, 0);
    const totalEquity = equity.reduce((sum, entry) => sum + entry.amount, 0);
    
    const report = {
      sections: [
        { title: "الأصول", items: assets },
        { title: "الخصوم", items: liabilities },
        { title: "حقوق الملكية", items: equity },
      ],
      summary: [
        { label: "إجمالي الأصول", value: totalAssets },
        { label: "إجمالي الخصوم", value: totalLiabilities },
        { label: "إجمالي حقوق الملكية", value: totalEquity },
      ],
    };
    return report;
  };

  // Main function to handle report generation
  const handleGenerateReport = () => {
    toast({
      title: "جاري إنشاء التقرير",
      description: `جاري إنشاء ${getReportTypeName(reportType)} للفترة ${getPeriodName(period)}`,
    });

    const filteredEntries = filterEntriesByPeriod(MOCK_JOURNAL_ENTRIES, period);

    if (reportType === "income-statement") {
      const statement = generateIncomeStatement(filteredEntries);
      setReportData(statement);
      setReportTitle(getReportTypeName(reportType) + " - " + getPeriodName(period));
    } else if (reportType === "balance-sheet") {
      const sheet = generateBalanceSheet(filteredEntries);
      setReportData(sheet);
      setReportTitle(getReportTypeName(reportType) + " - " + getPeriodName(period));
    } else {
      setReportData(null);
      setReportTitle("");
    }
  };

  const getReportTypeName = (type) => {
    switch (type) {
      case "income-statement":
        return "قائمة الدخل";
      case "balance-sheet":
        return "قائمة المركز المالي";
      case "cash-flow":
        return "قائمة التدفقات النقدية";
      case "general-ledger":
        return "دفتر الأستاذ العام";
      default:
        return "التقرير";
    }
  };

  const getPeriodName = (p) => {
    switch (p) {
      case "current-month":
        return "الشهر الحالي";
      case "previous-month":
        return "الشهر السابق";
      case "current-quarter":
        return "الربع الحالي";
      case "year-to-date":
        return "منذ بداية العام";
      case "previous-year":
        return "العام السابق";
      default:
        return "المحددة";
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>إنشاء تقرير مالي</CardTitle>
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
            className="w-full mt-6 flex items-center gap-2 justify-center"
            onClick={handleGenerateReport}
            disabled={false}
          >
            <FileText className="h-4 w-4" />
            إنشاء {getReportTypeName(reportType)}
          </Button>
        </CardContent>
      </Card>
      
      {reportData && (
        <Card className="mt-8 max-w-4xl mx-auto">
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle>{reportTitle}</CardTitle>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              تصدير
            </Button>
          </CardHeader>
          <CardContent>
            {reportData.sections.map((section, index) => (
              <div key={index} className="mb-4">
                <h3 className="text-lg font-semibold border-b pb-2 mb-2">{section.title}</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>الوصف</TableHead>
                      <TableHead>المبلغ (ريال)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {section.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.description} ({item.account})</TableCell>
                        <TableCell className="text-right">{item.amount.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ))}
            
            <div className="mt-6 pt-4 border-t-2 border-dashed">
              <Table>
                <TableBody>
                  {reportData.summary.map((item, index) => (
                    <TableRow key={index} className="font-bold">
                      <TableCell>{item.label}</TableCell>
                      <TableCell className="text-right text-lg">{item.value.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
          </CardContent>
        </Card>
      )}
    </div>
  );
}
