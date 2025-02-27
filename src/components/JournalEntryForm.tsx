
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface JournalEntryFormProps {
  initialData?: {
    description: string;
    entry_name: string;
    amount: number;
    entry_type?: string;
    financial_statement_section?: string;
  };
  onSuccess: (data: {
    description: string;
    entry_name: string;
    amount: number;
    entry_type: string;
    financial_statement_section: string;
  }) => void;
  onClose: () => void;
}

export default function JournalEntryForm({
  initialData,
  onSuccess,
  onClose,
}: JournalEntryFormProps) {
  const { toast } = useToast();
  const [description, setDescription] = useState(initialData?.description || "");
  const [entryName, setEntryName] = useState(initialData?.entry_name || "");
  const [amount, setAmount] = useState(initialData?.amount || 0);
  const [entryType, setEntryType] = useState(initialData?.entry_type || "income");
  const [financialSection, setFinancialSection] = useState(
    initialData?.financial_statement_section || "income_statement"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!description || !entryName) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "يرجى إدخال جميع البيانات المطلوبة",
      });
      return;
    }
    
    if (amount <= 0) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "يرجى إدخال مبلغ أكبر من صفر",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const entryData = {
        description,
        entry_name: entryName,
        amount,
        entry_date: new Date().toISOString().split('T')[0],
        entry_type: entryType,
        financial_statement_section: financialSection,
        status: "active",
        total_debit: entryType === 'expense' ? amount : 0,
        total_credit: entryType === 'income' ? amount : 0,
      };

      const { error } = await supabase
        .from("journal_entries")
        .insert(entryData);

      if (error) throw error;

      toast({
        title: "تم الحفظ بنجاح",
        description: "تم حفظ القيد المحاسبي بنجاح",
      });

      onSuccess({
        description,
        entry_name: entryName,
        amount,
        entry_type: entryType,
        financial_statement_section: financialSection
      });
    } catch (error) {
      console.error("خطأ في حفظ القيد المحاسبي:", error);
      toast({
        variant: "destructive",
        title: "خطأ في الحفظ",
        description: "حدث خطأ أثناء محاولة حفظ القيد المحاسبي",
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
          value={entryName}
          onChange={(e) => setEntryName(e.target.value)}
          placeholder="أدخل اسم القيد المحاسبي"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">الوصف</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="أدخل وصف القيد المحاسبي"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="amount">المبلغ (بالريال)</Label>
        <Input
          id="amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          placeholder="أدخل المبلغ"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="entry_type">نوع القيد</Label>
        <Select value={entryType} onValueChange={setEntryType}>
          <SelectTrigger>
            <SelectValue placeholder="اختر نوع القيد" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="income">إيراد</SelectItem>
            <SelectItem value="expense">مصروف</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="financial_section">القائمة المالية</Label>
        <Select value={financialSection} onValueChange={setFinancialSection}>
          <SelectTrigger>
            <SelectValue placeholder="اختر القائمة المالية" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="income_statement">قائمة الدخل</SelectItem>
            <SelectItem value="balance_sheet">الميزانية العمومية</SelectItem>
            <SelectItem value="cash_flow">قائمة التدفقات النقدية</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex justify-end space-x-2 space-x-reverse">
        <Button type="button" variant="outline" onClick={onClose}>
          إلغاء
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "جاري الحفظ..." : (initialData ? "تحديث" : "حفظ")}
        </Button>
      </div>
    </form>
  );
}
