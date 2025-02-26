import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AppLayout from "@/components/AppLayout";
import { Calculator, Plus } from "lucide-react";
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
import { JournalEntry } from "./types";

export default function AccountingPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]); // لتخزين القيود المحاسبية

  const handleSuccess = (newEntry: JournalEntry) => {
    setJournalEntries((prevEntries) => [...prevEntries, newEntry]); // إضافة القيد الجديد إلى القائمة
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
                <Button className="w-full">
                  <Plus className="h-4 w-4 ml-2" />
                  إضافة قيد محاسبي جديد
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>إضافة قيد محاسبي</DialogTitle>
                  <DialogDescription>
                    أدخل تفاصيل القيد المحاسبي. جميع الحقول مطلوبة.
                  </DialogDescription>
                </DialogHeader>
                <JournalEntryForm onSuccess={handleSuccess} onClose={() => setIsOpen(false)} />
              </DialogContent>
            </Dialog>

            {/* عرض قائمة القيود المحاسبية */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4">القيود المحاسبية المضافة:</h3>
              {journalEntries.length > 0 ? (
                <ul className="space-y-2">
                  {journalEntries.map((entry, index) => (
                    <li key={index} className="p-2 border rounded-md">
                      {entry.description} - {entry.amount} ر.س
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
