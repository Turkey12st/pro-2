
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AppLayout from "@/components/AppLayout";
import { useToast } from "@/hooks/use-toast";
import { 
  LineChart, 
  BellRing, 
  Calendar, 
  DollarSign, 
  Users, 
  FileCheck,
  TrendingUp,
  AlertTriangle,
  Wallet,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line
} from "recharts";

export default function DashboardPage() {
  const { toast } = useToast();

  // جلب التنبيهات
  const { data: notifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return data;
    }
  });

  // جلب البيانات المالية
  const { data: financials } = useQuery({
    queryKey: ['financials'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('financials')
        .select('*')
        .order('due_date', { ascending: true });
      
      if (error) throw error;
      return data;
    }
  });

  // جلب بيانات رأس المال
  const { data: capitalData } = useQuery({
    queryKey: ['capital_management'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('capital_management')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (error) throw error;
      return data[0];
    }
  });

  // جلب التدفقات النقدية
  const { data: cashFlow } = useQuery({
    queryKey: ['cash_flow'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cash_flow')
        .select('*')
        .order('transaction_date', { ascending: false })
        .limit(30);
      
      if (error) throw error;
      return data;
    }
  });

  // جلب الوثائق
  const { data: documents } = useQuery({
    queryKey: ['company_documents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('company_documents')
        .select('*')
        .order('expiry_date', { ascending: true });
      
      if (error) throw error;
      return data;
    }
  });

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-6 p-6">
        {/* بطاقات المؤشرات الرئيسية */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* رأس المال المتاح */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">رأس المال المتاح</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {capitalData?.available_capital?.toLocaleString()} ريال
              </div>
              <p className="text-xs text-muted-foreground">
                من إجمالي {capitalData?.total_capital?.toLocaleString()} ريال
              </p>
            </CardContent>
          </Card>

          {/* التدفقات النقدية */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">التدفقات النقدية (30 يوم)</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {cashFlow?.reduce((acc, curr) => 
                  curr.type === 'inflow' ? acc + Number(curr.amount) : acc - Number(curr.amount), 0
                )?.toLocaleString()} ريال
              </div>
              <div className="flex items-center pt-1">
                <ArrowUpRight className="h-4 w-4 text-green-500" />
                <span className="text-green-500 text-sm ml-1">
                  {cashFlow?.filter(cf => cf.type === 'inflow')
                    .reduce((acc, curr) => acc + Number(curr.amount), 0)
                    ?.toLocaleString()} واردات
                </span>
              </div>
            </CardContent>
          </Card>

          {/* المستحقات المالية */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">المستحقات المالية</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {financials?.filter(f => f.status === 'pending' && f.type === 'revenue')
                  .reduce((acc, curr) => acc + Number(curr.amount), 0)
                  ?.toLocaleString()} ريال
              </div>
              <div className="text-xs text-muted-foreground">
                {financials?.filter(f => f.status === 'pending' && f.type === 'revenue').length} مستحق
              </div>
            </CardContent>
          </Card>

          {/* الوثائق المنتهية */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">الوثائق المنتهية</CardTitle>
              <FileCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {documents?.filter(doc => new Date(doc.expiry_date) < new Date()).length}
              </div>
              <p className="text-xs text-muted-foreground">
                وثيقة تحتاج للتجديد
              </p>
            </CardContent>
          </Card>
        </div>

        {/* التنبيهات والمؤشرات */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* التنبيهات */}
          <Card>
            <CardHeader>
              <CardTitle className="text-primary flex items-center gap-2 text-lg">
                <BellRing className="h-5 w-5" />
                التنبيهات العاجلة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notifications?.map((notification) => (
                  <div 
                    key={notification.id} 
                    className="flex items-start gap-3 p-3 bg-muted rounded-lg"
                  >
                    <AlertTriangle className={`h-5 w-5 ${
                      notification.priority === 'high' ? 'text-destructive' : 
                      notification.priority === 'medium' ? 'text-yellow-500' : 
                      'text-blue-500'
                    }`} />
                    <div>
                      <h4 className="font-medium">{notification.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {notification.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* التدفق النقدي */}
          <Card>
            <CardHeader>
              <CardTitle className="text-primary flex items-center gap-2 text-lg">
                <TrendingUp className="h-5 w-5" />
                التدفق النقدي
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {cashFlow && (
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart data={cashFlow}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="transaction_date" />
                      <YAxis />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="amount" 
                        stroke="#4f46e5" 
                        strokeWidth={2}
                      />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* مخطط المؤشرات المالية */}
        <Card className="col-span-full">
          <CardHeader>
            <CardTitle className="text-primary flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              تحليل الأداء المالي
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {financials && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={financials}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="due_date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="amount" fill="#4f46e5" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
