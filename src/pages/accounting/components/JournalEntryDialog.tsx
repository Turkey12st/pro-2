
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import JournalEntryForm from "@/components/accounting/JournalEntryForm";
import FileAttachment from "@/components/accounting/FileAttachment";
import { uploadFile } from "@/utils/fileUploadHelpers";
import type { JournalEntry } from "@/types/database";

interface JournalEntryDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  editingEntry: JournalEntry | null;
  onSuccess: () => void;
}

const JournalEntryDialog: React.FC<JournalEntryDialogProps> = ({
  isOpen,
  setIsOpen,
  editingEntry,
  onSuccess,
}) => {
  const { toast } = useToast();
  const [attachment, setAttachment] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // إعادة تعيين المرفق عند فتح/إغلاق النافذة
  useEffect(() => {
    if (!isOpen) {
      setAttachment(null);
      setIsUploading(false);
    }
  }, [isOpen]);

  const handleDialogClose = () => {
    setIsOpen(false);
  };

  const handleSuccess = async (entry: JournalEntry) => {
    if (attachment) {
      try {
        setIsUploading(true);
        
        // رفع الملف إلى Supabase Storage
        const fileUrl = await uploadFile(
          attachment,
          'journal-entries',
          `entry_${entry.id}_${attachment.name}`
        );
        
        // يمكن هنا تحديث القيد المحاسبي برابط المرفق إذا لزم الأمر
        // مثال: await updateJournalEntryAttachment(entry.id, fileUrl);
        
        toast({
          title: "تم رفع المرفق",
          description: "تم رفع المرفق بنجاح",
        });
      } catch (error) {
        console.error("خطأ في رفع المرفق:", error);
        toast({
          variant: "destructive",
          title: "خطأ في رفع المرفق",
          description: "حدث خطأ أثناء محاولة رفع المرفق",
        });
      } finally {
        setIsUploading(false);
      }
    }
    
    setIsOpen(false);
    onSuccess();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{editingEntry ? "تعديل قيد" : "إضافة قيد"}</DialogTitle>
          <DialogDescription>
            أدخل تفاصيل القيد. جميع الحقول المميزة بـ * مطلوبة.
          </DialogDescription>
        </DialogHeader>
        
        <JournalEntryForm
          initialData={editingEntry || undefined}
          onSuccess={handleSuccess}
          onClose={handleDialogClose}
        />
        
        <div className="mt-4">
          <FileAttachment 
            attachment={attachment} 
            onChange={setAttachment} 
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default JournalEntryDialog;
