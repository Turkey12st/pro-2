
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface DocumentMetadata {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedAt: string;
}

export function useDocumentUpload(partnerId: string, onSuccess?: () => void) {
  const [loading, setLoading] = useState(false);
  const [documentName, setDocumentName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleFileChange = (selectedFile: File | null) => {
    setFile(selectedFile);
    if (selectedFile && !documentName) {
      setDocumentName(selectedFile.name.split('.')[0]);
    }
  };

  const uploadDocument = async (uploadFile: File, partnerIdParam: string): Promise<DocumentMetadata> => {
    if (!uploadFile) {
      throw new Error('لم يتم اختيار ملف');
    }

    setLoading(true);
    try {
      const fileExt = uploadFile.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `partners/${partnerIdParam}/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, uploadFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      const documentMetadata: DocumentMetadata = {
        id: uploadData.path,
        name: documentName || uploadFile.name,
        url: publicUrl,
        type: uploadFile.type,
        size: uploadFile.size,
        uploadedAt: new Date().toISOString()
      };

      // حفظ معلومات المستند في قاعدة البيانات
      const { error: dbError } = await supabase
        .from('company_documents')
        .insert([{
          title: documentMetadata.name,
          type: 'partner_document',
          document_url: documentMetadata.url,
          issue_date: new Date().toISOString().split('T')[0],
          expiry_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // سنة من الآن
          metadata: {
            partner_id: partnerIdParam,
            file_size: documentMetadata.size,
            file_type: documentMetadata.type
          }
        }]);

      if (dbError) throw dbError;

      toast({
        title: 'تم رفع المستند بنجاح',
        description: `تم رفع ${documentMetadata.name} بنجاح`
      });

      if (onSuccess) onSuccess();
      
      // إعادة تعيين الحالة
      setDocumentName('');
      setFile(null);

      return documentMetadata;
    } catch (error) {
      console.error('Error uploading document:', error);
      toast({
        title: 'خطأ في رفع المستند',
        description: error instanceof Error ? error.message : 'حدث خطأ غير متوقع',
        variant: 'destructive'
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (): Promise<boolean> => {
    if (!file) {
      toast({
        title: 'خطأ',
        description: 'يرجى اختيار ملف أولاً',
        variant: 'destructive'
      });
      return false;
    }

    try {
      await uploadDocument(file, partnerId);
      return true;
    } catch (error) {
      return false;
    }
  };

  return {
    uploadDocument,
    isUploading: loading,
    loading,
    documentName,
    setDocumentName,
    file,
    handleFileChange,
    handleUpload
  };
}
