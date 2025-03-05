
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
import { useToast } from "@/hooks/use-toast";
import { CompanyInfoCard } from "@/components/dashboard/CompanyInfoCard";

export default function Dashboard() {
  const [date, setDate] = useState(new Date());
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const { toast } = useToast();

  // Fetch capital data from capital_management table
  const { data: capitalData, isLoading: isCapitalLoading } = useQuery({
    queryKey: ["capital_management"],
    queryFn: async () => {
      const currentYear = new Date().getFullYear();
      const { data, error } = await supabase
        .from("capital_management")
        .select("*")
        .eq("fiscal_year", currentYear)
        .single();

      if (error) {
        // If no capital data exists, try to calculate from partners
        const { data: partnersData, error: partnersError } = await supabase
          .from("company_partners")
          .select("share_value");

        if (partnersError) throw partnersError;

        // Calculate total capital from partners' share values
        const totalCapital = partnersData.reduce((sum, partner) => sum + (partner.share_value || 0), 0);

        return {
          fiscal_year: currentYear,
          total_capital: totalCapital,
          available_capital: totalCapital * 0.8, // Assume 80% is available
          reserved_capital: totalCapital * 0.2, // Assume 20% is reserved
          notes: "Generated from partners data"
        };
      }
      
      return data;
    },
  });

  // Fetch financial data from journal entries
  const { data: financialData, isLoading: isFinancialLoading } = useQuery({
    queryKey: ["financial_summary"],
    queryFn: async () => {
      // Get current year
      const currentYear = new Date().getFullYear();
      const startDate = `${currentYear}-01-01`;
      const endDate = `${currentYear}-12-31`;

      // Fetch income entries (total_credit > 0)
      const { data: incomeData, error: incomeError } = await supabase
        .from("journal_entries")
        .select("total_credit")
        .gt("total_credit", 0)
        .gte("entry_date", startDate)
        .lte("entry_date", endDate);

      if (incomeError) console.error("Error fetching income:", incomeError);

      // Fetch expense entries (total_debit > 0)
      const { data: expenseData, error: expenseError } = await supabase
        .from("journal_entries")
        .select("total_debit")
        .gt("total_debit", 0)
        .gte("entry_date", startDate)
        .lte("entry_date", endDate);

      if (expenseError) console.error("Error fetching expenses:", expenseError);

      // Calculate totals
      const totalIncome = incomeData?.reduce((sum, item) => sum + (item.total_credit || 0), 0) || 0;
      const totalExpenses = expenseData?.reduce((sum, item) => sum + (item.total_debit || 0), 0) || 0;
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

  useEffect(() => {
    const fetchCompanyInfo = async () => {
      const { data, error } = await supabase
        .from('company_Info')
        .select('*')
        .limit(1)
        .maybeSingle(); // Using maybeSingle instead of single to avoid errors when no data exists

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
        <FinancialSummary 
          data={financialData || {
            total_income: 0,
            total_expenses: 0,
            net_profit: 0,
            profit_margin: 0
          }} 
          isLoading={isFinancialLoading} 
        />
        <SalarySummary />
        <CapitalSummary data={capitalData || {
          fiscal_year: new Date().getFullYear(),
          total_capital: 0,
          available_capital: 0,
          reserved_capital: 0,
          notes: ""
        }} isLoading={isCapitalLoading} />
        
        <CompanyInfoCard />
        
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
