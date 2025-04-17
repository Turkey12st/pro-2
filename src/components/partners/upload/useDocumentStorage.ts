
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DocumentObject } from "./types";
import { useToast } from "@/hooks/use-toast";

export function useDocumentStorage(partnerId: string | null) {
  const { toast } = useToast();

  const uploadDocument = useCallback(async (
    file: File,
    documentName: string
  ): Promise<string | null> => {
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

    return publicUrlData.publicUrl;
  }, [partnerId]);

  const saveDocumentMetadata = useCallback(async (
    documentUrl: string,
    documentName: string,
    file: File
  ): Promise<boolean> => {
    if (!partnerId) return false;
    
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

    // Handle existing documents as a proper array to avoid recursion
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
      .update({ documents: [...existingDocs, newDocument] })
      .eq("id", partnerId);

    if (updateError) throw updateError;
    return true;
  }, [partnerId]);

  return {
    uploadDocument,
    saveDocumentMetadata
  };
}
