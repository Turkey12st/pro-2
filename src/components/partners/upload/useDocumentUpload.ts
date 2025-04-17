
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useFileHandler } from "./useFileHandler";
import { useDocumentStorage } from "./useDocumentStorage";

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

  const { uploadDocument, saveDocumentMetadata } = useDocumentStorage(partnerId);

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
