
import { useState, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface FileUploadProps {
  value: File | null;
  accept?: string;
  onChange: (file: File | null) => void;
}

// A simplified FileUpload component if the imported one doesn't match our needs
const FileUpload = ({ value, accept, onChange }: FileUploadProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onChange(e.target.files[0]);
    }
  };

  return (
    <Input
      type="file"
      onChange={handleChange}
      accept={accept || "*"}
    />
  );
};

interface DocumentUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  partnerId: string | null;
  onSuccess?: () => void;
}

// Define a type for document objects to avoid type instantiation issues
interface DocumentObject {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedAt: string;
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

      // Update the partner record with the document
      const { data, error } = await supabase
        .from("company_partners")
        .select("*")
        .eq("id", partnerId)
        .single();

      if (error) throw error;

      // Create document object
      const newDocument: DocumentObject = {
        id: crypto.randomUUID(),
        name: documentName,
        url: documentUrl,
        type: file.type,
        size: file.size,
        uploadedAt: new Date().toISOString()
      };

      // Add document to documents array - safely
      let existingDocs: DocumentObject[] = [];
      
      if (data.documents) {
        // Use a simple approach to ensure we're working with a basic array
        if (Array.isArray(data.documents)) {
          // Create copies of each document object without reference issues
          existingDocs = data.documents.map((doc: any) => ({
            id: doc.id || "",
            name: doc.name || "",
            url: doc.url || "",
            type: doc.type || "",
            size: doc.size || 0,
            uploadedAt: doc.uploadedAt || new Date().toISOString()
          }));
        }
      }
      
      // Add the new document to our array
      existingDocs.push(newDocument);

      // Update partner record
      const { error: updateError } = await supabase
        .from("company_partners")
        .update({ documents: existingDocs })
        .eq("id", partnerId);

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
              onChange={handleFileChange}
              value={file}
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

export default DocumentUploadDialog;
