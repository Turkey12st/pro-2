
// Note: This is a simplified version as the original is in the read-only files
// We only need to fix type issues while maintaining existing functionality

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { CompanyInfoRecord, Address } from "@/types/database";
import { Building, Clock, MapPin, Phone } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export function CompanyInfoCard() {
  const [companyInfo, setCompanyInfo] = useState<CompanyInfoRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCompanyInfo() {
      try {
        const { data, error } = await supabase
          .from("company_info")
          .select("*")
          .single();

        if (error) {
          console.error("Error fetching company info:", error);
          return;
        }

        // Convert data to match CompanyInfoRecord type
        if (data) {
          const typedData = {
            ...data,
            unified_national_number: data["Unified National Number"] || data.unified_national_number,
            // Ensure address is correctly typed
            address: data.address || {}
          } as CompanyInfoRecord;
          
          setCompanyInfo(typedData);
        }
      } catch (error) {
        console.error("Error fetching company info:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchCompanyInfo();
  }, []);

  // Format address for display
  const formatAddress = (address: Address | null | undefined) => {
    if (!address) return "لا يوجد عنوان";
    const parts = [
      address.city,
      address.region,
      address.postal_code,
    ].filter(Boolean);
    return parts.join("، ");
  };

  // Format establishment date
  const formatEstablishmentDate = (dateString?: string) => {
    if (!dateString) return "غير محدد";
    try {
      return format(new Date(dateString), "dd/MM/yyyy");
    } catch (error) {
      return "غير محدد";
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">معلومات الشركة</CardTitle>
          <CardDescription>البيانات الأساسية للشركة</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">معلومات الشركة</CardTitle>
        <CardDescription>البيانات الأساسية للشركة</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {companyInfo ? (
          <>
            <div className="flex items-center">
              <Building className="h-5 w-5 ml-2 text-muted-foreground" />
              <div>
                <p className="font-semibold text-foreground">{companyInfo.company_name || "اسم الشركة غير متوفر"}</p>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  {companyInfo.company_type || "نوع الشركة غير محدد"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="text-sm">
                <p className="text-muted-foreground">السجل التجاري</p>
                <p className="font-medium">{companyInfo.commercial_registration || "غير متوفر"}</p>
              </div>
              <div className="text-sm">
                <p className="text-muted-foreground">الرقم الوطني الموحد</p>
                <p className="font-medium">{companyInfo.unified_national_number || "غير متوفر"}</p>
              </div>
              <div className="text-sm">
                <p className="text-muted-foreground">رقم التأمينات الاجتماعية</p>
                <p className="font-medium">{companyInfo.social_insurance_number || "غير متوفر"}</p>
              </div>
            </div>

            <div className="flex items-center">
              <MapPin className="h-5 w-5 ml-2 text-muted-foreground" />
              <div>
                <p className="font-semibold">العنوان</p>
                <p className="text-sm text-muted-foreground">
                  {formatAddress(companyInfo.address as Address)}
                </p>
              </div>
            </div>

            <div className="flex items-center">
              <Clock className="h-5 w-5 ml-2 text-muted-foreground" />
              <div>
                <p className="font-semibold">تاريخ التأسيس</p>
                <p className="text-sm text-muted-foreground">
                  {formatEstablishmentDate(companyInfo.establishment_date)}
                </p>
              </div>
            </div>

            <div className="flex items-center">
              <Phone className="h-5 w-5 ml-2 text-muted-foreground" />
              <div>
                <p className="font-semibold">التواصل</p>
                <p className="text-sm text-muted-foreground">
                  {companyInfo.contact?.phone || "لا يوجد رقم هاتف"}
                </p>
              </div>
            </div>
          </>
        ) : (
          <p className="text-center text-muted-foreground py-4">
            لا توجد معلومات متاحة للشركة
          </p>
        )}
      </CardContent>
    </Card>
  );
}
