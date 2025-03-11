
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PartnerData, initialPartnerData } from './types';

export const usePartnerForm = (onSuccess?: () => void) => {
  const [isLoading, setIsLoading] = useState(false);
  const [partnerData, setPartnerData] = useState<PartnerData>(initialPartnerData);
  const { toast } = useToast();
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'email') {
      setPartnerData(prev => ({
        ...prev,
        contact_info: {
          ...prev.contact_info,
          email: value
        }
      }));
    } else if (name === 'phone') {
      setPartnerData(prev => ({
        ...prev,
        contact_info: {
          ...prev.contact_info,
          phone: value
        }
      }));
    } else if (name === 'ownership_percentage' || name === 'share_value') {
      setPartnerData(prev => ({
        ...prev,
        [name]: parseFloat(value) || 0
      }));
    } else {
      setPartnerData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handlePartnerTypeChange = (value: string) => {
    setPartnerData(prev => ({
      ...prev,
      partner_type: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      
      // Insert into company_partners table
      const { data, error } = await supabase
        .from('company_partners')
        .insert([{
          name: partnerData.name,
          nationality: partnerData.nationality,
          identity_number: partnerData.identity_number,
          partner_type: partnerData.partner_type,
          ownership_percentage: partnerData.ownership_percentage,
          share_value: partnerData.share_value,
          position: partnerData.position,
          contact_info: partnerData.contact_info,
          documents: []
        }]).select();
      
      if (error) throw error;
      
      toast({
        title: "تم إضافة الشريك بنجاح",
        description: `تم إضافة ${partnerData.name} إلى قائمة الشركاء بنجاح.`,
      });
      
      // Reset form
      setPartnerData(initialPartnerData);
      
      if (onSuccess) {
        onSuccess();
      }
      
    } catch (error) {
      console.error("Error adding partner:", error);
      toast({
        variant: "destructive",
        title: "خطأ في إضافة الشريك",
        description: "حدث خطأ أثناء محاولة إضافة الشريك. يرجى المحاولة مرة أخرى.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    partnerData,
    isLoading,
    handleChange,
    handlePartnerTypeChange,
    handleSubmit
  };
};
