import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { FileText, Download } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

// --- A mock implementation for toast and ui components, since they're external libraries ---
const useToast = () => ({
  toast: (options) => {
    console.log("Toast:", options);
    alert(options.title + "\n" + options.description);
  },
});
const lucideReact = { FileText, Download };

// Mocking shadcn/ui components with simple div/button replacements
// In a real project, you would import these from the library
const UI = {
  Card: ({ children, className }) => <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>{children}</div>,
  CardContent: ({ children, className }) => <div className={`p-4 ${className}`}>{children}</div>,
  CardHeader: ({ children, className }) => <div className={`pb-2 ${className}`}>{children}</div>,
  CardTitle: ({ children, className }) => <h2 className={`text-2xl font-bold text-center ${className}`}>{children}</h2>,
  Button: ({ children, className, onClick, disabled, variant, size }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded-xl px-4 py-2 font-semibold transition-colors duration-200 
                 ${className}
                 ${variant === 'outline' ? 'border border-gray-300 text-gray-700 hover:bg-gray-100' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
    >
      {children}
    </button>
  ),
  Select: ({ value, onValueChange, children }) => (
    <select value={value} onChange={(e) => onValueChange(e.target.value)} className="w-full p-2 border rounded-xl">
      {children}
    </select>
  ),
  SelectTrigger: ({ children }) => <>{children}</>,
  SelectValue: ({ placeholder }) => <option disabled value="">{placeholder}</option>,
  SelectContent: ({ children }) => <>{children}</>,
  SelectItem: ({ value, children }) => <option value={value}>{children}</option>,
  Table: ({ children }) => <div className="overflow-x-auto"><table className="min-w-full divide-y divide-gray-200">{children}</table></div>,
  TableBody: ({ children }) => <tbody className="bg-white divide-y divide-gray-200">{children}</tbody>,
  TableCell: ({ children, className }) => <td className={`px-6 py-4 whitespace-nowrap ${className}`}>{children}</td>,
  TableHead: ({ children }) => <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{children}</th>,
  TableHeader: ({ children }) => <thead className="bg-gray-50">{children}</thead>,
  TableRow: ({ children, className }) => <tr className={className}>{children}</tr>,
};

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
      <UI.Card className="max-w-4xl mx-auto">
        <UI.CardHeader>
          <UI.CardTitle>إنشاء تقرير مالي</UI.CardTitle>
        </UI.CardHeader>
        <UI.CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">نوع التقرير</label>
              <UI.Select value={reportType} onValueChange={setReportType}>
                <UI.SelectTrigger>
                  <UI.SelectValue placeholder="اختر نوع التقرير" />
                </UI.SelectTrigger>
                <UI.SelectContent>
                  <UI.SelectItem value="income-statement">قائمة الدخل</UI.SelectItem>
                  <UI.SelectItem value="balance-sheet">قائمة المركز المالي</UI.SelectItem>
                  <UI.SelectItem value="cash-flow">قائمة التدفقات النقدية</UI.SelectItem>
                  <UI.SelectItem value="general-ledger">دفتر الأستاذ العام</UI.SelectItem>
                </UI.SelectContent>
              </UI.Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">الفترة الزمنية</label>
              <UI.Select value={period} onValueChange={setPeriod}>
                <UI.SelectTrigger>
                  <UI.SelectValue placeholder="اختر الفترة الزمنية" />
                </UI.SelectTrigger>
                <UI.SelectContent>
                  <UI.SelectItem value="current-month">الشهر الحالي</UI.SelectItem>
                  <UI.SelectItem value="previous-month">الشهر السابق</UI.SelectItem>
                  <UI.SelectItem value="current-quarter">الربع الحالي</UI.SelectItem>
                  <UI.SelectItem value="year-to-date">منذ بداية العام</UI.SelectItem>
                  <UI.SelectItem value="previous-year">العام السابق</UI.SelectItem>
                </UI.SelectContent>
              </UI.Select>
            </div>
          </div>
          <UI.Button
            className="w-full mt-6 flex items-center gap-2 justify-center"
            onClick={handleGenerateReport}
            disabled={false}
          >
            <lucideReact.FileText className="h-4 w-4" />
            إنشاء {getReportTypeName(reportType)}
          </UI.Button>
        </UI.CardContent>
      </UI.Card>
      
      {reportData && (
        <UI.Card className="mt-8 max-w-4xl mx-auto">
          <UI.CardHeader className="flex flex-row justify-between items-center">
            <UI.CardTitle>{reportTitle}</UI.CardTitle>
            <UI.Button variant="outline" size="sm">
              <lucideReact.Download className="h-4 w-4 mr-2" />
              تصدير
            </UI.Button>
          </UI.CardHeader>
          <UI.CardContent>
            {reportData.sections.map((section, index) => (
              <div key={index} className="mb-4">
                <h3 className="text-lg font-semibold border-b pb-2 mb-2">{section.title}</h3>
                <UI.Table>
                  <UI.TableHeader>
                    <UI.TableRow>
                      <UI.TableHead>الوصف</UI.TableHead>
                      <UI.TableHead>المبلغ (ريال)</UI.TableHead>
                    </UI.TableRow>
                  </UI.TableHeader>
                  <UI.TableBody>
                    {section.items.map((item) => (
                      <UI.TableRow key={item.id}>
                        <UI.TableCell>{item.description} ({item.account})</UI.TableCell>
                        <UI.TableCell className="text-right">{item.amount.toLocaleString()}</UI.TableCell>
                      </UI.TableRow>
                    ))}
                  </UI.TableBody>
                </UI.Table>
              </div>
            ))}
            
            <div className="mt-6 pt-4 border-t-2 border-dashed">
              <UI.Table>
                <UI.TableBody>
                  {reportData.summary.map((item, index) => (
                    <UI.TableRow key={index} className="font-bold">
                      <UI.TableCell>{item.label}</UI.TableCell>
                      <UI.TableCell className="text-right text-lg">{item.value.toLocaleString()}</UI.TableCell>
                    </UI.TableRow>
                  ))}
                </UI.TableBody>
              </UI.Table>
            </div>
            
          </UI.CardContent>
        </UI.Card>
      )}
    </div>
  );
}
