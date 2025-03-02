import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { Calendar as CalendarIcon } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { FinancialSummaryCard } from "@/components/dashboard/FinancialSummaryCard";
import { SalarySummaryCard } from "@/components/dashboard/SalarySummaryCard";
import { CapitalSummary } from "@/components/dashboard/CapitalSummary";
import { NotificationsList } from "@/components/dashboard/NotificationsList";
import { ZakatCalculationCard } from "@/components/dashboard/ZakatCalculationCard";
import { DocumentExpiryNotifications } from "@/components/dashboard/DocumentExpiryNotifications";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CompanyInfo } from "@/types/database";

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
      } else {
        setCompanyInfo(data);
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
