
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calculator } from "lucide-react";
import { useToast } from "@/hooks/useToast";
import { supabase } from "@/integrations/supabase/client";
import { CompanyInfo } from "@/types/database";
import { useQuery } from "@tanstack/react-query";

interface ZakatCalculatorProps {
  companyInfo: CompanyInfo;
}

export function ZakatCalculator({ companyInfo }: ZakatCalculatorProps) {
  const { toast } = useToast();
  const [isCalculating, setIsCalculating] = useState(false);
  const [zakatAmount, setZakatAmount] = useState<number | null>(null);
  const [taxAmount, setTaxAmount] = useState<number | null>(null);

  // جلب أحدث بيانات زكاة للشركة
  const { data: latestZakat } = useQuery({
    queryKey: ["latest_zakat"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("zakat_calculations")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code !== "PGRST116") { // لا توجد بيانات
          console.error("Error fetching zakat data:", error);
        }
        return null;
      }
      return data;
    },
  });

  // جلب بيانات رأس المال الحالي
  const { data: capitalData } = useQuery({
    queryKey: ["current_capital"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("capital_management")
        .select("*")
        .eq("fiscal_year", new Date().getFullYear())
        .single();

      if (error) {
        console.error("Error fetching capital data:", error);
        return null;
      }
      return data;
    },
  });

  // حساب الزكاة والضريبة
  const calculateZakat = async () => {
    if (!capitalData) {
      toast({
        title: "خطأ في الحساب",
        description: "لا يمكن حساب الزكاة. بيانات رأس المال غير متوفرة.",
        variant: "destructive"
      });
      return;
    }

    setIsCalculating(true);

    try {
      // نفترض قيمة أرباح سنوية للعرض
      const estimatedAnnualProfit = capitalData.total_capital * 0.15; // تقدير بنسبة 15% من رأس المال
      
      // حساب قيمة الزكاة (2.5% من مجموع رأس المال والأرباح)
      const totalAmount = capitalData.total_capital + estimatedAnnualProfit;
      const zakatValue = totalAmount * 0.025;
      
      // حساب قيمة ضريبة الدخل (15% من الأرباح)
      const taxValue = estimatedAnnualProfit * 0.15;
      
      setZakatAmount(zakatValue);
      setTaxAmount(taxValue);

      // تخزين بيانات الحساب في قاعدة البيانات
      const { error } = await supabase
        .from("zakat_calculations")
        .insert([{
          year: new Date().getFullYear(),
          capital_amount: capitalData.total_capital,
          annual_profits: estimatedAnnualProfit,
          zakat_amount: zakatValue,
          tax_amount: taxValue,
          status: "pending"
        }]);

      if (error) throw error;

      toast({
        title: "تم حساب الزكاة والضريبة",
        description: "تم حفظ حساب الزكاة والضريبة بنجاح",
      });
    } catch (error) {
      console.error("Error calculating zakat:", error);
      toast({
        title: "خطأ في الحساب",
        description: "حدث خطأ أثناء حساب الزكاة والضريبة",
        variant: "destructive"
      });
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-primary flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          حاسبة الزكاة
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {capitalData ? (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">رأس المال</p>
                <p className="font-medium">{capitalData.total_capital.toLocaleString()} ريال</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">الرقم الضريبي</p>
                <p className="font-medium">{companyInfo.tax_number || "غير متوفر"}</p>
              </div>
            </div>

            {(zakatAmount !== null && taxAmount !== null) && (
              <div className="mt-4 p-3 bg-muted rounded-md">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">مبلغ الزكاة المقدر</p>
                    <p className="font-semibold text-green-600">{zakatAmount.toLocaleString()} ريال</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">ضريبة الدخل المقدرة</p>
                    <p className="font-semibold text-blue-600">{taxAmount.toLocaleString()} ريال</p>
                  </div>
                </div>
              </div>
            )}

            {latestZakat && (
              <div className="mt-2 text-xs text-muted-foreground">
                آخر حساب: {new Date(latestZakat.created_at).toLocaleDateString("ar-SA")}
              </div>
            )}

            <Button 
              onClick={calculateZakat} 
              className="w-full flex items-center gap-2 mt-4"
              disabled={isCalculating}
            >
              <Calculator className="h-4 w-4" />
              {isCalculating ? "جاري الحساب..." : "حساب الزكاة والضريبة"}
            </Button>
          </>
        ) : (
          <p className="text-muted-foreground">
            جاري تحميل بيانات رأس المال...
          </p>
        )}
      </CardContent>
    </Card>
  );
}
