
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AppLayout from "@/components/AppLayout";
import { useToast } from "@/components/ui/use-toast";
import { Calculator, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { supabase } from "@/hooks/useSupabase";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type JournalEntry = {
  date: string;
  description: string;
  account: string;
  debit: number;
  credit: number;
  reference: string;
};

export default function AccountingPage() {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [entry, setEntry] = useState<JournalEntry>({
    date: new Date().toISOString().split('T')[0],
    description: "",
    account: "",
    debit: 0,
    credit: 0,
    reference: "",
  });

  const handleInputChange = (field: keyof JournalEntry, value: string | number) => {
    setEntry(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      console.log("Saving journal entry...");
      
      if (!entry.description || !entry.account) {
        toast({
          title: "خطأ في الإدخال",
          description: "الرجاء إدخال جميع البيانات المطلوبة",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('journal_entries')
        .insert([{
          ...entry,
          created_at: new Date().toISOString(),
        }]);

      if (error) throw error;

      toast({
        title: "تم الحفظ بنجاح",
        description: "تم حفظ القيد المحاسبي",
      });
      
      setIsOpen(false);
      setEntry({
        date: new Date().toISOString().split('T')[0],
        description: "",
        account: "",
        debit: 0,
        credit: 0,
        reference: "",
      });
    } catch (error) {
      console.error('Error saving journal entry:', error);
      toast({
        title: "خطأ في الحفظ",
        description: "حدث خطأ أثناء حفظ القيد المحاسبي",
        variant: "destructive",
      });
    }
  };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-primary flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              القيود المحاسبية
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button className="w-full">
                  <Plus className="h-4 w-4 ml-2" />
                  إضافة قيد محاسبي جديد
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>إضافة قيد محاسبي جديد</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label>التاريخ</Label>
                    <Input
                      type="date"
                      value={entry.date}
                      onChange={(e) => handleInputChange("date", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>الوصف</Label>
                    <Input
                      value={entry.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      placeholder="وصف القيد المحاسبي"
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
                      onChange={(e) => handleInputChange("debit", parseFloat(e.target.value))}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>دائن</Label>
                    <Input
                      type="number"
                      value={entry.credit}
                      onChange={(e) => handleInputChange("credit", parseFloat(e.target.value))}
                      placeholder="0.00"
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
                </div>
                <DialogFooter>
                  <Button onClick={handleSubmit}>حفظ القيد المحاسبي</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
