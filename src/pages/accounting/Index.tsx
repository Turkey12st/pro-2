// src/pages/accounting/Index.tsx
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AppLayout from "@/components/AppLayout";
import { Calculator, Plus, Trash2, Edit } from "lucide-react";
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
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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

  // إضافة قيد جديد
  const handleAddEntry = (newEntry: Omit<JournalEntry, "id">) => {
    if (!newEntry.description || newEntry.amount <= 0) {
      toast.error("يرجى إدخال وصف صحيح ومبلغ أكبر من صفر.");
      return;
    }

    const entryWithId = { ...newEntry, id: Date.now().toString() };
    setJournalEntries((prevEntries) => [...prevEntries, entryWithId]);
    toast.success("تمت إضافة القيد بنجاح!");
    setIsOpen(false);
  };

  // حذف قيد
  const handleDeleteEntry = (id: string) => {
    if (window.confirm("هل أنت متأكد من أنك تريد حذف هذا القيد؟")) {
      setJournalEntries((prevEntries) =>
        prevEntries.filter((entry) => entry.id !== id)
      );
      toast.success("تم حذف القيد بنجاح!");
    }
  };

  // تعديل قيد
  const handleEditEntry = (updatedEntry: JournalEntry) => {
    if (!updatedEntry.description || updatedEntry.amount <= 0) {
      toast.error("يرجى إدخال وصف صحيح ومبلغ أكبر من صفر.");
      return;
    }

    setJournalEntries((prevEntries) =>
      prevEntries.map((entry) =>
        entry.id === updatedEntry.id ? updatedEntry : entry
      )
    );
    toast.success("تم تعديل القيد بنجاح!");
    setEditingEntry(null);
    setIsOpen(false);
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
                  initialData={editingEntry}
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

            {/* عرض قائمة القيود المحاسبية */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4">القيود المحاسبية:</h3>
              {journalEntries.length > 0 ? (
                <ul className="space-y-2">
                  {journalEntries.map((entry) => (
                    <li
                      key={entry.id}
                      className="p-2 border rounded-md flex justify-between items-center"
                    >
                      <span>
                        {entry.description} - {entry.amount} ر.س
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
npm install react-toastify
useEffect(() => {
  if (typeof window !== "undefined") {
    const storedEntries = localStorage.getItem(STORAGE_KEY);
    if (storedEntries) setJournalEntries(JSON.parse(storedEntries));
  }
}, []);

