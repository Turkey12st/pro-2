
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
  AlertTriangle
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
  ResponsiveContainer
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* بطاقة التنبيهات */}
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

          {/* بطاقة المؤشرات المالية */}
          <Card>
            <CardHeader>
              <CardTitle className="text-primary flex items-center gap-2 text-lg">
                <DollarSign className="h-5 w-5" />
                المؤشرات المالية
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {financials && (
                  <>
                    <div className="flex justify-between items-center">
                      <span>الالتزامات المالية</span>
                      <span className="font-medium">
                        {financials
                          .filter(f => f.status === 'pending')
                          .reduce((acc, curr) => acc + Number(curr.amount), 0)
                          .toLocaleString()} ريال
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>المستحقات المالية</span>
                      <span className="font-medium text-green-600">
                        {financials
                          .filter(f => f.type === 'revenue' && f.status === 'pending')
                          .reduce((acc, curr) => acc + Number(curr.amount), 0)
                          .toLocaleString()} ريال
                      </span>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* بطاقة الوثائق */}
          <Card>
            <CardHeader>
              <CardTitle className="text-primary flex items-center gap-2 text-lg">
                <FileCheck className="h-5 w-5" />
                الوثائق القانونية
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {documents?.filter(doc => {
                  const daysUntilExpiry = Math.ceil(
                    (new Date(doc.expiry_date).getTime() - new Date().getTime()) / 
                    (1000 * 60 * 60 * 24)
                  );
                  return daysUntilExpiry <= 30;
                }).map(doc => (
                  <div key={doc.id} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                    <Calendar className="h-5 w-5 text-yellow-500" />
                    <div>
                      <h4 className="font-medium">{doc.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        تاريخ الانتهاء: {new Date(doc.expiry_date).toLocaleDateString('ar-SA')}
                      </p>
                    </div>
                  </div>
                ))}
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
