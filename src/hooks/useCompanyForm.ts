
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CompanyInfo, Address } from "@/types/database";
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
          let addressData: Record<string, any> = { street: '', city: '', postal_code: '' };
          if (data.address) {
            if (typeof data.address === 'object') {
              addressData = data.address as Record<string, any>;
            } else {
              addressData = { street: String(data.address) };
            }
          }
          
          const formattedData: CompanyInfo = {
            id: data.id,
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
            address: addressData,
            metadata: data.metadata || {},
            license_expiry_date: data.license_expiry_date || '',
            created_at: data.created_at
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
  }, [toast, setFormData]);

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
    setFormData(prev => {
      const metadata = prev.metadata as Record<string, any>;
      return {
        ...prev,
        metadata: {
          ...metadata,
          logo_url: logoUrl
        }
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      
      // تحويل البيانات إلى الشكل المناسب للتخزين
      const formDataToSave: any = {
        ...formData,
        "Unified National Number": formData.unified_national_number ? parseInt(formData.unified_national_number) : null
      };
      
      // حذف الحقول التي لا تتوافق مع جدول قاعدة البيانات
      delete formDataToSave.unified_national_number;
      
      let result;
      
      if (companyInfo?.id) {
        // تحديث السجل الموجود
        result = await supabase
          .from('company_Info')
          .update(formDataToSave)
          .eq('id', companyInfo.id);
      } else {
        // إنشاء سجل جديد
        result = await supabase
          .from('company_Info')
          .insert([formDataToSave]);
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
