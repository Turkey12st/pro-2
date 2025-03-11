
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface DocumentUploadDialogProps {
  isOpen: boolean;
  partnerId: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function DocumentUploadDialog({ isOpen, partnerId, onClose, onSuccess }: DocumentUploadDialogProps) {
  const [files, setFiles] = useState<FileList | null>(null);
  const [docTitle, setDocTitle] = useState("");
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerId || !files || files.length === 0) return;

    try {
      setUploading(true);
      
      const newDocument = {
        title: docTitle,
        uploaded_at: new Date().toISOString(),
        file_name: files[0].name,
      };
      
      const { data: currentPartner, error: fetchError } = await supabase
        .from('company_partners')
        .select('documents')
        .eq('id', partnerId)
        .single();
      
      if (fetchError) throw fetchError;
      
      const updatedDocuments = Array.isArray(currentPartner?.documents) 
        ? [...currentPartner.documents, newDocument]
        : [newDocument];
      
      const { error } = await supabase
        .from('company_partners')
        .update({ documents: updatedDocuments })
        .eq('id', partnerId);
      
      if (error) throw error;
      
      toast({
        title: "تم رفع المستند بنجاح",
        description: "تم إضافة المستند إلى ملفات الشريك",
      });
      
      onSuccess();
    } catch (error) {
      console.error("Error uploading document:", error);
      toast({
        variant: "destructive",
        title: "خطأ في رفع المستند",
        description: "حدث خطأ أثناء محاولة رفع المستند",
      });
    } finally {
      setUploading(false);
      setFiles(null);
      setDocTitle("");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>رفع مستند للشريك</DialogTitle>
          <DialogDescription>
            يمكنك رفع مستندات متعلقة بالشريك مثل صورة الهوية أو عقود الشراكة
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="docTitle">عنوان المستند</Label>
            <Input
              id="docTitle"
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
              placeholder="مثل: عقد شراكة، صورة هوية، ..."
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="docFile">ملف المستند</Label>
            <Input
              id="docFile"
              type="file"
              onChange={(e) => setFiles(e.target.files)}
              className="cursor-pointer"
              required
            />
          </div>
          
          <div className="flex justify-end space-x-2 space-x-reverse">
            <Button type="button" variant="outline" onClick={onClose}>
              إلغاء
            </Button>
            <Button type="submit" disabled={uploading}>
              {uploading ? "جاري الرفع..." : "رفع المستند"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
