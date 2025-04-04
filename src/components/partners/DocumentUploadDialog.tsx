import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DocumentUploadDialogProps {
  isOpen: boolean;
  partnerId: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

// Define the document type as Record to meet Json requirements
interface DocumentInfo {
  type: string;
  filename: string;
  url: string;
  size: number;
  uploaded_at: string;
  [key: string]: string | number; // Add index signature to match Json requirements
}

export function DocumentUploadDialog({ 
  isOpen, 
  partnerId, 
  onClose, 
  onSuccess 
}: DocumentUploadDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [docType, setDocType] = useState('identity');
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file || !partnerId) return;

    try {
      setIsUploading(true);
      
      // Upload file to storage
      const fileName = `${partnerId}/${docType}/${Date.now()}-${file.name}`;
      const { data: fileData, error: fileError } = await supabase.storage
        .from('partner-documents')
        .upload(fileName, file);
      
      if (fileError) throw fileError;
      
      // Get the public URL
      const { data: publicUrlData } = supabase.storage
        .from('partner-documents')
        .getPublicUrl(fileName);
            
      // Update partner record with document info
      const { data: partnerData, error: partnerError } = await supabase
        .from('company_partners')
        .select('documents')
        .eq('id', partnerId)
        .single();
        
      if (partnerError) throw partnerError;
      
      // Prepare the documents array
      let documents: DocumentInfo[] = [];
      
      if (partnerData?.documents) {
        // Type assertion to handle dynamic data from database
        if (typeof partnerData.documents === 'string') {
          try {
            documents = JSON.parse(partnerData.documents) as DocumentInfo[];
          } catch (e) {
            documents = [];
          }
        } else if (Array.isArray(partnerData.documents)) {
          // Cast to DocumentInfo[] with type assertion after validation
          const docsArray = partnerData.documents as any[];
          documents = docsArray.map(doc => ({
            type: doc.type || '',
            filename: doc.filename || '',
            url: doc.url || '',
            size: doc.size || 0,
            uploaded_at: doc.uploaded_at || new Date().toISOString()
          }));
        }
      }
      
      // Add new document
      const newDocument: DocumentInfo = {
        type: docType,
        filename: file.name,
        url: publicUrlData.publicUrl,
        size: file.size,
        uploaded_at: new Date().toISOString()
      };
      
      documents.push(newDocument);
      
      // Update the partner record
      const { error: updateError } = await supabase
        .from('company_partners')
        .update({ documents }) // Supabase will handle the JSON conversion
        .eq('id', partnerId);
        
      if (updateError) throw updateError;
      
      toast({
        title: "تم رفع المستند بنجاح",
        description: "تم إضافة المستند لملف الشريك",
      });
      
      onSuccess();
    } catch (error) {
      console.error("Error uploading document:", error);
      toast({
        title: "خطأ في رفع المستند",
        description: "حدث خطأ أثناء محاولة رفع المستند",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>رفع مستند</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="docType">نوع المستند</Label>
            <select
              id="docType"
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="identity">هوية وطنية</option>
              <option value="commercial">سجل تجاري</option>
              <option value="contract">عقد تأسيس</option>
              <option value="other">مستند آخر</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="file">اختر الملف</Label>
            <Input id="file" type="file" onChange={handleFileChange} />
          </div>
          <div className="flex justify-end space-x-2 space-x-reverse">
            <Button variant="outline" onClick={onClose}>إلغاء</Button>
            <Button 
              onClick={handleUpload} 
              disabled={!file || isUploading}
            >
              {isUploading ? "جاري الرفع..." : "رفع المستند"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
