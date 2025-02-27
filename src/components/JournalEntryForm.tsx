
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface JournalEntryFormProps {
  initialData?: {
    description: string;
    amount: number;
  };
  onSuccess: (data: { description: string; amount: number }) => void;
  onClose: () => void;
}

export default function JournalEntryForm({
  initialData,
  onSuccess,
  onClose,
}: JournalEntryFormProps) {
  const { toast } = useToast();
  const [description, setDescription] = useState(initialData?.description || "");
  const [amount, setAmount] = useState(initialData?.amount || 0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!description) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "يرجى إدخال وصف للقيد المحاسبي",
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
    console.info("بدء عملية حفظ القيد المحاسبي...");

    try {
      // حفظ القيد في قاعدة البيانات
      const { error } = await supabase.from("journal_entries").insert({
        description,
        amount,
        entry_date: new Date().toISOString(),
        entry_type: amount > 0 ? "income" : "expense",
        status: "draft",
      });

      if (error) throw error;

      toast({
        title: "تم الحفظ بنجاح",
        description: "تم حفظ القيد المحاسبي بنجاح",
      });

      onSuccess({ description, amount });
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
