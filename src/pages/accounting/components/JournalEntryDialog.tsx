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
  const [isSaving, setIsSaving] = useState(false); // تم تغيير الاسم من isUploading إلى isSaving ليكون أشمل
  const [savedEntryId, setSavedEntryId] = useState<string | null>(null);

  // إعادة تعيين الحالة عند فتح/إغلاق النافذة أو تغيير القيد المحرر
  useEffect(() => {
    if (isOpen) {
      if (editingEntry) {
        // عند فتح النافذة لتعديل قيد موجود، يتم تهيئة الحالة برابط المرفق الحالي
        setExistingAttachmentUrl(editingEntry.attachment_url);
        setSavedEntryId(editingEntry.id);
      } else {
        // عند فتح النافذة لإضافة قيد جديد، يتم إعادة تعيين كل شيء
        setAttachment(null);
        setExistingAttachmentUrl(undefined);
        setSavedEntryId(null);
      }
    } else {
      // عند إغلاق النافذة، يتم إعادة تعيين جميع الحالات
      setAttachment(null);
      setExistingAttachmentUrl(undefined);
      setIsSaving(false);
      setSavedEntryId(null);
    }
  }, [isOpen, editingEntry]);

  // دالة تُستدعى عند نجاح حفظ القيد في قاعدة البيانات
  const handleFormSuccess = (entry: JournalEntry) => {
    // يتم حفظ معرف القيد الذي تم حفظه للربط مع المرفق
    setSavedEntryId(entry.id);
    
    // إذا كان هناك مرفق جديد، يتم البدء بعملية الرفع
    if (attachment) {
      setIsSaving(true);
    } else {
      // إذا لم يكن هناك مرفق، يتم إغلاق النافذة وتنفيذ دالة النجاح
      setIsOpen(false);
      onSuccess();
    }
  };

  // دالة تُستدعى عند نجاح رفع المرفق
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
      } finally {
        setIsSaving(false); // إعادة تعيين حالة الحفظ بعد الانتهاء
        setIsOpen(false); // إغلاق النافذة
        onSuccess(); // تنفيذ دالة النجاح النهائية
      }
    }
  };

  // دالة تُستدعى عند حذف المرفق
  const handleDeleteAttachment = async () => {
    if (savedEntryId && existingAttachmentUrl) {
      setIsSaving(true);
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
      } finally {
        setIsSaving(false); // إعادة تعيين حالة الحفظ بعد الانتهاء
      }
    }
  };

  const handleDialogClose = () => {
    if (!isSaving) {
      setIsOpen(false);
    } else {
      // منع إغلاق النافذة أثناء عملية الرفع
      toast({
        variant: "destructive",
        title: "لا يمكن إغلاق النافذة الآن",
        description: "يتم حالياً تحميل مرفق، يرجى الانتظار حتى تكتمل العملية.",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {editingEntry ? "تعديل قيد محاسبي" : "إضافة قيد محاسبي جديد"}
          </DialogTitle>
          <DialogDescription>
            أدخل تفاصيل القيد المحاسبي وفقاً للمعايير المحاسبية العالمية. جميع الحقول المميزة بـ * مطلوبة.
          </DialogDescription>
        </DialogHeader>
        
        <JournalEntryForm
          initialData={editingEntry || undefined}
          onSuccess={handleFormSuccess}
          onClose={handleDialogClose}
        />
        
        {savedEntryId && (
          <div className="mt-4 border-t pt-4">
            <JournalEntryAttachment 
              entryId={savedEntryId}
              attachment={attachment}
              onChange={setAttachment}
              existingUrl={existingAttachmentUrl}
              onDelete={handleDeleteAttachment}
              onSuccess={handleFileUploadSuccess}
              isSaving={isSaving} // تمرير حالة الحفظ إلى المكون الفرعي
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default JournalEntryDialog;
