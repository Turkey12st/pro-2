
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface DocumentMetadata {
  name: string;
  type: string;
  size: number;
  uploadDate: string;
  [key: string]: any;
}

export function useDocumentUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const uploadDocument = async (file: File, partnerId: string) => {
    setIsUploading(true);
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

      const documentMetadata: DocumentMetadata = {
        name: file.name,
        type: file.type,
        size: file.size,
        uploadDate: new Date().toISOString(),
        url: publicUrl
      };

      // تحديث جدول الشركاء بالمستند الجديد
      const { data: partner, error: fetchError } = await supabase
        .from('company_partners')
        .select('documents')
        .eq('name', partnerId)
        .single();

      if (fetchError) throw fetchError;

      const existingDocuments = Array.isArray(partner.documents) ? partner.documents : [];
      const updatedDocuments = [...existingDocuments, documentMetadata];

      const { error: updateError } = await supabase
        .from('company_partners')
        .update({ documents: updatedDocuments })
        .eq('name', partnerId);

      if (updateError) throw updateError;

      toast({
        title: "تم رفع المستند بنجاح",
        description: "تم إضافة المستند إلى ملف الشريك",
      });

      return documentMetadata;
    } catch (error) {
      console.error("Error uploading document:", error);
      toast({
        title: "خطأ في رفع المستند",
        description: "حدث خطأ أثناء محاولة رفع المستند",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadDocument,
    isUploading
  };
}
