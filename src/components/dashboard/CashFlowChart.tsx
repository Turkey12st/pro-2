import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Calendar, BarChart4 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  AreaChart,
  Area
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { formatSalary } from "@/utils/formatters";
import { Skeleton } from "@/components/ui/skeleton";

export function CashFlowChart() {
  const [timeFrame, setTimeFrame] = useState("monthly");

  const { data: cashFlow, isLoading } = useQuery({
    queryKey: ['cash_flow', timeFrame],
    queryFn: async () => {
      const today = new Date();
      let startDate;
      
      switch (timeFrame) {
        case 'weekly':
          startDate = new Date(today);
          startDate.setDate(today.getDate() - 7);
          break;
        case 'monthly':
          startDate = new Date(today);
          startDate.setMonth(today.getMonth() - 1);
          break;
        case 'quarterly':
          startDate = new Date(today);
          startDate.setMonth(today.getMonth() - 3);
          break;
        case 'yearly':
          startDate = new Date(today);
          startDate.setFullYear(today.getFullYear() - 1);
          break;
      }
      
      const { data, error } = await supabase
        .from('cash_flow')
        .select('*')
        .gte('transaction_date', startDate.toISOString().split('T')[0])
        .order('transaction_date', { ascending: true });
      
      if (error) throw error;
      
      const processedData = data.reduce((acc: any[], entry: any) => {
        const date = entry.transaction_date;
        const existingEntry = acc.find(item => item.date === date);
        
        if (existingEntry) {
          if (entry.type === 'income') {
            existingEntry.income += entry.amount;
          } else if (entry.type === 'expense') {
            existingEntry.expense += entry.amount;
          }
          existingEntry.net = existingEntry.income - existingEntry.expense;
        } else {
          const newEntry = {
            date,
            income: entry.type === 'income' ? entry.amount : 0,
            expense: entry.type === 'expense' ? entry.amount : 0,
            net: 0
          };
          newEntry.net = newEntry.income - newEntry.expense;
          acc.push(newEntry);
        }
        
        return acc;
      }, []);
      
      return processedData;
    }
  });

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  const summaryStats = cashFlow ? cashFlow.reduce((stats, entry) => {
    return {
      totalIncome: stats.totalIncome + entry.income,
      totalExpense: stats.totalExpense + entry.expense,
      netCashFlow: stats.netCashFlow + entry.net
    };
  }, { totalIncome: 0, totalExpense: 0, netCashFlow: 0 }) : { totalIncome: 0, totalExpense: 0, netCashFlow: 0 };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-primary flex items-center gap-2 text-lg">
          <TrendingUp className="h-5 w-5" />
          التدفق النقدي
        </CardTitle>
        <Tabs defaultValue="monthly" value={timeFrame} onValueChange={setTimeFrame} className="h-8">
          <TabsList className="h-8">
            <TabsTrigger value="weekly" className="text-xs h-7">أسبوعي</TabsTrigger>
            <TabsTrigger value="monthly" className="text-xs h-7">شهري</TabsTrigger>
            <TabsTrigger value="quarterly" className="text-xs h-7">ربع سنوي</TabsTrigger>
            <TabsTrigger value="yearly" className="text-xs h-7">سنوي</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-[300px] w-full" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <div className="text-green-500 flex justify-center mb-1">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <p className="text-xs text-muted-foreground">الإيرادات</p>
                <p className="font-bold text-green-600 dir-ltr">{formatSalary(summaryStats.totalIncome)}</p>
              </div>
              <div className="bg-red-50 rounded-lg p-3 text-center">
                <div className="text-red-500 flex justify-center mb-1">
                  <TrendingDown className="h-5 w-5" />
                </div>
                <p className="text-xs text-muted-foreground">المصروفات</p>
                <p className="font-bold text-red-600 dir-ltr">{formatSalary(summaryStats.totalExpense)}</p>
              </div>
              <div className={`${summaryStats.netCashFlow >= 0 ? 'bg-blue-50' : 'bg-amber-50'} rounded-lg p-3 text-center`}>
                <div className={`${summaryStats.netCashFlow >= 0 ? 'text-blue-500' : 'text-amber-500'} flex justify-center mb-1`}>
                  <BarChart4 className="h-5 w-5" />
                </div>
                <p className="text-xs text-muted-foreground">صافي التدفق</p>
                <p className={`font-bold dir-ltr ${summaryStats.netCashFlow >= 0 ? 'text-blue-600' : 'text-amber-600'}`}>
                  {formatSalary(summaryStats.netCashFlow)}
                </p>
              </div>
            </div>
            
            <div className="h-[260px] mt-4">
              {cashFlow && cashFlow.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={cashFlow}>
                    <defs>
                      <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" />
                    <YAxis tickFormatter={(value) => `${formatNumber(value / 1000)}K`} />
                    <CartesianGrid strokeDasharray="3 3" />
                    <Tooltip 
                      formatter={(value: number) => [`${formatNumber(value)} ريال`, ""]}
                      labelFormatter={(label) => `التاريخ: ${label}`}
                    />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="income" 
                      stroke="#10b981" 
                      fillOpacity={1}
                      fill="url(#colorIncome)"
                      name="الإيرادات"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="expense" 
                      stroke="#ef4444" 
                      fillOpacity={1}
                      fill="url(#colorExpense)"
                      name="المصروفات"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="net" 
                      stroke="#3b82f6" 
                      fillOpacity={1}
                      fill="url(#colorNet)"
                      name="الصافي"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-muted-foreground">لا توجد بيانات كافية للعرض</p>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
