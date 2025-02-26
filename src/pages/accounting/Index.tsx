import { useState } from "react";
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
import JournalEntryForm from "./components/JournalEntryForm";

// نوع بيانات القيد المحاسبي
type JournalEntry = {
  id: string;
  description: string;
  amount: number;
};

export default function AccountingPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);

  // إضافة قيد جديد
  const handleAddEntry = (newEntry: Omit<JournalEntry, "id">) => {
    const entryWithId = { ...newEntry, id: Date.now().toString() }; // إنشاء معرف فريد باستخدام التوقيت
    setJournalEntries((prevEntries) => [...prevEntries, entryWithId]);
    setIsOpen(false);
  };

  // حذف قيد
  const handleDeleteEntry = (id: string) => {
    setJournalEntries((prevEntries) =>
      prevEntries.filter((entry) => entry.id !== id)
    );
  };

  // تعديل قيد
  const handleEditEntry = (updatedEntry: JournalEntry) => {
    setJournalEntries((prevEntries) =>
      prevEntries.map((entry) =>
        entry.id === updatedEntry.id ? updatedEntry : entry
      )
    );
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
