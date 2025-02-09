
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/hooks/useSupabase";
import {
  DialogFooter,
} from "@/components/ui/dialog";

type JournalEntry = {
  date: string;
  description: string;
  account: string;
  debit: number;
  credit: number;
  reference: string;
};

interface JournalEntryFormProps {
  onSuccess: () => void;
  onClose: () => void;
}

export default function JournalEntryForm({ onSuccess, onClose }: JournalEntryFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [entry, setEntry] = useState<JournalEntry>({
    date: new Date().toISOString().split('T')[0],
    description: "",
    account: "",
    debit: 0,
    credit: 0,
    reference: "",
  });

  const validateEntry = () => {
    if (!entry.description || entry.description.trim() === "") {
      throw new Error("الرجاء إدخال وصف القيد المحاسبي");
    }
    if (!entry.account) {
      throw new Error("الرجاء اختيار الحساب");
    }
    if (entry.debit < 0 || entry.credit < 0) {
      throw new Error("لا يمكن أن تكون القيم المدينة أو الدائنة سالبة");
    }
    if (entry.debit === 0 && entry.credit === 0) {
      throw new Error("يجب إدخال قيمة مدينة أو دائنة");
    }
  };

  const handleInputChange = (field: keyof JournalEntry, value: string | number) => {
    setEntry(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      console.log("بدء عملية حفظ القيد المحاسبي...");
      
      validateEntry();

      const { data, error } = await supabase
        .from('journal_entries')
        .insert([{
          ...entry,
          created_at: new Date().toISOString(),
        }])
        .select();

      if (error) throw error;

      console.log("تم حفظ القيد المحاسبي بنجاح:", data);

      toast({
        title: "تم الحفظ بنجاح",
        description: "تم حفظ القيد المحاسبي في قاعدة البيانات",
      });
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('خطأ في حفظ القيد المحاسبي:', error);
      toast({
        title: "خطأ في الحفظ",
        description: error instanceof Error ? error.message : "حدث خطأ أثناء حفظ القيد المحاسبي",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid gap-4">
      <div className="space-y-2">
        <Label>التاريخ</Label>
        <Input
          type="date"
          value={entry.date}
          onChange={(e) => handleInputChange("date", e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label>الوصف</Label>
        <Input
          value={entry.description}
          onChange={(e) => handleInputChange("description", e.target.value)}
          placeholder="وصف القيد المحاسبي"
          required
        />
      </div>
      <div className="space-y-2">
        <Label>الحساب</Label>
        <Select
          value={entry.account}
          onValueChange={(value) => handleInputChange("account", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="اختر الحساب" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cash">النقدية</SelectItem>
            <SelectItem value="accounts-receivable">المدينون</SelectItem>
            <SelectItem value="accounts-payable">الدائنون</SelectItem>
            <SelectItem value="revenue">الإيرادات</SelectItem>
            <SelectItem value="expenses">المصروفات</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>مدين</Label>
        <Input
          type="number"
          value={entry.debit}
          onChange={(e) => handleInputChange("debit", parseFloat(e.target.value) || 0)}
          placeholder="0.00"
          min="0"
          step="0.01"
        />
      </div>
      <div className="space-y-2">
        <Label>دائن</Label>
        <Input
          type="number"
          value={entry.credit}
          onChange={(e) => handleInputChange("credit", parseFloat(e.target.value) || 0)}
          placeholder="0.00"
          min="0"
          step="0.01"
        />
      </div>
      <div className="space-y-2">
        <Label>رقم المرجع</Label>
        <Input
          value={entry.reference}
          onChange={(e) => handleInputChange("reference", e.target.value)}
          placeholder="رقم المرجع"
        />
      </div>
      <DialogFooter>
        <Button 
          onClick={handleSubmit} 
          disabled={isLoading}
        >
          {isLoading ? "جاري الحفظ..." : "حفظ القيد المحاسبي"}
        </Button>
      </DialogFooter>
    </div>
  );
}
