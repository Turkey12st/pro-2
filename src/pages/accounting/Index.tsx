import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AppLayout from "@/components/AppLayout";
import { 
  Calculator, 
  Plus, 
  Trash2, 
  Edit, 
  Download, 
  Upload, 
  FileText, 
  ArrowRightLeft, 
  Calendar,
  Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { JournalEntry } from "@/types/database";

export default function AccountingPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [formData, setFormData] = useState({
    description: "",
    entry_name: "",
    amount: 0,
    entry_type: "income",
    financial_statement_section: "income_statement",
    entry_date: format(new Date(), "yyyy-MM-dd"),
    total_debit: 0,
    total_credit: 0,
  });

  const fetchJournalEntries = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("journal_entries")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setJournalEntries(data || []);
    } catch (error) {
      console.error("خطأ في جلب القيود:", error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "فشل في جلب البيانات. تحقق من الاتصال بالإنترنت",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJournalEntries();
  }, []);

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

    if (!formData.description || !formData.entry_name || formData.amount <= 0) {
      toast({
        variant: "destructive",
        title: "بيانات ناقصة",
        description: "تأكد من إدخال جميع الحقول المطلوبة",
      });
      return;
    }

    try {
      const { error } = editingEntry
        ? await supabase
            .from("journal_entries")
            .update({
              ...formData,
              total_debit: formData.entry_type === "expense" ? formData.amount : 0,
              total_credit: formData.entry_type === "income" ? formData.amount : 0,
            })
            .eq("id", editingEntry.id)
        : await supabase.from("journal_entries").insert([{
            ...formData,
            total_debit: formData.entry_type === "expense" ? formData.amount : 0,
            total_credit: formData.entry_type === "income" ? formData.amount : 0,
          }]);

      if (error) throw error;

      toast({
        title: editingEntry ? "تم التعديل" : "تم الإضافة",
        description: `تم ${editingEntry ? "تعديل" : "إضافة"} القيد بنجاح`,
      });
      resetForm();
      fetchJournalEntries();
    } catch (error) {
      console.error("خطأ:", error);
      toast({
        variant: "destructive",
        title: "فشل في الحفظ",
        description: error instanceof Error ? error.message : "حدث خطأ غير معروف",
      });
    }
  };

  const handleDeleteEntry = async (id: string) => {
    try {
      const { error } = await supabase
        .from("journal_entries")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({ title: "تم الحذف", description: "تم حذف القيد بنجاح" });
      setJournalEntries(journalEntries.filter(entry => entry.id !== id));
    } catch (error) {
      console.error("خطأ في الحذف:", error);
      toast({
        variant: "destructive",
        title: "فشل في الحذف",
        description: "حدث خطأ أثناء محاولة الحذف",
      });
    }
  };

  const handleEditEntry = (entry: JournalEntry) => {
    setEditingEntry(entry);
    setFormData({
      description: entry.description,
      entry_name: entry.entry_name || "",
      amount: entry.amount || 0,
      entry_type: entry.entry_type,
      financial_statement_section: entry.financial_statement_section || "income_statement",
      entry_date: entry.entry_date,
      total_debit: entry.total_debit || 0,
      total_credit: entry.total_credit || 0,
    });
    setIsOpen(true);
  };

  const resetForm = () => {
    setFormData({
      description: "",
      entry_name: "",
      amount: 0,
      entry_type: "income",
      financial_statement_section: "income_statement",
      entry_date: format(new Date(), "yyyy-MM-dd"),
      total_debit: 0,
      total_credit: 0,
    });
    setEditingEntry(null);
  };

  const exportData = () => {
    const dataStr = JSON.stringify(journalEntries, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    const link = document.createElement("a");
    link.href = dataUri;
    link.download = `journal-entries-${format(new Date(), "yyyy-MM-dd")}.json`;
    link.click();
    toast({ title: "تم التصدير", description: "تم تصدير البيانات بنجاح" });
  };

  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsText(file, "UTF-8");
    reader.onload = async (event) => {
      try {
        const result = event.target?.result;
        if (typeof result !== "string") return;

        const entries = JSON.parse(result) as JournalEntry[];
        if (!Array.isArray(entries)) throw new Error("صيغة الملف غير صحيحة");

        const formattedEntries = entries.map(entry => ({
          ...entry,
          entry_name: entry.entry_name || "قيد مستورد",
          entry_date: entry.entry_date || format(new Date(), "yyyy-MM-dd"),
          financial_statement_section: entry.financial_statement_section || "income_statement",
          total_debit: entry.total_debit || 0,
          total_credit: entry.total_credit || 0,
        }));

        const { error } = await supabase.from("journal_entries").insert(formattedEntries);
        if (error) throw error;

        toast({ title: "تم الاستيراد", description: `تم استيراد ${entries.length} قيود` });
        fetchJournalEntries();
      } catch (error) {
        console.error("خطأ في الاستيراد:", error);
        toast({
          variant: "destructive",
          title: "فشل في الاستيراد",
          description: error instanceof Error ? error.message : "حدث خطأ غير معروف",
        });
      }
    };
    e.target.value = "";
  };

  return (
    <AppLayout>
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            النظام المحاسبي
            <div className="flex gap-2">
              <Button onClick={exportData} variant="outline">
                <Download className="mr-2" /> تصدير البيانات
              </Button>
              <Button variant="outline">
                <Upload className="mr-2" />
                <input
                  type="file"
                  accept=".json"
                  className="absolute opacity-0 w-full h-full cursor-pointer"
                  onChange={importData}
                />
                استيراد البيانات
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Dialog open={isOpen} onOpenChange={(open) => {
            setIsOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="mb-4">
                <Plus className="mr-2" /> إضافة قيد محاسبي
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingEntry ? "تعديل قيد" : "إضافة قيد"}</DialogTitle>
                <DialogDescription>
                  أدخل تفاصيل القيد. جميع الحقول المميزة بـ * مطلوبة.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="entry_name">اسم القيد *</Label>
                  <Input
                    id="entry_name"
                    name="entry_name"
                    value={formData.entry_name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">الوصف *</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="amount">المبلغ *</Label>
                  <Input
                    id="amount"
                    name="amount"
                    type="number"
                    value={formData.amount}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="entry_date">التاريخ *</Label>
                  <Input
                    id="entry_date"
                    name="entry_date"
                    type="date"
                    value={formData.entry_date}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label>نوع القيد</Label>
                  <Select
                    value={formData.entry_type}
                    onValueChange={(value) => handleSelectChange("entry_type", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر النوع" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">إيراد</SelectItem>
                      <SelectItem value="expense">مصروف</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>القائمة المالية</Label>
                  <Select
                    value={formData.financial_statement_section}
                    onValueChange={(value) => handleSelectChange("financial_statement_section", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر القائمة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income_statement">قائمة الدخل</SelectItem>
                      <SelectItem value="balance_sheet">الميزانية العمومية</SelectItem>
                      <SelectItem value="cash_flow">التدفقات النقدية</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full">
                  {editingEntry ? "تحديث القيد" : "إضافة القيد"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          {isLoading ? (
            <div className="flex justify-center py-4">جاري التحميل...</div>
          ) : journalEntries.length === 0 ? (
            <div className="text-center py-4">لا توجد قيود محاسبية</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>اسم القيد</TableHead>
                  <TableHead>الوصف</TableHead>
                  <TableHead>التاريخ</TableHead>
                  <TableHead>النوع</TableHead>
                  <TableHead>المبلغ</TableHead>
                  <TableHead>القائمة المالية</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {journalEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>{entry.entry_name || "-"}</TableCell>
                    <TableCell>{entry.description}</TableCell>
                    <TableCell>
                      {entry.entry_date ? format(new Date(entry.entry_date), "dd MMM yyyy", { locale: ar }) : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={entry.entry_type === "income" ? "success" : "destructive"}>
                        {entry.entry_type === "income" ? "إيراد" : "مصروف"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {entry.amount?.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })} ريال
                    </TableCell>
                    <TableCell>
                      {entry.financial_statement_section === "income_statement" && "قائمة الدخل"}
                      {entry.financial_statement_section === "balance_sheet" && "الميزانية العمومية"}
                      {entry.financial_statement_section === "cash_flow" && "التدفقات النقدية"}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditEntry(entry)}
                        aria-label="تعديل"
                      >
                        <Edit className="text-primary" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteEntry(entry.id)}
                        aria-label="حذف"
                        className="text-destructive"
                      >
                        <Trash2 />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </AppLayout>
  );
}
