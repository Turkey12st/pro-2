import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CapitalDetails } from "@/components/dashboard/capital/CapitalDetails";
import { CapitalIncreaseDialog } from "@/components/dashboard/capital/CapitalIncreaseDialog";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/shared/PageShell";
import { Building2, ArrowUpDown, LineChart, Download, RefreshCw, WalletCards, AlertCircle } from "lucide-react";

const moneyFormatter = new Intl.NumberFormat("ar-SA", {
  style: "currency",
  currency: "SAR",
  maximumFractionDigits: 0,
});

export default function CapitalManagementPage() {
  const [activeTab, setActiveTab] = React.useState("overview");
  const capitalQuery = useQuery({
    queryKey: ["capital_management"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("capital_management")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const historyQuery = useQuery({
    queryKey: ["capital_history"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("capital_history")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      return data || [];
    },
  });

  const capitalData = capitalQuery.data;
  const capitalHistory = historyQuery.data || [];
  const isRefreshing = capitalQuery.isFetching || historyQuery.isFetching;
  const queryError = capitalQuery.error || historyQuery.error;

  const refreshData = () => {
    void capitalQuery.refetch();
    void historyQuery.refetch();
  };

  return (
    <PageShell
      title="إدارة رأس المال"
      description="متابعة رأس المال المتاح والمخصص وسجل التغيرات المالية بصورة موحدة."
      icon={WalletCards}
      actions={
        <div className="page-action-group">
          <Button variant="outline" className="h-10 flex-1 gap-2 rounded-xl sm:flex-none" onClick={refreshData} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            تحديث البيانات
          </Button>
          {capitalData && <CapitalIncreaseDialog capitalData={capitalData} />}
        </div>
      }
    >
      {queryError && (
        <div role="alert" className="flex flex-col gap-3 rounded-2xl border border-destructive/25 bg-destructive/5 p-4 text-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
            <span>تعذر جلب بعض بيانات رأس المال. تحقق من الصلاحية أو أعد المحاولة.</span>
          </div>
          <Button variant="outline" size="sm" className="w-full border-destructive/25 sm:w-auto" onClick={refreshData}>إعادة المحاولة</Button>
        </div>
      )}

      <section className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-4 lg:gap-6">
        <Card className="data-surface lg:col-span-3">
          <CardHeader className="border-b border-border/50 pb-4">
            <CardTitle className="text-lg sm:text-xl">ملخص رأس المال</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            {capitalQuery.isLoading ? (
              <div className="grid gap-4 sm:grid-cols-3">
                {[1, 2, 3].map((item) => <div key={item} className="h-28 skeleton-premium" />)}
              </div>
            ) : capitalData ? (
              <CapitalDetails data={capitalData} />
            ) : (
              <div className="rounded-2xl border border-dashed border-border bg-muted/25 px-5 py-10 text-center">
                <Building2 className="mx-auto mb-3 h-8 w-8 text-primary" />
                <p className="font-semibold">لا يوجد سجل لرأس المال بعد</p>
                <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-muted-foreground">
                  لا ينشئ النظام سجلاً تلقائياً عند القراءة. أنشئ السجل الأول من عملية مالية معتمدة للحفاظ على أثر تدقيقي واضح.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="data-surface">
          <CardHeader className="border-b border-border/50 pb-4">
            <CardTitle className="text-base">ملخص سريع</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-muted-foreground">السنة المالية</span>
              <span className="font-semibold">{capitalData?.fiscal_year ?? "—"}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-muted-foreground">معدل الدوران</span>
              <span className="font-semibold">{capitalData?.turnover_rate ?? "—"}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-muted-foreground">آخر تحديث</span>
              <span className="text-left text-sm font-medium">
                {capitalData?.last_updated ? new Date(capitalData.last_updated).toLocaleDateString("ar-SA") : "—"}
              </span>
            </div>
          </CardContent>
        </Card>
      </section>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="min-w-0">
        <div className="overflow-x-auto pb-1">
          <TabsList className="h-auto min-w-max gap-1 rounded-xl bg-muted/70 p-1">
            <TabsTrigger value="overview" className="gap-2 rounded-lg px-3 py-2.5 text-xs sm:px-4 sm:text-sm">
              <Building2 className="h-4 w-4" /> نظرة عامة
            </TabsTrigger>
            <TabsTrigger value="transactions" className="gap-2 rounded-lg px-3 py-2.5 text-xs sm:px-4 sm:text-sm">
              <ArrowUpDown className="h-4 w-4" /> معاملات رأس المال
            </TabsTrigger>
            <TabsTrigger value="analysis" className="gap-2 rounded-lg px-3 py-2.5 text-xs sm:px-4 sm:text-sm">
              <LineChart className="h-4 w-4" /> التحليل
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="mt-4">
          <Card className="data-surface">
            <CardContent className="grid gap-4 p-4 sm:grid-cols-2 sm:p-6">
              <div className="rounded-2xl bg-primary/5 p-5">
                <h2 className="font-semibold">ماذا يعرض هذا القسم؟</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  يقيس رأس المال المتاح لتغطية العمليات، والمبالغ المحجوزة، والتغيرات الناتجة من قرارات مالية موثقة.
                </p>
              </div>
              <div className="rounded-2xl bg-muted/50 p-5">
                <h2 className="font-semibold">ضبط مالي أفضل</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  اعتمد أي زيادة أو تخفيض عبر عملية مالية خاضعة للصلاحيات، ثم راجع أثرها من سجل المعاملات بدلاً من تعديل الرصيد يدوياً.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="mt-4">
          <Card className="data-surface">
            <CardHeader className="flex flex-col gap-3 border-b border-border/50 pb-4 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="text-lg">سجل معاملات رأس المال</CardTitle>
              <Button variant="outline" size="sm" className="w-full gap-2 rounded-xl sm:w-auto" disabled>
                <Download className="h-4 w-4" /> التصدير قريباً
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="table-scroll rounded-none border-0">
                <table className="responsive-table">
                  <thead className="bg-muted/60 text-right text-xs text-muted-foreground">
                    <tr>
                      {['التاريخ', 'النوع', 'المبلغ', 'الرصيد السابق', 'الرصيد الجديد', 'الملاحظات'].map((heading) => (
                        <th key={heading} className="whitespace-nowrap px-4 py-3 font-semibold">{heading}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {historyQuery.isLoading ? (
                      <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-muted-foreground">جاري تحميل سجل المعاملات...</td></tr>
                    ) : capitalHistory.length > 0 ? (
                      capitalHistory.map((item: any) => (
                        <tr key={item.id} className="border-t border-border/50 transition-colors hover:bg-muted/30">
                          <td className="whitespace-nowrap px-4 py-3 text-sm">{new Date(item.created_at).toLocaleDateString("ar-SA")}</td>
                          <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${item.transaction_type === "increase" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>{item.transaction_type === "increase" ? "زيادة" : "تخفيض"}</span></td>
                          <td className="whitespace-nowrap px-4 py-3 font-semibold">{moneyFormatter.format(Number(item.amount || 0))}</td>
                          <td className="whitespace-nowrap px-4 py-3">{moneyFormatter.format(Number(item.previous_capital || 0))}</td>
                          <td className="whitespace-nowrap px-4 py-3">{moneyFormatter.format(Number(item.new_capital || 0))}</td>
                          <td className="max-w-[16rem] px-4 py-3 text-sm text-muted-foreground">{item.notes || "—"}</td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-muted-foreground">لا توجد معاملات رأس مال معتمدة حتى الآن.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="mt-4">
          <Card className="data-surface">
            <CardContent className="p-6 text-center sm:p-10">
              <LineChart className="mx-auto h-10 w-10 text-primary" />
              <h2 className="mt-4 text-lg font-semibold">تحليل رأس المال</h2>
              <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted-foreground">سيُبنى التحليل من السجل المالي المعتمد فقط، ليعكس الاتجاهات الحقيقية بدلاً من بيانات افتراضية.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageShell>
  );
}
