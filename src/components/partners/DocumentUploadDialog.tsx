
import { useState, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import FileUpload from "@/components/hr/FileUpload";
import { Json } from "@/types/database";

// Define document item type separately to avoid infinite recursion
export interface DocumentItem {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedAt: string;
}

interface DocumentUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  partnerId: string | null;
  onSuccess?: () => void;
}

export function DocumentUploadDialog({
  open,
  onOpenChange,
  partnerId,
  onSuccess,
}: DocumentUploadDialogProps) {
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
      // Upload file to storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${partnerId}-${Date.now()}.${fileExt}`;
      const filePath = `partners/${partnerId}/documents/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("documents")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from("documents")
        .getPublicUrl(filePath);

      const documentUrl = publicUrlData.publicUrl;

      // Update the partner record directly without fetching current data
      // This avoids the need to access a non-existent "partners" table
      const { error: updateError } = await supabase.rpc("add_partner_document", {
        p_partner_id: partnerId,
        p_document_name: documentName,
        p_document_url: documentUrl,
        p_document_type: file.type,
        p_document_size: file.size
      });

      if (updateError) throw updateError;

      toast({
        title: "تم الرفع بنجاح",
        description: "تم رفع المستند بنجاح",
      });

      resetForm();
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error uploading document:", error);
      toast({
        title: "خطأ في رفع المستند",
        description: "حدث خطأ أثناء رفع المستند",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>رفع مستند جديد</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid w-full items-center gap-1.5">
            <label htmlFor="documentName" className="text-sm font-medium">
              اسم المستند
            </label>
            <Input
              id="documentName"
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
              placeholder="أدخل اسم المستند"
            />
          </div>
          <div className="grid w-full items-center gap-1.5">
            <label htmlFor="file" className="text-sm font-medium">
              الملف
            </label>
            <FileUpload
              onFileSelect={handleFileChange}
              selectedFile={file}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              إلغاء
            </Button>
            <Button onClick={handleUpload} disabled={loading || !file}>
              {loading ? "جاري الرفع..." : "رفع المستند"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
