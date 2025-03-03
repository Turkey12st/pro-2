
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AppLayout from "@/components/AppLayout";
import { Calculator, FileText, Download, FileCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/useToast";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ZakatPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [capitalAmount, setCapitalAmount] = useState<string>("");
  const [annualProfits, setAnnualProfits] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("calculator");

  // التحقق من تسجيل دخول المستخدم
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth/login");
      }
    };
    
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/auth/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // جلب معلومات الشركة
  const { data: companyInfo } = useQuery({
    queryKey: ['company_info'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('company_Info')
        .select('*')
        .limit(1)
        .single();
      
      if (error) {
        console.error("Error fetching company info:", error);
        return null;
      }
      return data;
    }
  });

  // جلب حسابات الزكاة السابقة
  const { data: zakatHistory } = useQuery({
    queryKey: ['zakat_calculations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('zakat_calculations')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  // جلب تاريخ دفع الزكاة
  const { data: zakatPayments } = useQuery({
    queryKey: ['zakat_payments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('zakat_calculations')
        .select('*')
        .eq('status', 'paid')
        .order('payment_date', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  // إضافة حساب زكاة جديد
  const addZakatCalculation = useMutation({
    mutationFn: async (values: { 
      capitalAmount: number;
      annualProfits: number;
      zakatAmount: number;
      taxAmount: number;
    }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("يجب تسجيل الدخول أولاً");

      const { data, error } = await supabase
        .from('zakat_calculations')
        .insert([{
          year: new Date().getFullYear(),
          capital_amount: values.capitalAmount,
          annual_profits: values.annualProfits,
          zakat_amount: values.zakatAmount,
          tax_amount: values.taxAmount,
          status: 'pending'
        }])
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['zakat_calculations'] });
      toast({
        title: "تم حساب الزكاة بنجاح",
        description: "تم حفظ نتائج الحساب في السجل",
      });
      setCapitalAmount("");
      setAnnualProfits("");
      setLoading(false);
    },
    onError: (error: any) => {
      toast({
        title: "حدث خطأ",
        description: error.message || "لم نتمكن من حساب الزكاة. الرجاء المحاولة مرة أخرى.",
        variant: "destructive",
      });
      setLoading(false);
    }
  });

  // تحديث حالة دفع الزكاة
  const updateZakatStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const paymentData = status === 'paid' 
        ? { status, payment_date: new Date().toISOString() }
        : { status };
        
      const { data, error } = await supabase
        .from('zakat_calculations')
        .update(paymentData)
        .eq('id', id)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['zakat_calculations'] });
      queryClient.invalidateQueries({ queryKey: ['zakat_payments'] });
      toast({
        title: "تم تحديث الحالة",
        description: "تم تحديث حالة دفع الزكاة بنجاح",
      });
    },
    onError: (error: any) => {
      toast({
        title: "حدث خطأ",
        description: error.message || "لم نتمكن من تحديث الحالة. الرجاء المحاولة مرة أخرى.",
        variant: "destructive",
      });
    }
  });

  const handleCalculateZakat = async () => {
    if (!capitalAmount || !annualProfits) {
      toast({
        title: "بيانات غير مكتملة",
        description: "الرجاء إدخال رأس المال والأرباح السنوية",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    const capital = parseFloat(capitalAmount);
    const profits = parseFloat(annualProfits);
    const totalAmount = capital + profits;
    const zakatAmount = totalAmount * 0.025;
    const taxAmount = profits * 0.15;

    addZakatCalculation.mutate({
      capitalAmount: capital,
      annualProfits: profits,
      zakatAmount,
      taxAmount
    });
  };

  // تنزيل تقرير الزكاة كملف نصي
  const handleDownloadReport = (item: any) => {
    const reportContent = `
تقرير حساب الزكاة والضريبة
===============================
التاريخ: ${new Date().toLocaleDateString('ar-SA')}
السنة المالية: ${item.year}

معلومات الشركة:
--------------
اسم الشركة: ${companyInfo?.company_name || "غير متوفر"}
الرقم الضريبي: ${companyInfo?.tax_number || "غير متوفر"}
السجل التجاري: ${companyInfo?.commercial_registration || "غير متوفر"}

تفاصيل الحساب:
------------
رأس المال: ${item.capital_amount.toLocaleString()} ريال
الأرباح السنوية: ${item.annual_profits.toLocaleString()} ريال
إجمالي الوعاء الزكوي: ${(item.capital_amount + item.annual_profits).toLocaleString()} ريال

المستحقات:
---------
مبلغ الزكاة (2.5%): ${item.zakat_amount.toLocaleString()} ريال
ضريبة الدخل (15% من الأرباح): ${item.tax_amount.toLocaleString()} ريال
الإجمالي المستحق: ${(item.zakat_amount + item.tax_amount).toLocaleString()} ريال

الحالة: ${item.status === 'paid' ? 'مدفوع' : item.status === 'overdue' ? 'متأخر' : 'معلق'}
تاريخ الدفع: ${item.payment_date ? new Date(item.payment_date).toLocaleDateString('ar-SA') : 'لم يتم الدفع بعد'}
    `;

    const element = document.createElement('a');
    const file = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `تقرير_زكاة_${item.year}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    toast({
      title: "تم تنزيل التقرير",
      description: "تم تنزيل تقرير الزكاة بنجاح",
    });
  };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6 p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold">الزكاة والضرائب</h1>
            <p className="text-muted-foreground">حساب وإدارة مستحقات الزكاة وضريبة الدخل</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="calculator">
              <Calculator className="h-4 w-4 mr-2" />
              حاسبة الزكاة
            </TabsTrigger>
            <TabsTrigger value="history">
              <FileText className="h-4 w-4 mr-2" />
              سجل الحسابات
            </TabsTrigger>
            <TabsTrigger value="payments">
              <FileCheck className="h-4 w-4 mr-2" />
              المدفوعات
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calculator">
            {/* حاسبة الزكاة */}
            <Card>
              <CardHeader>
                <CardTitle className="text-primary flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  حساب الزكاة والضرائب
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>رأس المال</Label>
                      <Input 
                        type="number" 
                        placeholder="أدخل رأس المال" 
                        value={capitalAmount}
                        onChange={(e) => setCapitalAmount(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>الأرباح السنوية</Label>
                      <Input 
                        type="number" 
                        placeholder="أدخل الأرباح السنوية" 
                        value={annualProfits}
                        onChange={(e) => setAnnualProfits(e.target.value)}
                      />
                    </div>
                  </div>

                  {capitalAmount && annualProfits && (
                    <div className="mt-4 p-4 bg-muted rounded-md">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">مبلغ الزكاة المتوقع (2.5%)</p>
                          <p className="font-semibold text-green-600">
                            {((Number(capitalAmount) + Number(annualProfits)) * 0.025).toLocaleString()} ريال
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">ضريبة الدخل المتوقعة (15%)</p>
                          <p className="font-semibold text-blue-600">
                            {(Number(annualProfits) * 0.15).toLocaleString()} ريال
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <Button 
                    className="w-full flex items-center gap-2"
                    onClick={handleCalculateZakat}
                    disabled={loading}
                  >
                    <Calculator className="h-4 w-4" />
                    {loading ? "جاري الحساب..." : "حساب الزكاة والضرائب"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            {/* سجل حسابات الزكاة */}
            <Card>
              <CardHeader>
                <CardTitle className="text-primary flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  سجل حسابات الزكاة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableCaption>قائمة بجميع عمليات حساب الزكاة السابقة</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>السنة</TableHead>
                      <TableHead>رأس المال</TableHead>
                      <TableHead>الأرباح</TableHead>
                      <TableHead>الزكاة</TableHead>
                      <TableHead>الضريبة</TableHead>
                      <TableHead>الحالة</TableHead>
                      <TableHead>التاريخ</TableHead>
                      <TableHead>الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {zakatHistory?.map((calc) => (
                      <TableRow key={calc.id}>
                        <TableCell>{calc.year}</TableCell>
                        <TableCell>{calc.capital_amount.toLocaleString()}</TableCell>
                        <TableCell>{calc.annual_profits.toLocaleString()}</TableCell>
                        <TableCell className="text-green-600">{calc.zakat_amount.toLocaleString()}</TableCell>
                        <TableCell className="text-blue-600">{calc.tax_amount.toLocaleString()}</TableCell>
                        <TableCell>
                          <span className={`text-xs px-2 py-1 rounded ${
                            calc.status === 'paid' ? 'bg-green-100 text-green-700' :
                            calc.status === 'overdue' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {calc.status === 'paid' ? 'مدفوع' :
                            calc.status === 'overdue' ? 'متأخر' : 'معلق'}
                          </span>
                        </TableCell>
                        <TableCell>{new Date(calc.created_at).toLocaleDateString('ar-SA')}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2 space-x-reverse">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDownloadReport(calc)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            {calc.status !== 'paid' && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="bg-green-50 text-green-600 hover:bg-green-100"
                                onClick={() => updateZakatStatus.mutate({ id: calc.id, status: 'paid' })}
                              >
                                تم الدفع
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {!zakatHistory?.length && (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-6">
                          لا توجد حسابات زكاة سابقة
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments">
            {/* سجل المدفوعات */}
            <Card>
              <CardHeader>
                <CardTitle className="text-primary flex items-center gap-2">
                  <FileCheck className="h-5 w-5" />
                  سجل مدفوعات الزكاة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableCaption>سجل مدفوعات الزكاة والضرائب المسددة</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>السنة</TableHead>
                      <TableHead>إجمالي المبلغ</TableHead>
                      <TableHead>الزكاة</TableHead>
                      <TableHead>الضريبة</TableHead>
                      <TableHead>تاريخ الدفع</TableHead>
                      <TableHead>الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {zakatPayments?.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>{payment.year}</TableCell>
                        <TableCell>{(payment.zakat_amount + payment.tax_amount).toLocaleString()} ريال</TableCell>
                        <TableCell>{payment.zakat_amount.toLocaleString()} ريال</TableCell>
                        <TableCell>{payment.tax_amount.toLocaleString()} ريال</TableCell>
                        <TableCell>{payment.payment_date ? new Date(payment.payment_date).toLocaleDateString('ar-SA') : '-'}</TableCell>
                        <TableCell>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDownloadReport(payment)}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            التقرير
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {!zakatPayments?.length && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-6">
                          لا توجد مدفوعات مسجلة
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
