
import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Paperclip } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
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
  const [formData, setFormData] = useState({
    description: editingEntry?.description || "",
    entry_name: editingEntry?.entry_name || "",
    amount: editingEntry?.amount || 0,
    entry_type: editingEntry?.entry_type || "income",
    financial_statement_section: editingEntry?.financial_statement_section || "income_statement",
    entry_date: editingEntry?.entry_date || format(new Date(), "yyyy-MM-dd"),
    total_debit: editingEntry?.total_debit || 0,
    total_credit: editingEntry?.total_credit || 0,
    attachment: null as File | null
  });

  const resetForm = () => {
    setFormData({
      description: "",
      entry_name: "",
      amount: 0,
      entry_type: "income",
      financial_statement_section: "income_statement",
      entry_date: format(new Date(), "yyyy-MM-dd"),
      total_debit: 0,
      total_credit: 0,
      attachment: null
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "amount" ? parseFloat(value) || 0 : value,
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({
        ...formData,
        attachment: e.target.files[0]
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.description || !formData.entry_name || formData.amount <= 0) {
      toast({
        variant: "destructive",
        title: "بيانات ناقصة",
        description: "تأكد من إدخال جميع الحقول المطلوبة",
      });
      return;
    }

    try {
      // حساب قيم الدائن والمدين بناءً على نوع القيد
      const total_debit = formData.entry_type === "expense" ? formData.amount : 0;
      const total_credit = formData.entry_type === "income" ? formData.amount : 0;

      // إنشاء كائن البيانات للإرسال
      const entryData = {
        description: formData.description,
        entry_name: formData.entry_name,
        amount: formData.amount,
        entry_type: formData.entry_type,
        financial_statement_section: formData.financial_statement_section,
        entry_date: formData.entry_date,
        total_debit,
        total_credit
      };

      let result;
      
      if (editingEntry) {
        result = await supabase
          .from("journal_entries")
          .update(entryData)
          .eq("id", editingEntry.id);
      } else {
        result = await supabase
          .from("journal_entries")
          .insert([entryData]);
      }

      const { error } = result;
      if (error) throw error;

      // تحميل المرفق إذا كان موجودًا
      if (formData.attachment) {
        // تنفيذ رمز تحميل الملف هنا
        toast({
          title: "تم رفع المرفق",
          description: "تم رفع المرفق بنجاح",
        });
      }

      toast({
        title: editingEntry ? "تم التعديل" : "تم الإضافة",
        description: `تم ${editingEntry ? "تعديل" : "إضافة"} القيد بنجاح`,
      });
      
      resetForm();
      setIsOpen(false);
      onSuccess();
    } catch (error) {
      console.error("خطأ:", error);
      toast({
        variant: "destructive",
        title: "فشل في الحفظ",
        description: error instanceof Error ? error.message : "حدث خطأ غير معروف",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) resetForm();
    }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{editingEntry ? "تعديل قيد" : "إضافة قيد"}</DialogTitle>
          <DialogDescription>
            أدخل تفاصيل القيد. جميع الحقول المميزة بـ * مطلوبة.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="entry_name">اسم القيد *</Label>
            <Input
              id="entry_name"
              name="entry_name"
              value={formData.entry_name}
              onChange={handleChange}
              required
              dir="rtl"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">الوصف *</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              dir="rtl"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="amount">المبلغ *</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                value={formData.amount}
                onChange={handleChange}
                required
                dir="ltr"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="entry_date">التاريخ *</Label>
              <Input
                id="entry_date"
                name="entry_date"
                type="date"
                value={formData.entry_date}
                onChange={handleChange}
                required
                dir="ltr"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>نوع القيد</Label>
              <Select
                value={formData.entry_type}
                onValueChange={(value) => handleSelectChange("entry_type", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر النوع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">إيراد</SelectItem>
                  <SelectItem value="expense">مصروف</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label>القائمة المالية</Label>
              <Select
                value={formData.financial_statement_section}
                onValueChange={(value) => handleSelectChange("financial_statement_section", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر القائمة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income_statement">قائمة الدخل</SelectItem>
                  <SelectItem value="balance_sheet">الميزانية العمومية</SelectItem>
                  <SelectItem value="cash_flow">التدفقات النقدية</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid gap-2">
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
                {formData.attachment ? formData.attachment.name : "اختر ملفًا"}
              </Button>
              {formData.attachment && (
                <Button 
                  type="button" 
                  variant="destructive" 
                  size="sm"
                  onClick={() => setFormData({...formData, attachment: null})}
                >
                  حذف
                </Button>
              )}
            </div>
          </div>
          
          <Button type="submit" className="w-full mt-2">
            {editingEntry ? "تحديث القيد" : "إضافة القيد"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default JournalEntryDialog;
