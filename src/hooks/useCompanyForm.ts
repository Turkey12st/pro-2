
import { useState, useEffect } from "react";
import { CompanyFormData } from "@/types/company";
import { useToast } from "@/hooks/use-toast";
import { saveCompanyInfo } from "@/services/companyService";
import { useCompanyData } from "@/hooks/useCompanyData";

export function useCompanyForm() {
  const { companyInfo, loading, refreshCompanyInfo, setCompanyInfo } = useCompanyData();
  const [saving, setSaving] = useState(false);
  const [autoSaveLoading, setAutoSaveLoading] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [formData, setFormData] = useState<CompanyFormData>({
    id: "",
    name: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    if (companyInfo && companyInfo.id) {
      setFormData(companyInfo);
    }
  }, [companyInfo]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof CompanyFormData] as object || {}),
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    setLastSaved("جاري الحفظ التلقائي...");
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    setLastSaved("جاري الحفظ التلقائي...");
  };

  const handleLogoChange = (logoUrl: string | null) => {
    setFormData(prev => ({
      ...prev,
      logo_url: logoUrl
    }));
    
    setLastSaved("جاري الحفظ التلقائي...");
  };

  const handleSaveCompanyInfo = async (data: CompanyFormData) => {
    setSaving(true);
    try {
      await saveCompanyInfo(data, companyInfo.id);
      
      toast({
        title: "تم الحفظ",
        description: "تم حفظ بيانات الشركة بنجاح",
      });
      await refreshCompanyInfo();
    } catch (error) {
      console.error("Error saving company info:", error);
      toast({
        title: "خطأ في حفظ البيانات",
        description: "حدث خطأ أثناء محاولة حفظ بيانات الشركة",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSaveCompanyInfo(formData);
  };

  return {
    companyInfo,
    formData,
    loading,
    saving,
    autoSaveLoading,
    lastSaved,
    handleInputChange,
    handleSelectChange,
    handleLogoChange,
    handleSubmit,
    saveCompanyInfo: handleSaveCompanyInfo
  };
}
