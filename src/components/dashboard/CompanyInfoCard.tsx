
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Building, FileText, FileCheck, CircleDollarSign, Landmark, Banknote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { CompanyInfo } from "@/types/database";

export function CompanyInfoCard() {
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCompanyInfo = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('company_Info')
          .select('*')
          .limit(1)
          .maybeSingle();

        if (error) {
          throw error;
        }

        if (data) {
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
      } catch (error) {
        console.error("Error fetching company info:", error);
        toast({
          variant: "destructive",
          title: "خطأ في جلب معلومات الشركة",
          description: "لم نتمكن من جلب معلومات الشركة، يرجى المحاولة مرة أخرى"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompanyInfo();
  }, [toast]);

  // التحقق من وجود بيانات المستندات
  const fetchDocuments = async () => {
    const { data, error } = await supabase
      .from('company_documents')
      .select('*');
      
    if (error) {
      console.error("Error fetching documents:", error);
      return [];
    }
    
    return data || [];
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold">
            <Skeleton className="h-6 w-[200px]" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex items-center">
          <Building className="h-5 w-5 ml-2" />
          معلومات الشركة
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col space-y-1">
            <div className="flex items-center">
              <FileText className="h-4 w-4 ml-2 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">اسم الشركة:</span>
              <span className="mr-1 font-medium">{companyInfo?.company_name || "غير محدد"}</span>
            </div>
            
            <div className="flex items-center">
              <FileCheck className="h-4 w-4 ml-2 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">السجل التجاري:</span>
              <span className="mr-1 font-medium">{companyInfo?.commercial_registration || "غير محدد"}</span>
            </div>
            
            <div className="flex items-center">
              <CircleDollarSign className="h-4 w-4 ml-2 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">الرقم الضريبي:</span>
              <span className="mr-1 font-medium">{companyInfo?.tax_number || "غير محدد"}</span>
            </div>
            
            <div className="flex items-center">
              <Landmark className="h-4 w-4 ml-2 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">رقم التأمينات:</span>
              <span className="mr-1 font-medium">{companyInfo?.social_insurance_number || "غير محدد"}</span>
            </div>
            
            <div className="flex items-center">
              <FileText className="h-4 w-4 ml-2 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">رقم ملف الموارد البشرية:</span>
              <span className="mr-1 font-medium">{companyInfo?.hrsd_number || "غير محدد"}</span>
            </div>
            
            <div className="flex items-center">
              <Banknote className="h-4 w-4 ml-2 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">الحساب البنكي:</span>
              <span className="mr-1 font-medium">{companyInfo?.bank_iban || "غير محدد"}</span>
            </div>
          </div>
          
          <div className="flex justify-center mt-2">
            <Button 
              variant="outline" 
              size="sm" 
              asChild
              className="text-xs"
            >
              <Link to="/company">
                إدارة معلومات الشركة
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
