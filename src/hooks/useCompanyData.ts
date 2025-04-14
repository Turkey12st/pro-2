
import { useState, useEffect } from "react";
import { CompanyFormData } from "@/types/company";
import { useToast } from "@/hooks/use-toast";
import { fetchCompanyInfo } from "@/services/companyService";

export function useCompanyData() {
  const [loading, setLoading] = useState(false);
  const [companyInfo, setCompanyInfo] = useState<CompanyFormData>({
    id: "",
    name: "",
  });
  const { toast } = useToast();

  const loadCompanyInfo = async () => {
    setLoading(true);
    try {
      const data = await fetchCompanyInfo();
      
      if (data) {
        setCompanyInfo(data);
      }
      return data;
    } catch (error) {
      console.error("Error fetching company info:", error);
      toast({
        title: "خطأ في جلب بيانات الشركة",
        description: "حدث خطأ أثناء محاولة جلب بيانات الشركة",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompanyInfo();
  }, []);

  return {
    companyInfo,
    loading,
    refreshCompanyInfo: loadCompanyInfo,
    setCompanyInfo
  };
}
