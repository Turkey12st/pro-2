
import AppLayout from "@/components/AppLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { NotificationsList } from "@/components/dashboard/NotificationsList";
import { CashFlowChart } from "@/components/dashboard/CashFlowChart";
import { FinancialChart } from "@/components/dashboard/FinancialChart";
import { FinancialSummary } from "@/components/dashboard/FinancialSummary";
import { CapitalSummary } from "@/components/dashboard/CapitalSummary";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Wallet,
  Users,
  FileCheck,
  Building2,
  AlertCircle,
  ArrowUpCircle,
  ArrowDownCircle
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { CompanyInfo, Partner, CapitalManagement, FinancialSummary as FinancialSummaryType } from "@/types/database";

export default function DashboardPage() {
  // جلب معلومات الشركة
  const { data: companyData, isLoading: isLoadingCompany, isError: isErrorCompany } = useQuery({
    queryKey: ['company_info'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("company_Info") // اسم الجدول الصحيح
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      return data as CompanyInfo;
    }
  });

  // جلب الشركاء
  const { data: partners, isLoading: isLoadingPartners, isError: isErrorPartners } = useQuery({
    queryKey: ['partners'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("company_partners")
        .select('*')
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data as Partner[];
    }
  });

  // جلب بيانات رأس المال
  const { data: capitalData, isLoading: isLoadingCapital, isError: isErrorCapital } = useQuery({
    queryKey: ['capital_management'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("capital_management")
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      return data as CapitalManagement;
    }
  });

  // جلب ملخص الأداء المالي
  const { data: financialSummary, isLoading: isLoadingFinancial } = useQuery({
    queryKey: ['financial_summary'],
    queryFn: async () => {
      // جلب الإيرادات
      const { data: incomeData, error: incomeError } = await supabase
        .from("journal_entries")
        .select('amount')
        .gte('amount', 0)
        .eq('entry_type', 'income');
      
      if (incomeError) throw incomeError;
      
      // جلب المصروفات
      const { data: expensesData, error: expensesError } = await supabase
        .from("journal_entries")
        .select('amount')
        .lt('amount', 0)
        .eq('entry_type', 'expense');
      
      if (expensesError) throw expensesError;
      
      const totalIncome = incomeData.reduce((acc, curr) => acc + curr.amount, 0);
      const totalExpenses = Math.abs(expensesData.reduce((acc, curr) => acc + curr.amount, 0));
      const netProfit = totalIncome - totalExpenses;
      const profitMargin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;
      
      return {
        total_income: totalIncome,
        total_expenses: totalExpenses,
        net_profit: netProfit,
        profit_margin: profitMargin
      } as FinancialSummaryType;
    },
    // في حالة فشل الاستعلام، استخدم بيانات افتراضية
    placeholderData: {
      total_income: 0,
      total_expenses: 0,
      net_profit: 0,
      profit_margin: 0
    }
  });

  // معالجة الأخطاء العامة
  if (isErrorCompany || isErrorPartners || isErrorCapital) {
    return (
      <AppLayout>
        <div className="max-w-7xl mx-auto p-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              حدث خطأ أثناء جلب البيانات. يرجى التحقق من اتصالك بالإنترنت وإعادة المحاولة.
            </AlertDescription>
          </Alert>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-6 p-6">
        {/* معلومات الشركة ورأس المال */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  معلومات الشركة
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingCompany ? (
                <div className="text-center py-4">جاري التحميل...</div>
              ) : companyData ? (
                <div className="space-y-2">
                  <p><strong>اسم الشركة:</strong> {companyData.company_name}</p>
                  <p><strong>نوع الشركة:</strong> {companyData.company_type}</p>
                  <p><strong>تاريخ التأسيس:</strong> {companyData.establishment_date}</p>
                  <p><strong>رقم السجل التجاري:</strong> {companyData.commercial_registration}</p>
                  <p><strong>الرقم الموحد:</strong> {companyData.unified_national_number}</p>
                </div>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    لا توجد معلومات للشركة. قم بإضافة المعلومات الأساسية.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
          {capitalData && !isLoadingCapital ? (
            <CapitalSummary data={capitalData} isLoading={isLoadingCapital} />
          ) : (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    الشركاء
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingPartners ? (
                  <div className="text-center py-4">جاري التحميل...</div>
                ) : partners && partners.length > 0 ? (
                  <div className="space-y-2">
                    {partners.map((partner) => (
                      <div key={partner.id} className="flex justify-between items-center">
                        <span>{partner.name}</span>
                        <span>{partner.ownership_percentage}%</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      لا يوجد شركاء مسجلين. قم بإضافة الشركاء.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* ملخص الأداء المالي */}
        <FinancialSummary data={financialSummary} isLoading={isLoadingFinancial} />

        {/* بطاقات المؤشرات الرئيسية */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard
            title="رأس المال المتاح"
            value={capitalData?.available_capital?.toLocaleString() || "0 ريال"}
            description={`من إجمالي ${capitalData?.total_capital?.toLocaleString() || "0"} ريال`}
            icon={Wallet}
          />
          <StatCard
            title="الإيرادات"
            value={financialSummary?.total_income?.toLocaleString() || "0 ريال"}
            description="إجمالي الإيرادات"
            icon={ArrowUpCircle}
            trend={financialSummary?.net_profit >= 0 ? {
              value: `+${financialSummary?.profit_margin.toFixed(1)}%`,
              icon: ArrowUpCircle,
              className: "text-green-600"
            } : undefined}
          />
          <StatCard
            title="المصروفات"
            value={financialSummary?.total_expenses?.toLocaleString() || "0 ريال"}
            description="إجمالي المصروفات"
            icon={ArrowDownCircle}
          />
        </div>

        {/* المخططات والتنبيهات */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <NotificationsList />
          <CashFlowChart />
        </div>
        <FinancialChart />
      </div>
    </AppLayout>
  );
}
