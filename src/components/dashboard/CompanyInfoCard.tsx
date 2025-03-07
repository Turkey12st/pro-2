import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { CompanyInfo } from "@/types/database";
import CompanyLogoUpload from "@/components/company/CompanyLogoUpload";

interface CompanyInfoCardProps {
  companyId: string;
}

export function CompanyInfoCard({ companyId }: CompanyInfoCardProps) {
  const [company, setCompany] = useState<CompanyInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [logoUrl, setLogoUrl] = useState<string>("");

  useEffect(() => {
    const fetchCompanyInfo = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("company_Info")
          .select("*")
          .eq("id", companyId)
          .single();

        if (error) {
          console.error("Error fetching company info:", error);
        }

        if (data) {
          setCompany(data);
          const metadata = typeof data.metadata === 'object' ? data.metadata : {};
          setLogoUrl(metadata?.logo_url || "");
        }
      } catch (error) {
        console.error("Error processing company data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompanyInfo();
  }, [companyId]);

  const handleLogoUpdate = (newLogoUrl: string) => {
    setLogoUrl(newLogoUrl);
    // تحديث بيانات الشركة المحلية
    setCompany((prevCompany) => {
      if (prevCompany) {
        return {
          ...prevCompany,
          metadata: {
            ...prevCompany.metadata,
            logo_url: newLogoUrl,
          },
        };
      }
      return prevCompany;
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>معلومات الشركة</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center space-y-4 p-6">
          <Skeleton className="h-24 w-24 rounded-full" />
          <div className="space-y-2 text-center">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!company) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>معلومات الشركة</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            لا توجد معلومات للشركة.
          </p>
        </CardContent>
      </Card>
    );
  }

  const metadata = typeof company.metadata === 'object' ? company.metadata : {};

  return (
    <Card>
      <CardHeader>
        <CardTitle>معلومات الشركة</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex flex-col items-center justify-center space-y-4">
          <Avatar className="h-24 w-24">
            {logoUrl ? (
              <AvatarImage src={logoUrl} alt={company.company_name} />
            ) : (
              <AvatarFallback>{company.company_name.substring(0, 2)}</AvatarFallback>
            )}
          </Avatar>
          <div className="space-y-2 text-center">
            <h3 className="text-xl font-semibold">{company.company_name}</h3>
            <p className="text-muted-foreground">{company.company_type}</p>
          </div>
        </div>

        <div className="mt-6">
          <CompanyLogoUpload
            companyId={companyId}
            existingMetadata={metadata}
            onLogoUpdate={handleLogoUpdate}
          />
        </div>
      </CardContent>
    </Card>
  );
}
