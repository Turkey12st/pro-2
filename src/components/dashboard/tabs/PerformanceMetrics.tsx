
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, DollarSign, BarChart4 } from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis
} from "recharts";
import { formatNumber } from "@/utils/formatters";
import { FinancialSummaryType } from "@/types/database";

interface PerformanceMetricsProps {
  financialData: FinancialSummaryType;
}

const kpiData = [
  { name: "استثمارات", value: 400000 },
  { name: "أصول", value: 300000 },
  { name: "مبيعات", value: 250000 },
];

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088fe"];

const cashFlowTrends = [
  { month: "يناير", income: 45000, expenses: 32000 },
  { month: "فبراير", income: 52000, expenses: 36000 },
  { month: "مارس", income: 49000, expenses: 39000 },
  { month: "أبريل", income: 58000, expenses: 41000 },
  { month: "مايو", income: 56000, expenses: 38000 },
  { month: "يونيو", income: 54000, expenses: 39000 },
];

export function PerformanceMetrics({ financialData }: PerformanceMetricsProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold mb-4 text-primary">مؤشرات الأداء</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-blue-600" />
              كفاءة رأس المال
            </CardTitle>
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
              <BarChart4 className="h-5 w-5 text-green-600" />
              الكفاءة التشغيلية
            </CardTitle>
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
    </div>
  );
}
