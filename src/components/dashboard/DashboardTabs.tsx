
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FinancialSummary } from "@/components/dashboard/FinancialSummary";
import { FinancialChart } from "@/components/dashboard/FinancialChart";
import { CashFlowChart } from "@/components/dashboard/CashFlowChart";
import { NotificationsList } from "@/components/dashboard/NotificationsList";
import { SalarySummary } from "@/components/dashboard/SalarySummary";
import { DocumentExpiryNotifications } from "@/components/dashboard/DocumentExpiryNotifications";
import { 
  BarChart4, 
  FileText,
  Wallet,
  BellIcon,
  TrendingUp,
  LineChart,
  DollarSign,
  CalendarCheck
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts";
import { SalarySummary as SalarySummaryType, FinancialSummaryType } from "@/types/database";

interface DashboardTabsProps {
  financialData: FinancialSummaryType;
  salarySummary: SalarySummaryType;
  notifications: Array<{
    id: string;
    title: string;
    message: string;
    type: string;
    date: string;
  }>;
  expiringDocuments: Array<{
    id: string;
    title: string;
    type: string;
    expiry_date: string;
    days_remaining: number;
    status: string;
  }>;
}

export function DashboardTabs({ financialData, salarySummary, notifications, expiringDocuments }: DashboardTabsProps) {
  // Sample KPI data for financial performance
  const kpiData = [
    { name: 'إيرادات', value: financialData.total_income },
    { name: 'مصروفات', value: financialData.total_expenses },
    { name: 'صافي الربح', value: financialData.net_profit },
  ];

  const COLORS = ['#4f46e5', '#ef4444', '#22c55e', '#eab308'];

  // Sample cash flow trend data
  const cashFlowTrends = [
    { month: 'يناير', income: 42000, expenses: 31500 },
    { month: 'فبراير', income: 52000, expenses: 37800 },
    { month: 'مارس', income: 38000, expenses: 29500 },
    { month: 'أبريل', income: 61000, expenses: 42500 },
    { month: 'مايو', income: 55000, expenses: 38900 },
    { month: 'يونيو', income: 67000, expenses: 44500 },
  ];

  // Formatter for numbers
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ar-SA').format(num);
  };

  return (
    <Tabs defaultValue="financial" className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="financial" className="flex items-center space-x-2 space-x-reverse">
          <BarChart4 className="h-4 w-4 ml-2" />
          <span>الملخص المالي</span>
        </TabsTrigger>
        <TabsTrigger value="documents" className="flex items-center space-x-2 space-x-reverse">
          <FileText className="h-4 w-4 ml-2" />
          <span>المستندات</span>
        </TabsTrigger>
        <TabsTrigger value="salaries" className="flex items-center space-x-2 space-x-reverse">
          <Wallet className="h-4 w-4 ml-2" />
          <span>الرواتب</span>
        </TabsTrigger>
        <TabsTrigger value="performance" className="flex items-center space-x-2 space-x-reverse">
          <TrendingUp className="h-4 w-4 ml-2" />
          <span>مؤشرات الأداء</span>
        </TabsTrigger>
        <TabsTrigger value="notifications" className="flex items-center space-x-2 space-x-reverse">
          <BellIcon className="h-4 w-4 ml-2" />
          <span>الإشعارات</span>
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="financial" className="space-y-4">
        <FinancialSummary data={financialData} />
        <div className="grid gap-4 md:grid-cols-2">
          <FinancialChart />
          <CashFlowChart />
        </div>
      </TabsContent>
      
      <TabsContent value="documents">
        <DocumentExpiryNotifications />
      </TabsContent>
      
      <TabsContent value="salaries">
        <SalarySummary data={salarySummary} />
      </TabsContent>
      
      <TabsContent value="performance" className="space-y-4">
        <h2 className="text-2xl font-semibold mb-4 text-primary">مؤشرات الأداء</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-blue-600" />
                كفاءة رأس المال
              </CardTitle>
              <CardDescription>معدل دوران رأس المال والعائد على الاستثمار</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={kpiData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {kpiData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatNumber(Number(value)) + " ريال"} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">معدل دوران رأس المال</p>
                  <p className="text-xl font-semibold text-blue-600">2.4x</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">العائد على الاستثمار</p>
                  <p className="text-xl font-semibold text-green-600">18.5%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <LineChart className="h-5 w-5 text-purple-600" />
                تدفق النقدية
              </CardTitle>
              <CardDescription>اتجاهات الإيرادات والمصروفات</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={cashFlowTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => `${value / 1000}K`} />
                    <Tooltip formatter={(value) => formatNumber(Number(value)) + " ريال"} />
                    <Area type="monotone" dataKey="income" stackId="1" stroke="#8884d8" fill="#8884d8" />
                    <Area type="monotone" dataKey="expenses" stackId="2" stroke="#ec4899" fill="#ec4899" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">متوسط الإيرادات</p>
                  <p className="text-xl font-semibold text-purple-600">{formatNumber(52500)} ريال</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">متوسط المصروفات</p>
                  <p className="text-xl font-semibold text-pink-600">{formatNumber(37450)} ريال</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <CalendarCheck className="h-5 w-5 text-green-600" />
                الكفاءة التشغيلية
              </CardTitle>
              <CardDescription>معدلات الإنتاجية والأداء</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">هامش الربح التشغيلي</span>
                    <span className="text-sm font-medium text-green-600">
                      {financialData.profit_margin.toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-600 rounded-full" 
                      style={{ width: `${Math.min(financialData.profit_margin, 100)}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">معدل تحصيل المستحقات</span>
                    <span className="text-sm font-medium text-blue-600">76%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: '76%' }}></div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">كفاءة الإنفاق</span>
                    <span className="text-sm font-medium text-amber-600">82%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-600 rounded-full" style={{ width: '82%' }}></div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">الموارد البشرية</span>
                    <span className="text-sm font-medium text-purple-600">91%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-600 rounded-full" style={{ width: '91%' }}></div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-muted-foreground">مؤشر الأداء العام</p>
                <p className="text-xl font-semibold text-green-600">84.5%</p>
                <p className="text-xs text-muted-foreground">تحسن بنسبة 2.3% مقارنة بالشهر السابق</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
      
      <TabsContent value="notifications">
        <NotificationsList />
      </TabsContent>
    </Tabs>
  );
}
