
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useFileHandler } from "./useFileHandler";
import { supabase } from "@/integrations/supabase/client"; 

export function useDocumentUpload(partnerId: string | null, onSuccess?: () => void) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const {
    file,
    documentName,
    setDocumentName,
    handleFileChange,
    validateFileInput,
    resetForm
  } = useFileHandler();

  const uploadDocument = async (file: File, documentName: string) => {
    if (!file || !partnerId) return null;
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${partnerId}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('partner-documents')
        .upload(fileName, file);
      
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('partner-documents')
        .getPublicUrl(fileName);
      
      return publicUrl;
    } catch (error) {
      console.error("Error uploading document:", error);
      toast({
        title: "خطأ في رفع المستند",
        description: "حدث خطأ أثناء محاولة رفع المستند",
        variant: "destructive",
      });
      return null;
    }
  };

  const saveDocumentMetadata = async (documentUrl: string, documentName: string, file: File) => {
    if (!partnerId) return;

    try {
      // الحصول على المستندات الحالية للشريك
      const { data: partnerData, error: fetchError } = await supabase
        .from('company_partners')
        .select('documents')
        .eq('id', partnerId)
        .single();
      
      if (fetchError) throw fetchError;
      
      // تحديث مصفوفة المستندات
      const existingDocs = Array.isArray(partnerData.documents) ? partnerData.documents : [];
      
      const updatedDocs = [
        ...existingDocs,
        {
          name: documentName,
          url: documentUrl,
          type: file.type,
          uploaded_at: new Date().toISOString()
        }
      ];
      
      // تحديث بيانات الشريك
      const { error: updateError } = await supabase
        .from('company_partners')
        .update({ documents: updatedDocs })
        .eq('id', partnerId);
      
      if (updateError) throw updateError;
      
    } catch (error) {
      console.error("Error saving document metadata:", error);
      throw error;
    }
  };

  const handleUpload = async () => {
    if (!validateFileInput(file, documentName) || !partnerId || !file) {
      return false;
    }

    setLoading(true);
    try {
      const documentUrl = await uploadDocument(file, documentName);
      if (!documentUrl) throw new Error("Failed to upload document");

      await saveDocumentMetadata(documentUrl, documentName, file);

      toast({
        title: "تم الرفع بنجاح",
        description: "تم رفع المستند بنجاح",
      });

      resetForm();
      if (onSuccess) onSuccess();
      return true;
    } catch (error) {
      console.error("Error uploading document:", error);
      toast({
        title: "خطأ في رفع المستند",
        description: "حدث خطأ أثناء رفع المستند",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    documentName,
    setDocumentName,
    file,
    handleFileChange,
    handleUpload
  };
}
