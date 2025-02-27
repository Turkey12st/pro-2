
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
import { useState, useEffect } from "react";
import type { CompanyInfo, Partner, CapitalManagement, FinancialSummary as FinancialSummaryType } from "@/types/database";

export default function DashboardPage() {
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // جلب معلومات الشركة
  const { data: companyData, isLoading: isLoadingCompany, isError: isErrorCompany } = useQuery({
    queryKey: ['company_info'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("company_Info")
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      
      // تحويل البيانات إلى النوع الصحيح
      return {
        ...data,
        unified_national_number: data?.["Unified National Number"]?.toString() || ""
      } as CompanyInfo;
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
      
      // إذا لم يتم العثور على بيانات، قم بإنشاء بيانات افتراضية
      if (!data) {
        return {
          id: 'default',
          fiscal_year: new Date().getFullYear(),
          total_capital: 100000,
          available_capital: 80000,
          reserved_capital: 20000,
          notes: 'بيانات افتراضية - يرجى تحديثها',
          description: `رأس المال الكلي: إجمالي رأس مال الشركة المسجل
رأس المال المتاح: المبلغ المتاح للاستثمار والمصروفات
رأس المال المحجوز: المبلغ المخصص للالتزامات والمشاريع القائمة`,
          turnover_rate: 0,
          created_at: new Date().toISOString(),
          last_updated: new Date().toISOString()
        } as CapitalManagement;
      }
      
      return data as CapitalManagement;
    }
  });

  // جلب ملخص الأداء المالي
  const { data: financialSummary, isLoading: isLoadingFinancial } = useQuery({
    queryKey: ['financial_summary'],
    queryFn: async () => {
      const { data: entries, error } = await supabase
        .from("journal_entries")
        .select('total_credit, total_debit, entry_type')
        .in('status', ['active', 'posted']);
      
      if (error) throw error;

      const totalIncome = entries?.reduce((sum, entry) => 
        sum + (entry.entry_type === 'income' ? entry.total_credit : 0), 0) || 0;
      
      const totalExpenses = entries?.reduce((sum, entry) => 
        sum + (entry.entry_type === 'expense' ? entry.total_debit : 0), 0) || 0;

      const netProfit = totalIncome - totalExpenses;
      const profitMargin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;

      return {
        total_income: totalIncome,
        total_expenses: totalExpenses,
        net_profit: netProfit,
        profit_margin: profitMargin
      } as FinancialSummaryType;
    }
  });

  // التأكد من تحميل البيانات قبل العرض لتجنب الأخطاء
  useEffect(() => {
    if (!isLoadingCompany && !isLoadingPartners && !isLoadingCapital && !isLoadingFinancial) {
      setIsInitialLoad(false);
    }
  }, [isLoadingCompany, isLoadingPartners, isLoadingCapital, isLoadingFinancial]);

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
                  <p><strong>تاريخ انتهاء الترخيص:</strong> {companyData.license_expiry_date || 'غير محدد'}</p>
                  <p><strong>الرقم الموحد:</strong> {companyData.unified_national_number}</p>
                  <p><strong>رقم المنشأة في التأمينات:</strong> {companyData.social_insurance_number}</p>
                  <p><strong>نشاط نطاقات:</strong> {companyData.nitaqat_activity || 'غير محدد'}</p>
                  <p><strong>النشاط الاقتصادي:</strong> {companyData.economic_activity || 'غير محدد'}</p>
                  <p><strong>الرقم الضريبي:</strong> {companyData.tax_number || 'غير محدد'}</p>
                  <p><strong>اسم البنك:</strong> {companyData.bank_name || 'غير محدد'}</p>
                  <p><strong>رقم الآيبان:</strong> {companyData.bank_iban || 'غير محدد'}</p>
                  <p><strong>العنوان:</strong> {companyData.address ? 
                    `${companyData.address.street || ''}, ${companyData.address.city || ''} ${companyData.address.postal_code || ''}` 
                    : 'غير محدد'}</p>
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
          
          {/* تحديث كارت رأس المال مع إضافة الوصف */}
          <CapitalSummary 
            data={{
              ...capitalData || {
                fiscal_year: new Date().getFullYear(),
                total_capital: 0,
                available_capital: 0,
                reserved_capital: 0,
                notes: ''
              },
              description: `
                رأس المال الكلي: إجمالي رأس مال الشركة المسجل
                رأس المال المتاح: المبلغ المتاح للاستثمار والمصروفات
                رأس المال المحجوز: المبلغ المخصص للالتزامات والمشاريع القائمة
              `
            }} 
            isLoading={isLoadingCapital} 
          />
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
