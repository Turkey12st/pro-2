import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { Plus, Minus, CheckCircle, XCircle } from "lucide-react";
import type { JournalEntry } from "@/types/database";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// =================================================================
// أنواع البيانات الجديدة لنظام القيد المزدوج
// =================================================================
/**
 * يمثل سطراً واحداً في القيد المحاسبي.
 * يحدد الحساب والمبلغ المدين أو الدائن.
 */
type JournalEntryLine = {
  id: string; // معرف مؤقت للتحكم في القائمة
  account_name: string; // اسم الحساب
  debit: number;
  credit: number;
};

/**
 * يمثل قيدًا محاسبياً كاملاً بنظام القيد المزدوج.
 */
type DoubleEntryJournalEntry = {
  entry_date: string;
  description: string;
  entry_name?: string;
  lines: JournalEntryLine[];
};

// =================================================================
// خصائص المكون
// =================================================================
interface JournalEntryDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  editingEntry: JournalEntry | null;
  onSuccess: () => void;
}

// =================================================================
// المكون نفسه
// =================================================================
const JournalEntryDialog: React.FC<JournalEntryDialogProps> = ({
  isOpen,
  setIsOpen,
  editingEntry,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<DoubleEntryJournalEntry>({
    entry_date: format(new Date(), "yyyy-MM-dd"),
    description: "",
    entry_name: "",
    lines: [{ id: Math.random().toString(), account_name: "", debit: 0, credit: 0 }],
  });
  const [totalDebit, setTotalDebit] = useState(0);
  const [totalCredit, setTotalCredit] = useState(0);
  const [isBalanced, setIsBalanced] = useState(false);
  const { toast } = useToast();

  // تحديث حالة النموذج عند فتح نافذة التعديل
  useEffect(() => {
    if (editingEntry) {
      // ملاحظة: هذا الجزء لا يعمل حاليًا بشكل كامل لأن نموذج البيانات القديم
      // لا يتضمن "lines". سيتم تعديله في المراحل القادمة.
      // هنا فقط نقوم بملء الحقول الأساسية.
      setFormData({
        entry_date: editingEntry.entry_date,
        description: editingEntry.description,
        entry_name: editingEntry.entry_name || "",
        lines: [
          { id: "debit", account_name: "", debit: editingEntry.total_debit, credit: 0 },
          { id: "credit", account_name: "", debit: 0, credit: editingEntry.total_credit },
        ],
      });
    } else {
      // إعادة تعيين النموذج للإضافة
      setFormData({
        entry_date: format(new Date(), "yyyy-MM-dd"),
        description: "",
        entry_name: "",
        lines: [{ id: Math.random().toString(), account_name: "", debit: 0, credit: 0 }],
      });
    }
  }, [editingEntry, isOpen]);

  // حساب الإجماليات والتحقق من التوازن
  useEffect(() => {
    const calculatedDebit = formData.lines.reduce((sum, line) => sum + line.debit, 0);
    const calculatedCredit = formData.lines.reduce((sum, line) => sum + line.credit, 0);
    setTotalDebit(calculatedDebit);
    setTotalCredit(calculatedCredit);
    setIsBalanced(calculatedDebit === calculatedCredit && calculatedDebit > 0);
  }, [formData.lines]);

  // إضافة سطر جديد إلى القيد
  const addLine = () => {
    setFormData((prev) => ({
      ...prev,
      lines: [...prev.lines, { id: Math.random().toString(), account_name: "", debit: 0, credit: 0 }],
    }));
  };

  // إزالة سطر من القيد
  const removeLine = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      lines: prev.lines.filter((line) => line.id !== id),
    }));
  };

  // التعامل مع تغيير حقول كل سطر
  const handleLineChange = (id: string, field: "account_name" | "debit" | "credit", value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      lines: prev.lines.map((line) =>
        line.id === id ? { ...line, [field]: value } : line
      ),
    }));
  };

  // التعامل مع تغيير الحقول الرئيسية
  const handleMainChange = (field: keyof Omit<DoubleEntryJournalEntry, "lines">, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // دالة الحفظ
  const handleSubmit = async () => {
    if (!isBalanced) {
      toast({
        variant: "destructive",
        title: "خطأ في القيد",
        description: "يجب أن يتساوى إجمالي المدين مع إجمالي الدائن.",
      });
      return;
    }

    try {
      const entryToSave = {
        entry_name: formData.entry_name,
        entry_date: formData.entry_date,
        description: formData.description,
        total_debit: totalDebit,
        total_credit: totalCredit,
        // ملاحظة: الحقول total_debit و total_credit أصبحت الآن محسوبة وليست مدخلة يدوياً.
        // سيتم لاحقًا إرسال بيانات البنود (lines) أيضًا إلى قاعدة البيانات.
      };

      if (editingEntry) {
        // تحديث القيد
        const { error } = await supabase
          .from("journal_entries")
          .update(entryToSave)
          .eq("id", editingEntry.id);
        if (error) throw error;
      } else {
        // إضافة قيد جديد
        const { error } = await supabase
          .from("journal_entries")
          .insert(entryToSave);
        if (error) throw error;
      }

      toast({
        title: "تم الحفظ",
        description: "تم حفظ القيد بنجاح.",
      });
      setIsOpen(false);
      onSuccess();
    } catch (error) {
      console.error("خطأ في حفظ القيد:", error);
      toast({
        variant: "destructive",
        title: "فشل في الحفظ",
        description: "حدث خطأ أثناء محاولة حفظ القيد.",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[700px] max-h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingEntry ? "تعديل قيد محاسبي" : "إضافة قيد محاسبي جديد"}
          </DialogTitle>
          <DialogDescription>
            أدخل تفاصيل القيد المحاسبي. تأكد من توازن القيد.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="entry_date">التاريخ</Label>
              <Input
                id="entry_date"
                type="date"
                value={formData.entry_date}
                onChange={(e) => handleMainChange("entry_date", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="entry_name">اسم القيد (اختياري)</Label>
              <Input
                id="entry_name"
                value={formData.entry_name}
                onChange={(e) => handleMainChange("entry_name", e.target.value)}
                placeholder="مثل: قيد شراء بضاعة"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">الوصف</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleMainChange("description", e.target.value)}
              placeholder="وصف تفصيلي للقيد"
            />
          </div>
          <div className="space-y-4">
            <Label>بنود القيد</Label>
            {formData.lines.map((line, index) => (
              <div key={line.id} className="grid grid-cols-10 gap-2 items-end">
                <div className="col-span-4">
                  <Label htmlFor={`account_${line.id}`}>اسم الحساب</Label>
                  <Input
                    id={`account_${line.id}`}
                    placeholder="مثال: الصندوق، المبيعات"
                    value={line.account_name}
                    onChange={(e) => handleLineChange(line.id, "account_name", e.target.value)}
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor={`debit_${line.id}`}>مدين</Label>
                  <Input
                    id={`debit_${line.id}`}
                    type="number"
                    value={line.debit}
                    onChange={(e) => handleLineChange(line.id, "debit", parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor={`credit_${line.id}`}>دائن</Label>
                  <Input
                    id={`credit_${line.id}`}
                    type="number"
                    value={line.credit}
                    onChange={(e) => handleLineChange(line.id, "credit", parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="col-span-2 flex items-center gap-1">
                  {formData.lines.length > 1 && (
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => removeLine(line.id)}
                      aria-label="إزالة سطر"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  )}
                  {index === formData.lines.length - 1 && (
                    <Button
                      variant="secondary"
                      size="icon"
                      onClick={addLine}
                      aria-label="إضافة سطر"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center mt-4 p-3 rounded-md border">
            <div className="text-lg font-bold flex items-center">
              الحالة: {isBalanced ? (
                <CheckCircle className="h-6 w-6 text-green-500 mr-2" />
              ) : (
                <XCircle className="h-6 w-6 text-red-500 mr-2" />
              )}
            </div>
            <div className="flex gap-4">
              <span className="font-semibold text-primary">المدين الإجمالي: {totalDebit.toFixed(2)}</span>
              <span className="font-semibold text-destructive">الدائن الإجمالي: {totalCredit.toFixed(2)}</span>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" onClick={handleSubmit} disabled={!isBalanced}>
            حفظ القيد
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default JournalEntryDialog;
