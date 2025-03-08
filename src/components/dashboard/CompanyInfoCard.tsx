
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Define the CompanyInfo type explicitly
export interface CompanyInfo {
  id: string;
  company_name: string;
  company_type: string;
  establishment_date: string;
  commercial_registration: string;
  unified_national_number: string;
  social_insurance_number: string;
  hrsd_number: string;
  bank_name: string;
  bank_iban: string;
  nitaqat_activity: string;
  economic_activity: string;
  tax_number: string;
  address: string;
  metadata: any;
  license_expiry_date: string;
  created_at: string;
}

export interface CompanyInfoCardProps {
  companyId: string;
}

const CompanyInfoCard: React.FC<CompanyInfoCardProps> = ({ companyId = "1" }) => {
  const [company, setCompany] = useState<CompanyInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchCompanyInfo() {
      try {
        setLoading(true);
        // Use a direct query since company_info might not be in the TypeScript types
        const { data, error } = await supabase
          .from('company_info')
          .select('*')
          .eq('id', companyId)
          .single();

        if (error) throw error;

        if (data) {
          // Convert from DB format to our CompanyInfo format
          const formattedData: CompanyInfo = {
            id: data.id,
            company_name: data.company_name,
            company_type: data.company_type,
            establishment_date: data.establishment_date,
            commercial_registration: data.commercial_registration,
            unified_national_number: data.unified_national_number || "",
            social_insurance_number: data.social_insurance_number,
            hrsd_number: data.hrsd_number,
            bank_name: data.bank_name,
            bank_iban: data.bank_iban,
            nitaqat_activity: data.nitaqat_activity,
            economic_activity: data.economic_activity,
            tax_number: data.tax_number,
            address: data.address,
            metadata: data.metadata,
            license_expiry_date: data.license_expiry_date,
            created_at: data.created_at
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

  // Handle the case when company data is not available
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

  const logoUrl = company.metadata && typeof company.metadata === 'object' && 'logo_url' in company.metadata 
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
                alt={company.company_name} 
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
              <span className="text-lg font-semibold text-gray-500">
                {company.company_name.charAt(0)}
              </span>
            </div>
          )}
          <div>
            <h3 className="font-medium">{company.company_name}</h3>
            <p className="text-sm text-muted-foreground">{company.company_type}</p>
          </div>
        </div>
        
        <div className="grid gap-1">
          <div className="flex justify-between py-1 border-b">
            <span className="text-sm text-muted-foreground">السجل التجاري</span>
            <span className="text-sm font-medium">{company.commercial_registration}</span>
          </div>
          <div className="flex justify-between py-1 border-b">
            <span className="text-sm text-muted-foreground">الرقم الموحد</span>
            <span className="text-sm font-medium">{company.unified_national_number}</span>
          </div>
          <div className="flex justify-between py-1 border-b">
            <span className="text-sm text-muted-foreground">رقم التأمينات</span>
            <span className="text-sm font-medium">{company.social_insurance_number}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-sm text-muted-foreground">تاريخ التأسيس</span>
            <span className="text-sm font-medium">
              {new Date(company.establishment_date).toLocaleDateString('ar-SA')}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompanyInfoCard;
