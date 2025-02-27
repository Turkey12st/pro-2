
// src/pages/accounting/Index.tsx
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AppLayout from "@/components/AppLayout";
import { Calculator, Plus, Trash2, Edit, Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import JournalEntryForm from "@/components/JournalEntryForm";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// نوع بيانات القيد المحاسبي
type JournalEntry = {
  id: string;
  description: string;
  amount: number;
};

// مفتاح تخزين البيانات في localStorage
const STORAGE_KEY = "journalEntries";

// Hook مخصص لإدارة البيانات في localStorage
function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error("Error reading localStorage:", error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error("Error writing to localStorage:", error);
    }
  };

  return [storedValue, setValue] as const;
}

export default function AccountingPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [journalEntries, setJournalEntries] = useLocalStorage<JournalEntry[]>(
    STORAGE_KEY,
    []
  );
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  // جلب القيود المحاسبية من قاعدة البيانات
  useEffect(() => {
    const fetchJournalEntries = async () => {
      try {
        const { data, error } = await supabase
          .from("journal_entries")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;

        if (data && data.length > 0) {
          const formattedEntries = data.map(entry => ({
            id: entry.id,
            description: entry.description,
            amount: entry.amount
          }));
          setJournalEntries(formattedEntries);
        } else if (journalEntries.length === 0) {
          // إذا لم تكن هناك بيانات في قاعدة البيانات وكانت القائمة المحلية فارغة، قم بإضافة بيانات افتراضية
          setJournalEntries([
            { id: "1", description: "رسوم السجل التجاري", amount: 1775 },
            { id: "2", description: "مستخرج السجل التجاري", amount: 100 },
            { id: "3", description: "مصروف رحلة مكة للمهندس محمد", amount: 100 },
          ]);
        }
      } catch (error) {
        console.error("خطأ في جلب القيود المحاسبية:", error);
        // استخدم البيانات الافتراضية إذا فشل الاتصال بقاعدة البيانات
        if (journalEntries.length === 0) {
          setJournalEntries([
            { id: "1", description: "رسوم السجل التجاري", amount: 1775 },
            { id: "2", description: "مستخرج السجل التجاري", amount: 100 },
            { id: "3", description: "مصروف رحلة مكة للمهندس محمد", amount: 100 },
          ]);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchJournalEntries();
  }, []);

  // إضافة قيد جديد
  const handleAddEntry = async (newEntry: Omit<JournalEntry, "id">) => {
    if (!newEntry.description || newEntry.amount <= 0) {
      toast({
        variant: "destructive",
        title: "خطأ في البيانات",
        description: "يرجى إدخال وصف صحيح ومبلغ أكبر من صفر.",
      });
      return;
    }

    try {
      // حفظ القيد في قاعدة البيانات
      const { data, error } = await supabase
        .from("journal_entries")
        .insert({
          description: newEntry.description,
          amount: newEntry.amount,
          entry_date: new Date().toISOString(),
          entry_type: newEntry.amount > 0 ? "income" : "expense",
          status: "active",
        })
        .select();

      if (error) throw error;

      const createdEntry = data[0];
      const entryWithId = { 
        id: createdEntry.id, 
        description: createdEntry.description, 
        amount: createdEntry.amount 
      };
      
      setJournalEntries((prevEntries) => [...prevEntries, entryWithId]);
      toast({
        title: "تمت إضافة القيد بنجاح!",
        description: "تم حفظ القيد المحاسبي في قاعدة البيانات",
      });
      setIsOpen(false);
    } catch (error) {
      console.error("خطأ في حفظ القيد المحاسبي:", error);
      toast({
        variant: "destructive",
        title: "خطأ في الحفظ",
        description: "حدث خطأ أثناء محاولة حفظ القيد المحاسبي",
      });
    }
  };

  // حذف قيد
  const handleDeleteEntry = async (id: string) => {
    if (window.confirm("هل أنت متأكد من أنك تريد حذف هذا القيد؟")) {
      try {
        // حذف القيد من قاعدة البيانات
        const { error } = await supabase
          .from("journal_entries")
          .delete()
          .eq("id", id);

        if (error) throw error;

        setJournalEntries((prevEntries) =>
          prevEntries.filter((entry) => entry.id !== id)
        );
        toast({
          title: "تم حذف القيد بنجاح!",
          description: "تم حذف القيد المحاسبي من قاعدة البيانات",
        });
      } catch (error) {
        console.error("خطأ في حذف القيد المحاسبي:", error);
        toast({
          variant: "destructive",
          title: "خطأ في الحذف",
          description: "حدث خطأ أثناء محاولة حذف القيد المحاسبي",
        });
      }
    }
  };

  // تعديل قيد
  const handleEditEntry = async (updatedEntry: JournalEntry) => {
    if (!updatedEntry.description || updatedEntry.amount <= 0) {
      toast({
        variant: "destructive",
        title: "خطأ في البيانات",
        description: "يرجى إدخال وصف صحيح ومبلغ أكبر من صفر.",
      });
      return;
    }

    try {
      // تحديث القيد في قاعدة البيانات
      const { error } = await supabase
        .from("journal_entries")
        .update({
          description: updatedEntry.description,
          amount: updatedEntry.amount,
          updated_at: new Date().toISOString(),
        })
        .eq("id", updatedEntry.id);

      if (error) throw error;

      setJournalEntries((prevEntries) =>
        prevEntries.map((entry) =>
          entry.id === updatedEntry.id ? updatedEntry : entry
        )
      );
      toast({
        title: "تم تعديل القيد بنجاح!",
        description: "تم تحديث القيد المحاسبي في قاعدة البيانات",
      });
      setEditingEntry(null);
      setIsOpen(false);
    } catch (error) {
      console.error("خطأ في تعديل القيد المحاسبي:", error);
      toast({
        variant: "destructive",
        title: "خطأ في التعديل",
        description: "حدث خطأ أثناء محاولة تعديل القيد المحاسبي",
      });
    }
  };

  // تصدير البيانات إلى ملف JSON
  const exportData = () => {
    const dataStr = JSON.stringify(journalEntries, null, 2);
    const downloadLink = document.createElement("a");
    downloadLink.href = "data:text/json;charset=utf-8," + encodeURIComponent(dataStr);
    downloadLink.download = "journal-entries.json";
    downloadLink.click();
    toast({
      title: "تم تصدير البيانات بنجاح!",
      description: "تم تصدير القيود المحاسبية إلى ملف JSON",
    });
  };

  // استيراد البيانات من ملف JSON
  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        try {
          const parsedData = JSON.parse(content);
          setJournalEntries(parsedData);
          toast({
            title: "تم استيراد البيانات بنجاح!",
            description: "تم استيراد القيود المحاسبية من ملف JSON",
          });
        } catch (error) {
          toast({
            variant: "destructive",
            title: "خطأ في استيراد البيانات",
            description: "يرجى التحقق من الملف.",
          });
        }
      };
      reader.readAsText(file);
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
            {/* زر إضافة قيد جديد */}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button className="w-full mb-4">
                  <Plus className="h-4 w-4 ml-2" />
                  إضافة قيد محاسبي جديد
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>
                    {editingEntry ? "تعديل قيد محاسبي" : "إضافة قيد محاسبي"}
                  </DialogTitle>
                  <DialogDescription>
                    أدخل تفاصيل القيد المحاسبي. جميع الحقول مطلوبة.
                  </DialogDescription>
                </DialogHeader>
                <JournalEntryForm
                  initialData={editingEntry || undefined}
                  onSuccess={(data) =>
                    editingEntry
                      ? handleEditEntry({ ...data, id: editingEntry.id })
                      : handleAddEntry(data)
                  }
                  onClose={() => {
                    setIsOpen(false);
                    setEditingEntry(null);
                  }}
                />
              </DialogContent>
            </Dialog>

            {/* أزرار تصدير واستيراد البيانات */}
            <div className="flex justify-between mb-4">
              <Button variant="outline" onClick={exportData}>
                <Download className="h-4 w-4 mr-2" />
                تصدير البيانات
              </Button>
              <label htmlFor="importFile" className="cursor-pointer">
                <Button variant="outline" as="span">
                  <Upload className="h-4 w-4 mr-2" />
                  استيراد البيانات
                </Button>
              </label>
              <input
                type="file"
                id="importFile"
                accept=".json"
                className="hidden"
                onChange={importData}
              />
            </div>

            {/* عرض قائمة القيود المحاسبية */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4">القيود المحاسبية:</h3>
              {isLoading ? (
                <p className="text-center py-4">جاري تحميل البيانات...</p>
              ) : journalEntries.length > 0 ? (
                <ul className="space-y-2">
                  {journalEntries.map((entry) => (
                    <li
                      key={entry.id}
                      className="p-2 border rounded-md flex justify-between items-center"
                    >
                      <span>
                        {entry.description} - {entry.amount} SAR
                      </span>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingEntry(entry);
                            setIsOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteEntry(entry.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">لم يتم إضافة أي قيد محاسبي بعد.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
