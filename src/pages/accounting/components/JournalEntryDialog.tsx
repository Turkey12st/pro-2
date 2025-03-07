
import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
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

      const { error } = editingEntry
        ? await supabase
            .from("journal_entries")
            .update({
              ...formData,
              total_debit,
              total_credit,
            })
            .eq("id", editingEntry.id)
        : await supabase.from("journal_entries").insert([{
            ...formData,
            total_debit,
            total_credit,
          }]);

      if (error) throw error;

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
      <DialogContent>
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
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="amount">المبلغ *</Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              value={formData.amount}
              onChange={handleChange}
              required
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
            />
          </div>
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
          <Button type="submit" className="w-full">
            {editingEntry ? "تحديث القيد" : "إضافة القيد"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default JournalEntryDialog;
