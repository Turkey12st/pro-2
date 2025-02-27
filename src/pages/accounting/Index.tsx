
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
    entry_date: format(new Date(), "yyyy-MM-dd")
  });
  
  // جلب القيود المحاسبية من قاعدة البيانات
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
      console.error("خطأ في جلب القيود المحاسبية:", error);
      toast({
        variant: "destructive",
        title: "خطأ في الاتصال",
        description: "لم نتمكن من جلب القيود المحاسبية. يرجى المحاولة مرة أخرى.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // جلب البيانات عند تحميل الصفحة
  useEffect(() => {
    fetchJournalEntries();
  }, []);

  // تعديل البيانات في النموذج
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "amount" ? parseFloat(value) || 0 : value,
    });
  };

  // تعديل حقول التحديد
  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // حفظ القيد المحاسبي
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.description || !formData.entry_name || formData.amount <= 0 || !formData.entry_date) {
      toast({
        variant: "destructive",
        title: "خطأ في البيانات",
        description: "يرجى ملء جميع الحقول المطلوبة وإدخال مبلغ أكبر من الصفر",
      });
      return;
    }

    try {
      // تحديد المبالغ المدينة والدائنة بناء على نوع القيد
      const total_debit = formData.entry_type === "expense" ? formData.amount : 0;
      const total_credit = formData.entry_type === "income" ? formData.amount : 0;

      const entryData = {
        description: formData.description,
        entry_name: formData.entry_name,
        amount: formData.amount,
        entry_date: formData.entry_date,
        financial_statement_section: formData.financial_statement_section,
        total_debit,
        total_credit,
        status: "active"
      };

      let result;

      if (editingEntry) {
        // تحديث قيد موجود
        result = await supabase
          .from("journal_entries")
          .update(entryData)
          .eq("id", editingEntry.id);
      } else {
        // إضافة قيد جديد
        result = await supabase
          .from("journal_entries")
          .insert([entryData]);
      }

      if (result.error) throw result.error;

      toast({
        title: editingEntry ? "تم تحديث القيد بنجاح" : "تم إضافة القيد بنجاح",
        description: "تم حفظ القيد المحاسبي في قاعدة البيانات",
      });

      setIsOpen(false);
      setEditingEntry(null);
      resetForm();
      fetchJournalEntries();
    } catch (error) {
      console.error("خطأ في حفظ القيد المحاسبي:", error);
      toast({
        variant: "destructive",
        title: "خطأ في الحفظ",
        description: "حدث خطأ أثناء محاولة حفظ القيد المحاسبي",
      });
    }
  };

  // حذف قيد محاسبي
  const handleDeleteEntry = async (id: string) => {
    try {
      const { error } = await supabase
        .from("journal_entries")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "تم حذف القيد بنجاح",
        description: "تم حذف القيد المحاسبي من قاعدة البيانات",
      });

      fetchJournalEntries();
    } catch (error) {
      console.error("خطأ في حذف القيد المحاسبي:", error);
      toast({
        variant: "destructive",
        title: "خطأ في الحذف",
        description: "حدث خطأ أثناء محاولة حذف القيد المحاسبي",
      });
    }
  };

  // تعديل قيد محاسبي
  const handleEditEntry = (entry: JournalEntry) => {
    setEditingEntry(entry);
    setFormData({
      description: entry.description,
      entry_name: entry.entry_name || "",
      amount: entry.amount || 0,
      entry_type: entry.total_credit > 0 ? "income" : "expense",
      financial_statement_section: entry.financial_statement_section || "income_statement",
      entry_date: entry.entry_date
    });
    setIsOpen(true);
  };

  // إعادة تعيين النموذج
  const resetForm = () => {
    setFormData({
      description: "",
      entry_name: "",
      amount: 0,
      entry_type: "income",
      financial_statement_section: "income_statement",
      entry_date: format(new Date(), "yyyy-MM-dd")
    });
  };

  // تصدير البيانات إلى ملف JSON
  const exportData = () => {
    const dataStr = JSON.stringify(journalEntries, null, 2);
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `journal-entries-${format(new Date(), "yyyy-MM-dd")}.json`;
    
    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
    
    toast({
      title: "تم تصدير البيانات بنجاح",
      description: "تم تصدير القيود المحاسبية إلى ملف JSON",
    });
  };

  // استيراد البيانات من ملف JSON
  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    const file = event.target.files?.[0];
    
    if (!file) return;

    fileReader.readAsText(file, "UTF-8");
    fileReader.onload = async (e) => {
      try {
        const result = e.target?.result;
        if (typeof result !== "string") return;
        
        const entries = JSON.parse(result) as JournalEntry[];
        
        // تحقق من صحة البيانات
        if (!Array.isArray(entries)) {
          throw new Error("صيغة الملف غير صحيحة");
        }
        
        // إدخال البيانات في قاعدة البيانات
        const { error } = await supabase
          .from("journal_entries")
          .insert(entries.map(entry => ({
            description: entry.description,
            entry_name: entry.entry_name || "قيد مستورد",
            amount: entry.amount || 0,
            entry_date: entry.entry_date || format(new Date(), "yyyy-MM-dd"),
            financial_statement_section: entry.financial_statement_section || "income_statement",
            total_debit: entry.total_debit || 0,
            total_credit: entry.total_credit || 0,
            status: "active"
          })));
        
        if (error) throw error;
        
        toast({
          title: "تم استيراد البيانات بنجاح",
          description: `تم استيراد ${entries.length} قيود محاسبية`,
        });
        
        fetchJournalEntries();
      } catch (error) {
        console.error("خطأ في استيراد البيانات:", error);
        toast({
          variant: "destructive",
          title: "خطأ في استيراد البيانات",
          description: error instanceof Error ? error.message : "حدث خطأ أثناء استيراد البيانات",
        });
      }
    };
    
    event.target.value = "";
  };

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Calculator className="h-6 w-6" />
            النظام المحاسبي
          </h1>
        </div>
        
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-primary flex items-center gap-2">
                <FileText className="h-5 w-5" />
                القيود المحاسبية
              </CardTitle>
              
              <div className="flex gap-2">
                <Dialog open={isOpen} onOpenChange={(open) => {
                  setIsOpen(open);
                  if (!open) setEditingEntry(null);
                }}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 ml-2" />
                      إضافة قيد محاسبي
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>
                        {editingEntry ? "تعديل قيد محاسبي" : "إضافة قيد محاسبي"}
                      </DialogTitle>
                      <DialogDescription>
                        أدخل تفاصيل القيد المحاسبي. جميع الحقول المميزة بـ * مطلوبة.
                      </DialogDescription>
                    </DialogHeader>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="entry_name">
                          اسم القيد <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="entry_name"
                          name="entry_name"
                          value={formData.entry_name}
                          onChange={handleChange}
                          placeholder="أدخل اسم القيد المحاسبي"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="description">
                          الوصف <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                          id="description"
                          name="description"
                          value={formData.description}
                          onChange={handleChange}
                          placeholder="أدخل وصف القيد المحاسبي"
                          required
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="amount">
                            المبلغ (بالريال) <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="amount"
                            name="amount"
                            type="number"
                            inputMode="numeric"
                            dir="ltr"
                            value={formData.amount}
                            onChange={handleChange}
                            min="0.01"
                            step="0.01"
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="entry_date">
                            التاريخ <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="entry_date"
                            name="entry_date"
                            type="date"
                            value={formData.entry_date}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="entry_type">نوع القيد</Label>
                          <Select
                            value={formData.entry_type}
                            onValueChange={(value) => handleSelectChange("entry_type", value)}
                          >
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
                          <Label htmlFor="financial_statement_section">القائمة المالية</Label>
                          <Select
                            value={formData.financial_statement_section}
                            onValueChange={(value) => handleSelectChange("financial_statement_section", value)}
                          >
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
                      </div>
                      
                      <div className="flex justify-end space-x-2 space-x-reverse mt-6">
                        <Button type="submit">
                          {editingEntry ? "تحديث القيد" : "إضافة القيد"}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* أزرار تصدير واستيراد البيانات */}
            <div className="flex flex-wrap gap-2 mb-6">
              <Button variant="outline" onClick={exportData} className="gap-2">
                <Download className="h-4 w-4" />
                تصدير البيانات
              </Button>
              
              <label htmlFor="import-file">
                <Button variant="outline" className="gap-2" asChild>
                  <span>
                    <Upload className="h-4 w-4" />
                    استيراد البيانات
                  </span>
                </Button>
              </label>
              <input
                type="file"
                id="import-file"
                accept=".json"
                className="hidden"
                onChange={importData}
              />
            </div>

            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                <p>جاري تحميل البيانات...</p>
              </div>
            ) : journalEntries.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-16 w-16 mx-auto mb-4 opacity-20" />
                <p>لا توجد قيود محاسبية. قم بإضافة قيد جديد للبدء.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
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
                        <TableCell className="max-w-xs truncate" title={entry.description}>
                          {entry.description}
                        </TableCell>
                        <TableCell>
                          {entry.entry_date ? format(new Date(entry.entry_date), "dd MMM yyyy", {locale: ar}) : "-"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={entry.total_credit > 0 ? "success" : "destructive"}>
                            {entry.total_credit > 0 ? "إيراد" : "مصروف"}
                          </Badge>
                        </TableCell>
                        <TableCell dir="ltr" className="text-left">
                          {entry.amount?.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })} ريال
                        </TableCell>
                        <TableCell>
                          {entry.financial_statement_section === "income_statement" && "قائمة الدخل"}
                          {entry.financial_statement_section === "balance_sheet" && "الميزانية العمومية"}
                          {entry.financial_statement_section === "cash_flow" && "التدفقات النقدية"}
                          {!entry.financial_statement_section && "-"}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2 space-x-reverse">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditEntry(entry)}
                              title="تعديل"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteEntry(entry.id)}
                              title="حذف"
                              className="text-destructive hover:text-destructive/90"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
