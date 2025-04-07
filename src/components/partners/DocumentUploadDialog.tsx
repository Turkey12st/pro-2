
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Upload } from "lucide-react";

interface DocumentUploadDialogProps {
  partnerId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface DocumentItem {
  id: string;
  name: string;
  url: string;
  uploaded_at: string;
}

export function DocumentUploadDialog({
  partnerId,
  isOpen,
  onClose,
  onSuccess,
}: DocumentUploadDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [documentName, setDocumentName] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "يرجى اختيار ملف للتحميل",
      });
      return;
    }

    if (!documentName.trim()) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "يرجى إدخال اسم المستند",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Upload file to Supabase Storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${partnerId}_${Date.now()}.${fileExt}`;
      const filePath = `partner_documents/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get file URL
      const { data: urlData } = supabase.storage
        .from("documents")
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;

      // Update partner's documents in the database
      const { data: partnerData, error: partnerError } = await supabase
        .from("company_partners")
        .select("documents")
        .eq("id", partnerId)
        .single();

      if (partnerError) throw partnerError;

      // Safely handle documents as an array
      const existingDocs: DocumentItem[] = Array.isArray(partnerData.documents) 
        ? partnerData.documents 
        : [];
      
      const newDoc: DocumentItem = {
        id: fileName,
        name: documentName,
        url: publicUrl,
        uploaded_at: new Date().toISOString(),
      };

      const { error: updateError } = await supabase
        .from("company_partners")
        .update({
          documents: [...existingDocs, newDoc],
        })
        .eq("id", partnerId);

      if (updateError) throw updateError;

      toast({
        title: "تم التحميل",
        description: "تم تحميل المستند بنجاح",
      });

      // Clear form and close dialog
      setFile(null);
      setDocumentName("");
      onSuccess();
    } catch (error) {
      console.error("Error uploading document:", error);
      toast({
        variant: "destructive",
        title: "خطأ في التحميل",
        description: "حدث خطأ أثناء تحميل المستند",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>إضافة مستند جديد</DialogTitle>
          <DialogDescription>
            قم بتحميل مستند جديد وإضافته لبيانات الشريك
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="documentName">اسم المستند</Label>
            <Input
              id="documentName"
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
              placeholder="أدخل اسم المستند"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="file">الملف</Label>
            <Input
              id="file"
              type="file"
              onChange={handleFileChange}
              className="cursor-pointer"
              required
            />
          </div>
          
          <div className="flex justify-end space-x-2 space-x-reverse">
            <Button type="button" variant="outline" onClick={onClose}>
              إلغاء
            </Button>
            <Button type="submit" disabled={isUploading}>
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  جاري التحميل...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  تحميل المستند
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default DocumentUploadDialog;
