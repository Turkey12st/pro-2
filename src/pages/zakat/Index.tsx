
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AppLayout from "@/components/AppLayout";
import { useToast } from "@/components/ui/use-toast";
import { Wallet, Calculator, FileText, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function ZakatPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [capitalAmount, setCapitalAmount] = useState<string>("");
  const [annualProfits, setAnnualProfits] = useState<string>("");
  const [loading, setLoading] = useState(false);

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

  // إضافة حساب زكاة جديد
  const addZakatCalculation = useMutation({
    mutationFn: async (values: { 
      capitalAmount: number;
      annualProfits: number;
      zakatAmount: number;
      taxAmount: number;
    }) => {
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
    onError: (error) => {
      toast({
        title: "حدث خطأ",
        description: "لم نتمكن من حساب الزكاة. الرجاء المحاولة مرة أخرى.",
        variant: "destructive",
      });
      setLoading(false);
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

    // تحويل القيم إلى أرقام
    const capital = parseFloat(capitalAmount);
    const profits = parseFloat(annualProfits);

    // حساب الزكاة (2.5% من مجموع رأس المال والأرباح)
    const totalAmount = capital + profits;
    const zakatAmount = totalAmount * 0.025;

    // حساب الضريبة (15% من الأرباح)
    const taxAmount = profits * 0.15;

    // إضافة الحساب إلى قاعدة البيانات
    addZakatCalculation.mutate({
      capitalAmount: capital,
      annualProfits: profits,
      zakatAmount,
      taxAmount
    });
  };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6 p-6">
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

        {/* سجل الحسابات السابقة */}
        <Card>
          <CardHeader>
            <CardTitle className="text-primary flex items-center gap-2">
              <FileText className="h-5 w-5" />
              سجل حسابات الزكاة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {zakatHistory?.map((calc) => (
                <Card key={calc.id} className="bg-muted">
                  <CardContent className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">رأس المال</p>
                        <p className="font-medium">{calc.capital_amount.toLocaleString()} ريال</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">الأرباح السنوية</p>
                        <p className="font-medium">{calc.annual_profits.toLocaleString()} ريال</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">مبلغ الزكاة</p>
                        <p className="font-medium text-green-600">{calc.zakat_amount.toLocaleString()} ريال</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">مبلغ الضريبة</p>
                        <p className="font-medium text-blue-600">{calc.tax_amount.toLocaleString()} ريال</p>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {new Date(calc.created_at).toLocaleDateString('ar-SA')}
                      </span>
                      <span className={`text-sm px-2 py-1 rounded ${
                        calc.status === 'paid' ? 'bg-green-100 text-green-700' :
                        calc.status === 'overdue' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {calc.status === 'paid' ? 'مدفوع' :
                         calc.status === 'overdue' ? 'متأخر' : 'معلق'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
