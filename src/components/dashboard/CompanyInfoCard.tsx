
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CompanyInfoRecord, Address } from "@/types/database";

export interface CompanyInfoCardProps {
  companyId: string;
}

const CompanyInfoCard: React.FC<CompanyInfoCardProps> = ({ companyId = "1" }) => {
  const [company, setCompany] = useState<CompanyInfoRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchCompanyInfo() {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('company_Info')
          .select('*')
          .eq('id', companyId)
          .maybeSingle();

        if (error) {
          console.error("Error fetching company info:", error);
          throw error;
        }

        if (data) {
          let formattedAddress: Address | undefined;
          if (data.address) {
            if (typeof data.address === 'object') {
              formattedAddress = data.address as Address;
            }
          }

          const formattedData: CompanyInfoRecord = {
            id: data.id,
            company_name: data.company_name,
            company_type: data.company_type,
            establishment_date: data.establishment_date,
            commercial_registration: data.commercial_registration,
            unified_national_number: String(data["Unified National Number"] || ""),
            social_insurance_number: data.social_insurance_number,
            hrsd_number: data.hrsd_number,
            bank_name: data.bank_name,
            bank_iban: data.bank_iban,
            tax_number: data.tax_number,
            address: formattedAddress,
            metadata: typeof data.metadata === 'object' ? data.metadata : {},
          };
          setCompany(formattedData);
        }
      } catch (error) {
        console.error("Error fetching company info:", error);
        toast({
          title: "خطأ في جلب بيانات الشركة",
          description: "حدث خطأ أثناء محاولة جلب بيانات الشركة",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchCompanyInfo();
  }, [companyId, toast]);

  if (loading) {
    return (
      <Card>
        <CardHeader className="space-y-0 pb-3">
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
      </Card>
    );
  }

  if (!company) {
    return (
      <Card>
        <CardHeader className="flex justify-between items-center pb-3">
          <CardTitle className="text-lg font-medium">معلومات الشركة</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">لا توجد بيانات للشركة</p>
        </CardContent>
      </Card>
    );
  }

  const logoUrl = company?.metadata && typeof company.metadata === 'object' && 'logo_url' in company.metadata 
    ? company.metadata.logo_url 
    : undefined;

  return (
    <Card>
      <CardHeader className="flex justify-between items-center pb-3">
        <CardTitle className="text-lg font-medium">معلومات الشركة</CardTitle>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8"
          aria-label="تعديل معلومات الشركة"
        >
          <Edit className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center space-x-3 space-x-reverse">
          {logoUrl ? (
            <div className="h-12 w-12 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
              <img 
                src={logoUrl as string} 
                alt={company.company_name || "الشركة"} 
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
              <span className="text-lg font-semibold text-gray-500">
                {company.company_name ? company.company_name.charAt(0) : "C"}
              </span>
            </div>
          )}
          <div>
            <h3 className="font-medium">{company.company_name || "الشركة"}</h3>
            <p className="text-sm text-muted-foreground">{company.company_type || "شركة"}</p>
          </div>
        </div>
        
        <div className="grid gap-1">
          <div className="flex justify-between py-1 border-b">
            <span className="text-sm text-muted-foreground">السجل التجاري</span>
            <span className="text-sm font-medium">{company.commercial_registration || "-"}</span>
          </div>
          <div className="flex justify-between py-1 border-b">
            <span className="text-sm text-muted-foreground">الرقم الموحد</span>
            <span className="text-sm font-medium">{company.unified_national_number || "-"}</span>
          </div>
          <div className="flex justify-between py-1 border-b">
            <span className="text-sm text-muted-foreground">رقم التأمينات</span>
            <span className="text-sm font-medium">{company.social_insurance_number || "-"}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-sm text-muted-foreground">تاريخ التأسيس</span>
            <span className="text-sm font-medium">
              {company.establishment_date || "-"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompanyInfoCard;
