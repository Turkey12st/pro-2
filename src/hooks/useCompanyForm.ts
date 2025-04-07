
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CompanyInfo, Json } from "@/types/database";
import useAutoSave from "@/hooks/useAutoSave";

export const useCompanyForm = () => {
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  
  const { formData, setFormData, isLoading: autoSaveLoading, lastSaved } = useAutoSave<CompanyInfo>({
    formType: 'company_info',
    initialData: companyInfo,
    debounceMs: 2000
  });

  // جلب معلومات الشركة
  useEffect(() => {
    const fetchCompanyInfo = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('company_Info')
          .select('*')
          .limit(1)
          .maybeSingle();
        
        if (error) {
          throw error;
        }
        
        if (data) {
          // تحويل البيانات إلى الشكل المطلوب
          const formattedData: CompanyInfo = {
            id: data.id,
            name: data.company_name || '',
            company_name: data.company_name || '',
            company_type: data.company_type || '',
            establishment_date: data.establishment_date || '',
            commercial_registration: data.commercial_registration || '',
            unified_national_number: data["Unified National Number"]?.toString() || '',
            social_insurance_number: data.social_insurance_number || '',
            hrsd_number: data.hrsd_number || '',
            bank_name: data.bank_name || '',
            bank_iban: data.bank_iban || '',
            nitaqat_activity: data.nitaqat_activity || '',
            economic_activity: data.economic_activity || '',
            tax_number: data.tax_number || '',
            address: typeof data.address === 'object' ? data.address : { street: '', city: '', postal_code: '' },
            metadata: data.metadata || {},
          };
          
          setCompanyInfo(formattedData);
          setFormData(formattedData);
        }
      } catch (error) {
        console.error("Error fetching company info:", error);
        toast({
          variant: "destructive",
          title: "خطأ في جلب بيانات الشركة",
          description: "حدث خطأ أثناء محاولة جلب بيانات الشركة"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchCompanyInfo();
  }, [toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...(prev.address as Record<string, any>),
          [addressField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogoChange = (logoUrl: string | null) => {
    setFormData(prev => ({
      ...prev,
      metadata: {
        ...(prev.metadata || {}),
        logo_url: logoUrl
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      
      // Prepare data for saving
      const formDataToSave: Record<string, any> = {
        company_name: formData.company_name,
        company_type: formData.company_type,
        establishment_date: formData.establishment_date,
        commercial_registration: formData.commercial_registration,
        "Unified National Number": formData.unified_national_number ? parseInt(formData.unified_national_number) || null : null,
        social_insurance_number: formData.social_insurance_number,
        hrsd_number: formData.hrsd_number,
        bank_name: formData.bank_name,
        bank_iban: formData.bank_iban,
        nitaqat_activity: formData.nitaqat_activity,
        economic_activity: formData.economic_activity,
        tax_number: formData.tax_number,
        address: formData.address,
        metadata: formData.metadata,
        license_expiry_date: formData.license_expiry_date
      };
      
      let result;
      
      if (companyInfo?.id) {
        // Update existing record
        result = await supabase
          .from('company_Info')
          .update(formDataToSave)
          .eq('id', companyInfo.id);
      } else {
        // Create a new record
        result = await supabase
          .from('company_Info')
          .insert(formDataToSave);
      }
      
      const { error } = result;
      
      if (error) throw error;
      
      toast({
        title: "تم الحفظ بنجاح",
        description: "تم حفظ معلومات الشركة بنجاح"
      });
    } catch (error) {
      console.error("Error saving company info:", error);
      toast({
        variant: "destructive",
        title: "خطأ في حفظ البيانات",
        description: "حدث خطأ أثناء محاولة حفظ معلومات الشركة"
      });
    } finally {
      setSaving(false);
    }
  };

  return {
    formData,
    loading,
    saving,
    autoSaveLoading,
    lastSaved,
    handleInputChange,
    handleSelectChange,
    handleLogoChange,
    handleSubmit
  };
};
