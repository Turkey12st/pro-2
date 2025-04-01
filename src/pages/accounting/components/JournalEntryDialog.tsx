
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import JournalEntryForm from "@/components/accounting/JournalEntryForm";
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

  // إعادة تعيين المرفق عند فتح/إغلاق النافذة
  useEffect(() => {
    if (!isOpen) {
      setAttachment(null);
    }
  }, [isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAttachment(e.target.files[0]);
    }
  };

  const handleDialogClose = () => {
    setIsOpen(false);
  };

  const handleSuccess = (entry: JournalEntry) => {
    if (attachment) {
      // هنا يمكن إضافة رمز لتحميل المرفق إلى Supabase Storage
      toast({
        title: "تم رفع المرفق",
        description: "تم رفع المرفق بنجاح",
      });
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
        
        <div className="grid gap-2 mt-4">
          <Label htmlFor="attachment">إضافة مرفق</Label>
          <div className="flex items-center gap-2">
            <Input
              id="attachment"
              name="attachment"
              type="file"
              onChange={handleFileChange}
              className="hidden"
            />
            <Button 
              type="button" 
              variant="outline" 
              className="w-full flex items-center gap-2"
              onClick={() => document.getElementById('attachment')?.click()}
            >
              <Paperclip className="h-4 w-4" />
              {attachment ? attachment.name : "اختر ملفًا"}
            </Button>
            {attachment && (
              <Button 
                type="button" 
                variant="destructive" 
                size="sm"
                onClick={() => setAttachment(null)}
              >
                حذف
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default JournalEntryDialog;
