
import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { DocumentObject } from "./types";

export function useDocumentUpload(partnerId: string | null, onSuccess?: () => void) {
  const [loading, setLoading] = useState(false);
  const [documentName, setDocumentName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const { toast } = useToast();

  const resetForm = () => {
    setDocumentName("");
    setFile(null);
  };

  const handleFileChange = useCallback((file: File | null) => {
    setFile(file);
  }, []);

  const handleUpload = async () => {
    if (!file || !documentName.trim() || !partnerId) {
      toast({
        title: "بيانات غير كاملة",
        description: "يرجى تحديد ملف وإدخال اسم المستند",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${partnerId}-${Date.now()}.${fileExt}`;
      const filePath = `partners/${partnerId}/documents/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("documents")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from("documents")
        .getPublicUrl(filePath);

      const documentUrl = publicUrlData.publicUrl;

      const { data, error } = await supabase
        .from("company_partners")
        .select("*")
        .eq("id", partnerId)
        .single();

      if (error) throw error;

      const newDocument: DocumentObject = {
        id: crypto.randomUUID(),
        name: documentName,
        url: documentUrl,
        type: file.type,
        size: file.size,
        uploadedAt: new Date().toISOString()
      };

      const existingDocs = Array.isArray(data.documents) 
        ? data.documents.map((doc: any) => ({
            id: doc.id || "",
            name: doc.name || "",
            url: doc.url || "",
            type: doc.type || "",
            size: doc.size || 0,
            uploadedAt: doc.uploadedAt || new Date().toISOString()
          }))
        : [];

      const { error: updateError } = await supabase
        .from("company_partners")
        .update({ 
          documents: [...existingDocs, newDocument]
        })
        .eq("id", partnerId);

      if (updateError) throw updateError;

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
