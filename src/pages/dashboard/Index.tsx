
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { CapitalSummary } from "@/components/dashboard/CapitalSummary";
import { NotificationsList } from "@/components/dashboard/NotificationsList";
import { DocumentExpiryNotifications } from "@/components/dashboard/DocumentExpiryNotifications";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CompanyInfo } from "@/types/database";

// Create placeholders for missing components
const FinancialSummaryCard = () => (
  <Card>
    <CardContent className="p-6">
      <h3 className="text-xl font-semibold mb-4">ملخص مالي</h3>
      <p className="text-muted-foreground">
        بيانات الملخص المالي غير متوفرة حالياً
      </p>
    </CardContent>
  </Card>
);

const SalarySummaryCard = () => (
  <Card>
    <CardContent className="p-6">
      <h3 className="text-xl font-semibold mb-4">ملخص الرواتب</h3>
      <p className="text-muted-foreground">
        بيانات ملخص الرواتب غير متوفرة حالياً
      </p>
    </CardContent>
  </Card>
);

const ZakatCalculationCard = ({ companyInfo }: { companyInfo: CompanyInfo }) => (
  <Card>
    <CardContent className="p-6">
      <h3 className="text-xl font-semibold mb-4">حاسبة الزكاة</h3>
      <p className="text-muted-foreground">
        حاسبة الزكاة غير متوفرة حالياً
      </p>
    </CardContent>
  </Card>
);

export default function Dashboard() {
  const [date, setDate] = useState(new Date());
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);

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

  useEffect(() => {
    const fetchCompanyInfo = async () => {
      const { data, error } = await supabase
        .from('company_Info')
        .select('*')
        .limit(1)
        .single();

      if (error) {
        console.error("Error fetching company info:", error);
      } else if (data) {
        // Transform data to match CompanyInfo interface
        const addressData = typeof data.address === 'object' ? data.address : { street: "", city: "", postal_code: "" };
        
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
          address: {
            street: addressData.street || "",
            city: addressData.city || "",
            postal_code: addressData.postal_code || ""
          },
          license_expiry_date: data.license_expiry_date || null,
          created_at: data.created_at
        };
        
        setCompanyInfo(companyData);
      }
    };

    fetchCompanyInfo();
  }, []);

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
        <FinancialSummaryCard />
        <SalarySummaryCard />
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
          <ZakatCalculationCard companyInfo={companyInfo} />
        ) : (
          <Card>
            <CardContent>
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
