
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calculator, Info, AlertCircle, CheckCircle2, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/useToast";
import { supabase } from "@/integrations/supabase/client";
import { CompanyInfo } from "@/types/database";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface ZakatCalculatorProps {
  companyInfo: CompanyInfo;
}

// نسب الزكاة والضريبة وفقاً لهيئة الزكاة والضريبة والجمارك
const ZAKAT_RATE = 0.025; // 2.5% نسبة الزكاة الشرعية
const VAT_RATE = 0.15; // 15% ضريبة القيمة المضافة
const INCOME_TAX_RATE_SAUDI = 0; // 0% للسعوديين
const INCOME_TAX_RATE_FOREIGN = 0.20; // 20% للأجانب
const WITHHOLDING_TAX_RATE = 0.05; // 5% ضريبة الاستقطاع

export function ZakatCalculator({ companyInfo }: ZakatCalculatorProps) {
  const { toast } = useToast();
  const [isCalculating, setIsCalculating] = useState(false);
  const [zakatAmount, setZakatAmount] = useState<number | null>(null);
  const [taxAmount, setTaxAmount] = useState<number | null>(null);
  const [vatAmount, setVatAmount] = useState<number | null>(null);

  // جلب أحدث بيانات زكاة للشركة
  const { data: latestZakat, refetch: refetchZakat } = useQuery({
    queryKey: ["latest_zakat"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("zakat_calculations")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching zakat data:", error);
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

  // جلب بيانات المبيعات لحساب ضريبة القيمة المضافة
  const { data: salesData } = useQuery({
    queryKey: ["sales_for_vat"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("journal_entries")
        .select("amount")
        .ilike("description", "%مبيعات%")
        .gte("entry_date", `${new Date().getFullYear()}-01-01`);

      if (error) {
        console.error("Error fetching sales data:", error);
        return [];
      }
      return data || [];
    },
  });

  // حساب الزكاة والضريبة وفقاً لنظام هيئة الزكاة والضريبة والجمارك
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
      // حساب الوعاء الزكوي وفقاً لنظام هيئة الزكاة
      // الوعاء الزكوي = رأس المال + الأرباح المحتجزة + الاحتياطيات - الأصول الثابتة (مخصوم جزئياً)
      const retainedEarnings = capitalData.available_capital - capitalData.total_capital;
      const reserves = capitalData.reserved_capital || 0;
      
      // تقدير الأصول الثابتة (عادة 30% من رأس المال للشركات الناشئة)
      const estimatedFixedAssets = capitalData.total_capital * 0.30;
      
      // الوعاء الزكوي
      const zakatBase = Math.max(0, 
        capitalData.total_capital + 
        Math.max(0, retainedEarnings) + 
        reserves - 
        estimatedFixedAssets
      );
      
      // حساب الزكاة (2.5% من الوعاء الزكوي)
      const zakatValue = zakatBase * ZAKAT_RATE;
      
      // حساب ضريبة القيمة المضافة من المبيعات
      const totalSales = salesData?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0;
      const vatValue = totalSales * VAT_RATE;
      
      // حساب ضريبة الدخل (0% للسعوديين، 20% للأجانب)
      // نفترض ملكية سعودية كاملة، يمكن تعديلها بناءً على بيانات الشركاء
      const estimatedProfit = capitalData.available_capital * 0.15;
      const incomeTaxValue = estimatedProfit * INCOME_TAX_RATE_SAUDI;
      
      setZakatAmount(zakatValue);
      setVatAmount(vatValue);
      setTaxAmount(incomeTaxValue);

      // تخزين بيانات الحساب في قاعدة البيانات
      const { error } = await supabase
        .from("zakat_calculations")
        .insert([{
          year: new Date().getFullYear(),
          capital_amount: capitalData.total_capital,
          annual_profits: estimatedProfit,
          zakat_amount: zakatValue,
          tax_amount: incomeTaxValue + vatValue,
          status: "pending"
        }]);

      if (error) throw error;

      await refetchZakat();

      toast({
        title: "تم حساب الزكاة والضريبة",
        description: "تم الحساب وفقاً لنظام هيئة الزكاة والضريبة والجمارك",
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

  // حساب نسبة التقدم نحو موعد السداد
  const getPaymentProgress = () => {
    const now = new Date();
    const endOfYear = new Date(now.getFullYear(), 11, 31);
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const totalDays = (endOfYear.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24);
    const daysPassed = (now.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24);
    return Math.round((daysPassed / totalDays) * 100);
  };

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-primary flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            حاسبة الزكاة والضريبة
          </div>
          <Tooltip>
            <TooltipTrigger>
              <Badge variant="outline" className="text-xs">
                <Info className="h-3 w-3 mr-1" />
                هيئة الزكاة
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>محسوبة وفقاً لنظام هيئة الزكاة والضريبة والجمارك</p>
            </TooltipContent>
          </Tooltip>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {capitalData ? (
          <>
            {/* معلومات الشركة */}
            <div className="grid grid-cols-2 gap-4 p-3 bg-muted/50 rounded-lg">
              <div>
                <p className="text-xs text-muted-foreground">رأس المال</p>
                <p className="font-semibold text-lg">{capitalData.total_capital.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">ريال سعودي</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">الرقم الضريبي</p>
                <p className="font-mono text-sm">{companyInfo.tax_number || "غير مسجل"}</p>
                {companyInfo.tax_number ? (
                  <Badge variant="default" className="text-xs mt-1">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    مسجل
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="text-xs mt-1">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    غير مسجل
                  </Badge>
                )}
              </div>
            </div>

            {/* شريط التقدم نحو موعد السداد */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>التقدم نحو نهاية السنة المالية</span>
                <span>{getPaymentProgress()}%</span>
              </div>
              <Progress value={getPaymentProgress()} className="h-2" />
            </div>

            {/* نتائج الحساب */}
            {(zakatAmount !== null || latestZakat) && (
              <div className="space-y-3 p-4 bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 rounded-lg border">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <Calculator className="h-4 w-4" />
                  نتائج الحساب
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-2 bg-white dark:bg-gray-800 rounded-md shadow-sm">
                    <p className="text-xs text-muted-foreground">الزكاة الشرعية (2.5%)</p>
                    <p className="font-bold text-green-600 text-lg">
                      {(zakatAmount ?? latestZakat?.zakat_amount ?? 0).toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">ريال</p>
                  </div>
                  <div className="p-2 bg-white dark:bg-gray-800 rounded-md shadow-sm">
                    <p className="text-xs text-muted-foreground">ضريبة القيمة المضافة (15%)</p>
                    <p className="font-bold text-blue-600 text-lg">
                      {(vatAmount ?? 0).toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">ريال</p>
                  </div>
                  <div className="p-2 bg-white dark:bg-gray-800 rounded-md shadow-sm">
                    <p className="text-xs text-muted-foreground">ضريبة الدخل</p>
                    <p className="font-bold text-purple-600 text-lg">
                      {(taxAmount ?? latestZakat?.tax_amount ?? 0).toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">ريال</p>
                  </div>
                </div>
              </div>
            )}

            {/* آخر تحديث */}
            {latestZakat && (
              <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-3">
                <span>آخر حساب: {new Date(latestZakat.created_at).toLocaleDateString("ar-SA")}</span>
                <a 
                  href="https://zatca.gov.sa" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-primary hover:underline"
                >
                  هيئة الزكاة والضريبة
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}

            {/* زر الحساب */}
            <Button 
              onClick={calculateZakat} 
              className="w-full flex items-center gap-2"
              disabled={isCalculating}
              size="lg"
            >
              <Calculator className="h-4 w-4" />
              {isCalculating ? "جاري الحساب..." : "حساب الزكاة والضريبة"}
            </Button>

            {/* تنبيه */}
            <p className="text-xs text-muted-foreground text-center">
              * هذا الحساب تقديري ويجب مراجعته مع محاسب معتمد
            </p>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <Calculator className="h-12 w-12 mb-3 opacity-50" />
            <p>جاري تحميل بيانات رأس المال...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
