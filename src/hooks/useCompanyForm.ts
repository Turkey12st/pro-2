
import { useState, useEffect } from "react";
import { CompanyFormData } from "@/types/company";
import { useToast } from "@/hooks/use-toast";
import { fetchCompanyInfo, saveCompanyInfo } from "@/services/companyService";

export function useCompanyForm() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [autoSaveLoading, setAutoSaveLoading] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [companyInfo, setCompanyInfo] = useState<CompanyFormData>({
    id: "",
    name: "",
  });
  const [formData, setFormData] = useState<CompanyFormData>({
    id: "",
    name: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    async function loadCompanyInfo() {
      setLoading(true);
      try {
        const data = await fetchCompanyInfo();
        
        if (data) {
          setCompanyInfo(data);
          setFormData(data);
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

    loadCompanyInfo();
  }, [toast]);

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
    saveCompanyInfo: handleSaveCompanyInfo,
    setCompanyInfo,
  };
}
