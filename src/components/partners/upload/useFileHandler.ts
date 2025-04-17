
import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

export function useFileHandler() {
  const [file, setFile] = useState<File | null>(null);
  const [documentName, setDocumentName] = useState("");
  const { toast } = useToast();

  const handleFileChange = useCallback((file: File | null) => {
    setFile(file);
  }, []);

  const validateFileInput = useCallback((file: File | null, documentName: string) => {
    if (!file || !documentName.trim()) {
      toast({
        title: "بيانات غير كاملة",
        description: "يرجى تحديد ملف وإدخال اسم المستند",
        variant: "destructive",
      });
      return false;
    }
    return true;
  }, [toast]);

  const resetForm = useCallback(() => {
    setDocumentName("");
    setFile(null);
  }, []);

  return {
    file,
    documentName,
    setDocumentName,
    handleFileChange,
    validateFileInput,
    resetForm
  };
}
