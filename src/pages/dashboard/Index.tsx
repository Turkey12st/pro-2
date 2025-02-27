
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
  ArrowDownCircle,
  PenLine
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CompanyInfoForm } from "@/components/company/CompanyInfoForm";
import type { CompanyInfo, Partner, CapitalManagement, FinancialSummary as FinancialSummaryType } from "@/types/database";

export default function DashboardPage() {
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [showCompanyDialog, setShowCompanyDialog] = useState(false);

  // جلب معلومات الشركة
  const { data: companyData, isLoading: isLoadingCompany, isError: isErrorCompany, refetch: refetchCompany } = useQuery({
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
      return data ? {
        ...data,
        unified_national_number: data?.["Unified National Number"]?.toString() || ""
      } as CompanyInfo : null;
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
          description: `رأس المال الكلي: إجمالي رأس مال الشركة المسجل\nرأس المال المتاح: المبلغ المتاح للاستثمار والمصروفات\nرأس المال المحجوز: المبلغ المخصص للالتزامات والمشاريع القائمة`,
          turnover_rate: 0,
          created_at: new Date().toISOString(),
          last_updated: new Date().toISOString()
        } as CapitalManagement;
      }
      
      return data as CapitalManagement;
    }
  });

  // جلب ملخص الأداء المالي - تم إصلاح مشكلة entry_type
  const { data: financialSummary, isLoading: isLoadingFinancial } = useQuery({
    queryKey: ['financial_summary'],
    queryFn: async () => {
      try {
        // في حالة عدم وجود حقل entry_type، نعتمد على تفاصيل أخرى
        const { data: entries, error } = await supabase
          .from("journal_entries")
          .select('*')
          .in('status', ['active', 'posted']);
        
        if (error) throw error;
        
        if (!entries || entries.length === 0) {
          return {
            total_income: 0,
            total_expenses: 0,
            net_profit: 0,
            profit_margin: 0
          } as FinancialSummaryType;
        }

        // حساب الإيرادات والمصروفات - استناداً إلى total_debit و total_credit
        const totalIncome = entries.reduce((sum, entry) => 
          sum + (entry.total_credit || 0), 0);
        
        const totalExpenses = entries.reduce((sum, entry) => 
          sum + (entry.total_debit || 0), 0);

        const netProfit = totalIncome - totalExpenses;
        const profitMargin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;

        return {
          total_income: totalIncome,
          total_expenses: totalExpenses,
          net_profit: netProfit,
          profit_margin: profitMargin
        } as FinancialSummaryType;
      } catch (error) {
        console.error('Error calculating financial summary:', error);
        return {
          total_income: 0,
          total_expenses: 0,
          net_profit: 0,
          profit_margin: 0
        } as FinancialSummaryType;
      }
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

  // تحديث بيانات الشركة
  const handleCompanyFormSubmit = () => {
    setShowCompanyDialog(false);
    refetchCompany();
  };

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
                <Dialog open={showCompanyDialog} onOpenChange={setShowCompanyDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <PenLine className="h-4 w-4 mr-2" />
                      {companyData ? 'تعديل' : 'إضافة'}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>{companyData ? 'تعديل معلومات الشركة' : 'إضافة معلومات الشركة'}</DialogTitle>
                      <DialogDescription>
                        أدخل بيانات الشركة الأساسية. جميع الحقول المميزة بـ * مطلوبة.
                      </DialogDescription>
                    </DialogHeader>
                    <CompanyInfoForm initialData={companyData} onSuccess={handleCompanyFormSubmit} />
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingCompany ? (
                <div className="text-center py-4">جاري التحميل...</div>
              ) : companyData ? (
                <div className="space-y-2">
                  <p><strong>اسم الشركة:</strong> {companyData.company_name}</p>
                  <p><strong>نوع الشركة:</strong> {companyData.company_type}</p>
                  <p><strong>رقم السجل التجاري:</strong> {companyData.commercial_registration}</p>
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
                <div className="text-center py-6">
                  <Alert className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      لا توجد معلومات للشركة. يرجى إضافة البيانات الأساسية.
                    </AlertDescription>
                  </Alert>
                  <Button onClick={() => setShowCompanyDialog(true)}>
                    إضافة معلومات الشركة
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* كارت رأس المال */}
          <CapitalSummary 
            data={capitalData ? {
              ...capitalData,
              description: `رأس المال الكلي: إجمالي رأس مال الشركة المسجل\nرأس المال المتاح: المبلغ المتاح للاستثمار والمصروفات\nرأس المال المحجوز: المبلغ المخصص للالتزامات والمشاريع القائمة`
            } : undefined} 
            isLoading={isLoadingCapital} 
          />
        </div>

        {/* ملخص الأداء المالي */}
        <FinancialSummary data={financialSummary} isLoading={isLoadingFinancial} />

        {/* بطاقات المؤشرات الرئيسية */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard
            title="رأس المال المتاح"
            value={`${capitalData?.available_capital?.toLocaleString() || "0"} ريال`}
            description={`من إجمالي ${capitalData?.total_capital?.toLocaleString() || "0"} ريال`}
            icon={Wallet}
          />
          <StatCard
            title="الإيرادات"
            value={`${financialSummary?.total_income?.toLocaleString() || "0"} ريال`}
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
            value={`${financialSummary?.total_expenses?.toLocaleString() || "0"} ريال`}
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
