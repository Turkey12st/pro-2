
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { CapitalSummary } from "@/components/dashboard/CapitalSummary";
import { NotificationsList } from "@/components/dashboard/NotificationsList";
import { DocumentExpiryNotifications } from "@/components/dashboard/DocumentExpiryNotifications";
import { FinancialSummary } from "@/components/dashboard/FinancialSummary";
import { SalarySummary } from "@/components/dashboard/SalarySummary";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CompanyInfo, FinancialSummaryType } from "@/types/database";
import { ZakatCalculator } from "@/components/dashboard/ZakatCalculator";
import { useToast } from "@/hooks/useToast";

export default function Dashboard() {
  const [date, setDate] = useState(new Date());
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const { toast } = useToast();

  const { data: capitalData, isLoading: isCapitalLoading } = useQuery({
    queryKey: ["capital_management"],
    queryFn: async () => {
      const currentYear = new Date().getFullYear();
      const { data, error } = await supabase
        .from("capital_management")
        .select("*")
        .eq("fiscal_year", currentYear)
        .single();

      if (error) throw error;
      return data;
    },
  });

  // Define mock financial data
  const financialData: FinancialSummaryType = {
    total_income: 250000,
    total_expenses: 180000,
    net_profit: 70000,
    profit_margin: 28
  };

  useEffect(() => {
    const fetchCompanyInfo = async () => {
      const { data, error } = await supabase
        .from('company_Info')
        .select('*')
        .limit(1)
        .single();

      if (error) {
        console.error("Error fetching company info:", error);
        toast({
          title: "خطأ في جلب بيانات الشركة",
          description: "يرجى التحقق من اتصالك بالإنترنت أو التواصل مع الإدارة",
          variant: "destructive"
        });
      } else if (data) {
        // تحويل بيانات العنوان إلى الشكل المناسب
        let addressData;
        
        // التعامل مع حالة عدم وجود عنوان
        if (!data.address) {
          addressData = { street: "", city: "", postal_code: "" };
        } 
        // التعامل مع حالة إذا كان العنوان كائن
        else if (typeof data.address === 'object' && !Array.isArray(data.address)) {
          addressData = {
            street: (data.address as any)?.street || "",
            city: (data.address as any)?.city || "",
            postal_code: (data.address as any)?.postal_code || ""
          };
        } 
        // حالة إذا كان العنوان سلسلة نصية أو أي نوع آخر
        else {
          addressData = { street: "", city: "", postal_code: "" };
        }
        
        const companyData: CompanyInfo = {
          id: data.id,
          company_name: data.company_name,
          company_type: data.company_type,
          establishment_date: data.establishment_date,
          commercial_registration: data.commercial_registration,
          unified_national_number: data["Unified National Number"]?.toString() || "",
          social_insurance_number: data.social_insurance_number || "",
          hrsd_number: data.hrsd_number || "",
          bank_name: data.bank_name || "",
          bank_iban: data.bank_iban || "",
          nitaqat_activity: data.nitaqat_activity || "",
          economic_activity: data.economic_activity || "",
          tax_number: data.tax_number || "",
          address: addressData,
          license_expiry_date: data.license_expiry_date || null,
          created_at: data.created_at
        };
        
        setCompanyInfo(companyData);
      }
    };

    fetchCompanyInfo();
  }, [toast]);

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-start mb-6">
        <h1 className="text-2xl font-bold">لوحة المعلومات</h1>
        <Button variant="outline">
          <Calendar className="mr-2 h-4 w-4" />
          {date.toLocaleDateString("ar-SA", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <FinancialSummary data={financialData} />
        <SalarySummary />
        <CapitalSummary data={capitalData || {
          fiscal_year: new Date().getFullYear(),
          total_capital: 0,
          available_capital: 0,
          reserved_capital: 0,
          notes: ""
        }} isLoading={isCapitalLoading} />
        
        <div>
          <DocumentExpiryNotifications />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <NotificationsList />
        {companyInfo ? (
          <ZakatCalculator companyInfo={companyInfo} />
        ) : (
          <Card>
            <CardContent className="p-6">
              <p className="text-muted-foreground">
                جاري تحميل معلومات الشركة لحساب الزكاة...
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
