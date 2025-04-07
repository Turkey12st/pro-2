import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CompanyInfoRecord, Address } from "@/types/database";

interface CompanyInfoCardProps {
  companyId: string;
}

const CompanyInfoCard: React.FC<CompanyInfoCardProps> = ({ companyId }) => {
  const [companyInfo, setCompanyInfo] = useState<CompanyInfoRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCompanyInfo = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('company_Info')
          .select('*')
          .limit(1)
          .maybeSingle();

        if (error) {
          throw new Error(error.message);
        }

        setCompanyInfo(data);
      } catch (error: any) {
        console.error("Error fetching company info:", error.message);
        toast({
          title: "Error",
          description: "Failed to fetch company information.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompanyInfo();
  }, [companyId, toast]);

  const formatAddress = (address: string | Address): string => {
    if (!address) return "غير محدد";
    
    if (typeof address === 'string') {
      return address;
    }
    
    const { street, city, postal_code } = address as Record<string, any>;
    const parts = [street, city, postal_code].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : "غير محدد";
  };

  const getLogoUrl = (companyInfo: CompanyInfoRecord): string => {
    if (!companyInfo?.metadata) return "";
    
    const metadata = companyInfo.metadata as Record<string, any>;
    return metadata.logo_url || "";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>معلومات الشركة</CardTitle>
        <CardDescription>نظرة عامة على بيانات الشركة</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {isLoading ? (
          <>
            <div className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-4 w-[150px]" />
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-4 w-[250px]" />
            </div>
          </>
        ) : companyInfo ? (
          <>
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarImage src={getLogoUrl(companyInfo)} />
                <AvatarFallback>{companyInfo.company_name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <CardTitle>{companyInfo.company_name}</CardTitle>
                <CardDescription>{companyInfo.company_type}</CardDescription>
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-sm font-medium">العنوان</div>
              <div className="text-muted-foreground">{formatAddress(companyInfo.address)}</div>
            </div>
          </>
        ) : (
          <div className="text-center text-muted-foreground">
            لا توجد معلومات للشركة.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CompanyInfoCard;
