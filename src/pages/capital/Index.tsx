import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CapitalDetails } from '@/components/dashboard/capital/CapitalDetails';
import { CapitalIncreaseDialog } from '@/components/dashboard/capital/CapitalIncreaseDialog';
import { Button } from '@/components/ui/button';
import { Building2, Wallet, ArrowUpDown, LineChart, Download, Upload } from 'lucide-react';
import { CapitalManagement } from '@/types/database';
import AppLayout from '@/components/AppLayout';
export default function CapitalManagementPage() {
  const [activeTab, setActiveTab] = React.useState('overview');
  const {
    data: capitalData,
    isLoading
  } = useQuery({
    queryKey: ['capital_management'],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('capital_management').select('*').order('created_at', {
        ascending: false
      }).limit(1).maybeSingle();
      if (error) throw error;
      if (!data) {
        // If no capital data exists, create a default record
        const currentYear = new Date().getFullYear();
        const defaultCapital: Omit<CapitalManagement, 'created_at'> = {
          total_capital: 0,
          available_capital: 0,
          reserved_capital: 0,
          fiscal_year: currentYear,
          last_updated: new Date().toISOString()
        };
        const {
          data: newData,
          error: insertError
        } = await supabase.from('capital_management').insert([defaultCapital]).select().single();
        if (insertError) throw insertError;
        return newData;
      }
      return data;
    }
  });
  const {
    data: capitalHistory,
    isLoading: isHistoryLoading
  } = useQuery({
    queryKey: ['capital_history'],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('capital_history').select('*').order('created_at', {
        ascending: false
      }).limit(10);
      if (error) throw error;
      return data || [];
    }
  });
  return <AppLayout>
      <div className="container mx-auto p-4 space-y-6">
        <header className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">إدارة رأس المال</h1>
          <div className="space-x-2 space-x-reverse">
            {capitalData && <CapitalIncreaseDialog capitalData={capitalData} />}
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="md:col-span-3">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-center">ملخص رأس المال</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? <div className="text-center py-8">جاري تحميل البيانات...</div> : capitalData ? <CapitalDetails data={capitalData} /> : <div className="text-center py-8">
                  <p className="text-muted-foreground">لا توجد بيانات رأس المال</p>
                </div>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-right">إحصائيات</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">السنة المالية</span>
                <span className="font-bold">{capitalData?.fiscal_year}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">معدل الدوران</span>
                <span className="font-bold">{capitalData?.turnover_rate ?? 'غير متاح'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">آخر تحديث</span>
                <span className="text-sm text-muted-foreground">
                  {capitalData ? new Date(capitalData.last_updated).toLocaleDateString('en-US') : 'غير متاح'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="overview" className="flex items-center space-x-2 space-x-reverse">
              <Building2 className="h-4 w-4 ml-2" />
              <span>نظرة عامة</span>
            </TabsTrigger>
            <TabsTrigger value="transactions" className="flex items-center space-x-2 space-x-reverse">
              <ArrowUpDown className="h-4 w-4 ml-2" />
              <span>معاملات رأس المال</span>
            </TabsTrigger>
            <TabsTrigger value="analysis" className="flex items-center space-x-2 space-x-reverse">
              <LineChart className="h-4 w-4 ml-2" />
              <span>تحليل رأس المال</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-right">معلومات رأس المال</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-right">
                  يمثل رأس المال الأصول المالية المتاحة للشركة لتمويل عملياتها ونموها. 
                  يتضمن ذلك رأس المال المستثمر من قبل المساهمين والأرباح المحتجزة.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg text-right">كيفية زيادة رأس المال</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="list-disc list-inside space-y-2">
                        <li>استثمارات جديدة من المساهمين الحاليين</li>
                        <li>جذب مستثمرين جدد</li>
                        <li>الاحتفاظ بالأرباح بدلاً من توزيعها</li>
                        <li>إصدار أسهم جديدة</li>
                        <li>الحصول على تمويل طويل الأجل</li>
                      </ul>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg text-right">إدارة رأس المال الفعالة</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="list-disc list-inside space-y-2">
                        <li>الحفاظ على نسبة مثالية بين الديون وحقوق الملكية</li>
                        <li>استثمار رأس المال بشكل يحقق عوائد مناسبة</li>
                        <li>مراقبة معدل دوران رأس المال</li>
                        <li>التخطيط المالي طويل المدى</li>
                        <li>تنويع مصادر التمويل</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-center">سجل معاملات رأس المال</CardTitle>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <Download className="h-4 w-4" /> تصدير
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="py-2 px-4 text-right">التاريخ</th>
                        <th className="py-2 px-4 text-right">النوع</th>
                        <th className="py-2 px-4 text-right">المبلغ</th>
                        <th className="py-2 px-4 text-right">رأس المال السابق</th>
                        <th className="py-2 px-4 text-right">رأس المال الجديد</th>
                        <th className="py-2 px-4 text-right">ملاحظات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {isHistoryLoading ? <tr>
                          <td colSpan={6} className="py-4 text-center">جاري تحميل البيانات...</td>
                        </tr> : capitalHistory && capitalHistory.length > 0 ? capitalHistory.map((item: any) => <tr key={item.id} className="border-b hover:bg-muted/50">
                            <td className="py-2 px-4">{new Date(item.created_at).toLocaleDateString('en-US')}</td>
                            <td className="py-2 px-4">
                              <span className={`px-2 py-1 rounded text-xs ${item.transaction_type === 'increase' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {item.transaction_type === 'increase' ? 'زيادة' : 'تخفيض'}
                              </span>
                            </td>
                            <td className="py-2 px-4 dir-ltr text-right">{new Intl.NumberFormat('en-US').format(item.amount)} ريال</td>
                            <td className="py-2 px-4 dir-ltr text-right">{new Intl.NumberFormat('en-US').format(item.previous_capital)} ريال</td>
                            <td className="py-2 px-4 dir-ltr text-right">{new Intl.NumberFormat('en-US').format(item.new_capital)} ريال</td>
                            <td className="py-2 px-4">{item.notes || '-'}</td>
                          </tr>) : <tr>
                          <td colSpan={6} className="py-4 text-center">لا توجد معاملات</td>
                        </tr>}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analysis" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-center">تحليل رأس المال</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-10">
                  <p className="text-muted-foreground">
                    سيتم تفعيل تحليلات رأس المال قريبًا
                  </p>
                  <Button variant="outline" className="mt-4">
                    طلب تقرير مخصص
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>;
}