
import AppLayout from "@/components/AppLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { NotificationsList } from "@/components/dashboard/NotificationsList";
import { CashFlowChart } from "@/components/dashboard/CashFlowChart";
import { FinancialChart } from "@/components/dashboard/FinancialChart";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Wallet,
  Users,
  FileCheck,
  Building2,
  AlertCircle
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { CompanyInfo, Partner, CapitalManagement } from "@/types/database";

export default function DashboardPage() {
  // جلب معلومات الشركة
  const { data: companyData, isLoading: isLoadingCompany } = useQuery({
    queryKey: ['company_info'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("Company_Info")
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      return data as CompanyInfo;
    }
  });

  // جلب الشركاء
  const { data: partners, isLoading: isLoadingPartners } = useQuery({
    queryKey: ['company_partners'],
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
  const { data: capitalData, isLoading: isLoadingCapital } = useQuery({
    queryKey: ['capital_management'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("Capital_Management")
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      return data as CapitalManagement;
    }
  });

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-6 p-6">
        {/* معلومات الشركة */}
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
                  <p><strong>الرقم الموحد:</strong> {companyData["Unified National Number"]}</p>
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
        </div>

        {/* بطاقات المؤشرات الرئيسية */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard
            title="رأس المال المتاح"
            value={capitalData ? `${capitalData.available_capital?.toLocaleString()} ريال` : "0 ريال"}
            description={capitalData ? `من إجمالي ${capitalData.total_capital?.toLocaleString()} ريال` : "لا يوجد بيانات"}
            icon={Wallet}
          />

          <StatCard
            title="الشركاء"
            value={partners?.length || 0}
            description="إجمالي عدد الشركاء"
            icon={Users}
          />

          <StatCard
            title="التأمينات الاجتماعية"
            value={"محتسب تلقائياً"}
            description="إجمالي التأمينات الشهرية"
            icon={FileCheck}
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
