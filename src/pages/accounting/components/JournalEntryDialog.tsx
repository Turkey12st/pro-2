
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import JournalEntryForm from "@/components/accounting/JournalEntryForm";
import JournalEntryAttachment from "@/components/accounting/JournalEntryAttachment";
import { updateJournalEntryAttachment, deleteJournalEntryAttachment } from "@/utils/fileUploadHelpers";
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
  const [existingAttachmentUrl, setExistingAttachmentUrl] = useState<string | undefined>(undefined);
  const [isUploading, setIsUploading] = useState(false);
  const [savedEntryId, setSavedEntryId] = useState<string | null>(null);

  // إعادة تعيين الحالة عند فتح/إغلاق النافذة أو تغيير القيد المحرر
  useEffect(() => {
    if (isOpen && editingEntry) {
      // إذا كان هناك رابط للمرفق في القيد المحرر، قم بتعيينه
      const attachmentUrl = editingEntry.attachment_url;
      if (attachmentUrl) {
        setExistingAttachmentUrl(attachmentUrl);
      } else {
        setExistingAttachmentUrl(undefined);
      }
      setSavedEntryId(editingEntry.id);
    } else if (!isOpen) {
      setAttachment(null);
      setExistingAttachmentUrl(undefined);
      setIsUploading(false);
      setSavedEntryId(null);
    }
  }, [isOpen, editingEntry]);

  const handleDialogClose = () => {
    setIsOpen(false);
  };

  const handleFileUploadSuccess = async (fileUrl: string) => {
    if (savedEntryId) {
      try {
        await updateJournalEntryAttachment(savedEntryId, fileUrl);
        toast({
          title: "تم رفع المرفق",
          description: "تم ربط المرفق بالقيد المحاسبي بنجاح",
        });
        setExistingAttachmentUrl(fileUrl);
      } catch (error) {
        console.error("خطأ في تحديث رابط المرفق:", error);
        toast({
          variant: "destructive",
          title: "خطأ في تحديث المرفق",
          description: "حدث خطأ أثناء محاولة ربط المرفق بالقيد المحاسبي",
        });
      }
    }
  };

  const handleDeleteAttachment = async () => {
    if (savedEntryId && existingAttachmentUrl) {
      try {
        await deleteJournalEntryAttachment(savedEntryId, existingAttachmentUrl);
        toast({
          title: "تم حذف المرفق",
          description: "تم حذف المرفق من القيد المحاسبي بنجاح",
        });
        setExistingAttachmentUrl(undefined);
      } catch (error) {
        console.error("خطأ في حذف المرفق:", error);
        toast({
          variant: "destructive",
          title: "خطأ في حذف المرفق",
          description: "حدث خطأ أثناء محاولة حذف المرفق من القيد المحاسبي",
        });
      }
    }
  };

  const handleFormSuccess = (entry: JournalEntry) => {
    // حفظ معرف القيد الجديد أو المحدث لاستخدامه في رفع المرفقات
    setSavedEntryId(entry.id);
    
    // إذا تم تحديد ملف مرفق جديد، قم بتحميله بعد حفظ القيد
    if (attachment) {
      setIsUploading(true);
      // سيتم التعامل مع رفع الملف من خلال مكون JournalEntryAttachment
    } else {
      // إذا لم يكن هناك مرفق جديد، أغلق النافذة وأخبر المستخدم بنجاح العملية
      setIsOpen(false);
      onSuccess();
    }
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
          onSuccess={handleFormSuccess}
          onClose={handleDialogClose}
        />
        
        <div className="mt-4">
          <JournalEntryAttachment 
            entryId={savedEntryId || undefined}
            attachment={attachment}
            onChange={setAttachment}
            existingUrl={existingAttachmentUrl}
            onDelete={handleDeleteAttachment}
            onSuccess={handleFileUploadSuccess}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default JournalEntryDialog;
