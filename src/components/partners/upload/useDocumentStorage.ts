
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useDocumentStorage = () => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const uploadDocument = async (file: File, path: string): Promise<string | null> => {
    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${path}/${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Return the file path instead of public URL for security
      // Signed URLs will be generated when accessing the document
      return filePath;
    } catch (error) {
      console.error('Error uploading document:', error);
      toast({
        title: "خطأ في رفع المستند",
        description: "حدث خطأ أثناء محاولة رفع المستند",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const getSignedUrl = async (path: string, expiresIn: number = 3600): Promise<string | null> => {
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .createSignedUrl(path, expiresIn);

      if (error) throw error;
      return data.signedUrl;
    } catch (error) {
      console.error('Error getting signed URL:', error);
      toast({
        title: "خطأ في الوصول للمستند",
        description: "حدث خطأ أثناء محاولة الوصول للمستند",
        variant: "destructive",
      });
      return null;
    }
  };

  const deleteDocument = async (path: string): Promise<boolean> => {
    try {
      const { error } = await supabase.storage
        .from('documents')
        .remove([path]);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting document:', error);
      toast({
        title: "خطأ في حذف المستند",
        description: "حدث خطأ أثناء محاولة حذف المستند",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    uploadDocument,
    deleteDocument,
    getSignedUrl,
    isUploading,
  };
};
