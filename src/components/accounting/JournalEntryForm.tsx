
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { JournalEntry } from "@/types/database";
import { calculateTotals, validateJournalEntry } from "@/utils/journalEntryHelpers";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";

interface JournalEntryFormProps {
  initialData?: Partial<JournalEntry>;
  onSuccess: (data: JournalEntry) => void;
  onClose: () => void;
}

export default function JournalEntryForm({
  initialData,
  onSuccess,
  onClose,
}: JournalEntryFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<Partial<JournalEntry>>({
    description: initialData?.description || "",
    entry_name: initialData?.entry_name || "",
    amount: initialData?.amount || 0,
    entry_type: initialData?.entry_type || "income",
    financial_statement_section: initialData?.financial_statement_section || "income_statement",
    entry_date: initialData?.entry_date || format(new Date(), "yyyy-MM-dd"),
    total_debit: initialData?.total_debit || 0,
    total_credit: initialData?.total_credit || 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // تحديث إجمالي المدين والدائن عند تغيير المبلغ أو نوع القيد
  useEffect(() => {
    const { total_debit, total_credit } = calculateTotals(formData);
    setFormData(prev => ({ 
      ...prev, 
      total_debit, 
      total_credit 
    }));
  }, [formData.amount, formData.entry_type]);

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

    const errors = validateJournalEntry(formData);
    if (errors.length > 0) {
      toast({
        variant: "destructive",
        title: "بيانات ناقصة",
        description: errors.join(', '),
      });
      return;
    }

    setIsSubmitting(true);

    try {
      let result;
      
      // تأكد من أن الحقول المطلوبة متوفرة في الكائن
      const entryData = {
        description: formData.description || "",
        entry_date: formData.entry_date || "",
        entry_name: formData.entry_name,
        amount: formData.amount,
        entry_type: formData.entry_type,
        financial_statement_section: formData.financial_statement_section,
        total_debit: formData.total_debit,
        total_credit: formData.total_credit
      };
      
      if (initialData?.id) {
        // تحديث قيد موجود
        result = await supabase
          .from("journal_entries")
          .update(entryData)
          .eq("id", initialData.id)
          .select();
      } else {
        // إضافة قيد جديد
        result = await supabase
          .from("journal_entries")
          .insert(entryData)
          .select();
      }

      const { data, error } = result;
      if (error) throw error;

      if (data && data.length > 0) {
        toast({
          title: initialData?.id ? "تم التعديل" : "تم الإضافة",
          description: `تم ${initialData?.id ? "تعديل" : "إضافة"} القيد بنجاح`,
        });
        
        onSuccess(data[0] as JournalEntry);
      }
    } catch (error) {
      console.error("خطأ:", error);
      toast({
        variant: "destructive",
        title: "فشل في الحفظ",
        description: error instanceof Error ? error.message : "حدث خطأ غير معروف",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="entry_name">اسم القيد</Label>
        <Input
          id="entry_name"
          name="entry_name"
          value={formData.entry_name}
          onChange={handleChange}
          placeholder="أدخل اسم القيد المحاسبي"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">الوصف</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="أدخل وصف القيد المحاسبي"
          required
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="amount">المبلغ (بالريال)</Label>
          <Input
            id="amount"
            name="amount"
            type="number"
            value={formData.amount}
            onChange={handleChange}
            placeholder="أدخل المبلغ"
            required
            min="0.01"
            step="0.01"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="entry_date">التاريخ</Label>
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
        <div className="space-y-2">
          <Label htmlFor="entry_type">نوع القيد</Label>
          <Select value={formData.entry_type} onValueChange={(value) => handleSelectChange("entry_type", value)}>
            <SelectTrigger id="entry_type">
              <SelectValue placeholder="اختر نوع القيد" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="income">إيراد</SelectItem>
              <SelectItem value="expense">مصروف</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="financial_statement_section">القائمة المالية</Label>
          <Select 
            value={formData.financial_statement_section} 
            onValueChange={(value) => handleSelectChange("financial_statement_section", value)}
          >
            <SelectTrigger id="financial_statement_section">
              <SelectValue placeholder="اختر القائمة المالية" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="income_statement">قائمة الدخل</SelectItem>
              <SelectItem value="balance_sheet">الميزانية العمومية</SelectItem>
              <SelectItem value="cash_flow">قائمة التدفقات النقدية</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="flex justify-end space-x-2 space-x-reverse mt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          إلغاء
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              جاري الحفظ...
            </>
          ) : initialData?.id ? (
            "تحديث القيد"
          ) : (
            "إضافة القيد"
          )}
        </Button>
      </div>
    </form>
  );
}
