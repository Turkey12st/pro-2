
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, TrendingDown, DollarSign, Activity, Calendar, BarChart3 } from "lucide-react";
import { AccountingAutomationService } from "@/services/accountingAutomation";
import { formatSalary } from "@/utils/formatters";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface CashFlowData {
  total_inflow: number;
  total_outflow: number;
  net_flow: number;
  flow_ratio: number;
}

interface CashFlowIndicator {
  label: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  color: string;
}

export default function CashFlowChart() {
  const [cashFlowData, setCashFlowData] = useState<CashFlowData>({
    total_inflow: 0,
    total_outflow: 0,
    net_flow: 0,
    flow_ratio: 0
  });
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [isLoading, setIsLoading] = useState(true);
  const [chartData, setChartData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);

  useEffect(() => {
    loadCashFlowData();
  }, [selectedPeriod]);

  const loadCashFlowData = async () => {
    try {
      setIsLoading(true);
      
      const endDate = new Date();
      const startDate = new Date();
      
      if (selectedPeriod === 'week') {
        startDate.setDate(endDate.getDate() - 7);
      } else if (selectedPeriod === 'month') {
        startDate.setMonth(endDate.getMonth() - 1);
      } else if (selectedPeriod === 'quarter') {
        startDate.setMonth(endDate.getMonth() - 3);
      } else if (selectedPeriod === 'year') {
        startDate.setFullYear(endDate.getFullYear() - 1);
      }

      const data = await AccountingAutomationService.getCashFlowData(
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      );

      setCashFlowData(data);

      // إنشاء بيانات الرسم البياني
      const mockChartData = generateMockChartData(selectedPeriod);
      setChartData(mockChartData);

      // إنشاء بيانات الفئات
      const mockCategoryData = [
        { name: 'الرواتب', value: data.total_outflow * 0.6, color: '#8884d8' },
        { name: 'المصاريف التشغيلية', value: data.total_outflow * 0.25, color: '#82ca9d' },
        { name: 'الاستثمارات', value: data.total_outflow * 0.10, color: '#ffc658' },
        { name: 'أخرى', value: data.total_outflow * 0.05, color: '#ff7300' }
      ];
      setCategoryData(mockCategoryData);

    } catch (error) {
      console.error('Error loading cash flow data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockChartData = (period: string) => {
    const dataPoints = period === 'week' ? 7 : period === 'month' ? 30 : period === 'quarter' ? 90 : 365;
    const data = [];
    
    for (let i = dataPoints; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      data.push({
        date: date.toLocaleDateString('ar-SA'),
        inflow: Math.random() * 50000 + 20000,
        outflow: Math.random() * 40000 + 15000,
        net: Math.random() * 20000 - 10000
      });
    }
    
    return data;
  };

  const getIndicators = (): CashFlowIndicator[] => {
    return [
      {
        label: 'إجمالي الدخل',
        value: cashFlowData.total_inflow,
        change: 12.5,
        trend: 'up',
        color: 'text-green-600'
      },
      {
        label: 'إجمالي المصاريف',
        value: cashFlowData.total_outflow,
        change: -5.2,
        trend: 'down',
        color: 'text-red-600'
      },
      {
        label: 'صافي التدفق',
        value: cashFlowData.net_flow,
        change: 8.3,
        trend: cashFlowData.net_flow >= 0 ? 'up' : 'down',
        color: cashFlowData.net_flow >= 0 ? 'text-green-600' : 'text-red-600'
      },
      {
        label: 'نسبة التدفق',
        value: cashFlowData.flow_ratio,
        change: 2.1,
        trend: 'up',
        color: 'text-blue-600'
      }
    ];
  };

  const getPeriodText = (period: string) => {
    const periodMap = {
      week: 'الأسبوع الماضي',
      month: 'الشهر الماضي',
      quarter: 'الربع الماضي',
      year: 'السنة الماضية'
    };
    return periodMap[period as keyof typeof periodMap] || period;
  };

  if (isLoading) {
    return (
      <Card className="h-[600px]">
        <CardContent className="p-6 h-full flex items-center justify-center">
          <div className="text-center">
            <Activity className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">جاري تحميل بيانات التدفق النقدي...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const indicators = getIndicators();

  return (
    <Card className="h-[600px]">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          التدفق النقدي والمؤشرات المالية
        </CardTitle>
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">الأسبوع الماضي</SelectItem>
            <SelectItem value="month">الشهر الماضي</SelectItem>
            <SelectItem value="quarter">الربع الماضي</SelectItem>
            <SelectItem value="year">السنة الماضية</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* المؤشرات الرئيسية */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {indicators.map((indicator, index) => (
            <div key={index} className="p-4 border rounded-lg bg-background">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">{indicator.label}</span>
                {indicator.trend === 'up' ? (
                  <TrendingUp className={`h-4 w-4 ${indicator.color}`} />
                ) : indicator.trend === 'down' ? (
                  <TrendingDown className={`h-4 w-4 ${indicator.color}`} />
                ) : (
                  <Activity className={`h-4 w-4 ${indicator.color}`} />
                )}
              </div>
              <div className="space-y-1">
                <p className="text-lg font-semibold">
                  {indicator.label.includes('نسبة') 
                    ? `${indicator.value.toFixed(1)}%`
                    : formatSalary(indicator.value)
                  }
                </p>
                <p className={`text-xs flex items-center gap-1 ${
                  indicator.change >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {indicator.change >= 0 ? '+' : ''}{indicator.change.toFixed(1)}%
                  <span className="text-muted-foreground">مقارنة بالفترة السابقة</span>
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* الرسم البياني الخطي للتدفق */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              تطور التدفق النقدي - {getPeriodText(selectedPeriod)}
            </h3>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData.slice(-30)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 10 }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip 
                    formatter={(value: any) => [formatSalary(value), '']}
                    labelFormatter={(label) => `التاريخ: ${label}`}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="inflow" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    name="الدخل"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="outflow" 
                    stroke="#ef4444" 
                    strokeWidth={2}
                    name="المصاريف"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="net" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    name="صافي التدفق"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* الرسم الدائري لتوزيع المصاريف */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              توزيع المصاريف
            </h3>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => formatSalary(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* مؤشرات إضافية */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-muted-foreground">متوسط التدفق اليومي</p>
            <p className="text-lg font-semibold text-blue-600">
              {formatSalary(cashFlowData.net_flow / 30)}
            </p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-muted-foreground">أعلى دخل يومي</p>
            <p className="text-lg font-semibold text-green-600">
              {formatSalary(Math.max(...chartData.map(d => d.inflow)))}
            </p>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <p className="text-sm text-muted-foreground">أعلى مصروف يومي</p>
            <p className="text-lg font-semibold text-red-600">
              {formatSalary(Math.max(...chartData.map(d => d.outflow)))}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
