
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CompanyInfo } from "@/types/database";
import { useToast } from "@/hooks/use-toast";

export function useCompanyForm() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [autoSaveLoading, setAutoSaveLoading] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
    id: "",
    name: "",
  });
  const [formData, setFormData] = useState<CompanyInfo>({
    id: "",
    name: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    async function fetchCompanyInfo() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("company_Info")
          .select("*")
          .single();

        if (error && error.code !== "PGSQL_NO_ROWS_RETURNED") {
          throw error;
        }

        if (data) {
          // Type-safe transformation
          const transformedData: CompanyInfo = {
            id: data.id || "",
            company_name: data.company_name || "",
            company_type: data.company_type || "",
            commercial_registration: data.commercial_registration || "",
            unified_national_number: data["Unified National Number"]?.toString() || "",
            social_insurance_number: data.social_insurance_number || "",
            hrsd_number: data.hrsd_number || "",
            economic_activity: data.economic_activity || "",
            nitaqat_activity: data.nitaqat_activity || "",
            establishment_date: data.establishment_date || "",
            tax_number: data.tax_number || "",
            address: data.address ? {
              street: data.address.street || "",
              city: data.address.city || "", 
              postal_code: data.address.postal_code || "",
              country: data.address.country || ""
            } : {},
            bank_name: data.bank_name || "",
            bank_iban: data.bank_iban || "",
            contact: {
              email: data.email || "",
              phone: data.phone || "",
              website: data.website || "",
            },
            metadata: data.metadata || {},
            name: data.company_name || "",
          };
          
          setCompanyInfo(transformedData);
          setFormData(transformedData);
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
  }, [toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof CompanyInfo] as object || {}),
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

  const saveCompanyInfo = async (data: Partial<CompanyInfo>) => {
    setSaving(true);
    try {
      // Convert complex objects for database compatibility
      const dbData = {
        company_name: data.company_name || "",
        company_type: data.company_type || "",
        commercial_registration: data.commercial_registration || "",
        "Unified National Number": data.unified_national_number ? parseInt(data.unified_national_number) : null,
        social_insurance_number: data.social_insurance_number || "",
        hrsd_number: data.hrsd_number || "",
        economic_activity: data.economic_activity || "",
        nitaqat_activity: data.nitaqat_activity || "",
        establishment_date: data.establishment_date || "",
        tax_number: data.tax_number || "",
        address: data.address || {},
        bank_name: data.bank_name || "",
        bank_iban: data.bank_iban || "",
        email: data.contact?.email || "",
        phone: data.contact?.phone || "",
        website: data.contact?.website || "",
        metadata: data.metadata || {}
      };

      // For new company
      if (!companyInfo.id) {
        const { error } = await supabase
          .from("company_Info")
          .insert([dbData]);
        
        if (error) throw error;
      } 
      // For existing company
      else {
        const { error } = await supabase
          .from("company_Info")
          .update(dbData)
          .eq("id", companyInfo.id);
          
        if (error) throw error;
      }

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
    saveCompanyInfo(formData);
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
    saveCompanyInfo,
    setCompanyInfo,
  };
}
