import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Download, Upload } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import type { JournalEntry } from "@/types/database";

// تعريف أنواع الخصائص (props) التي يستقبلها المكون
type JournalEntryFormProps = {
  initialData?: { description: string; amount: number }; // بيانات القيد إذا كان النموذج في وضع التعديل
  onSuccess: (data: { description: string; amount: number }) => void; // دالة تنفذ عند حفظ البيانات بنجاح
  onClose: () => void; // دالة تنفذ عند إغلاق النموذج
};

/**
 * مكون نموذج القيد المحاسبي.
 * يتيح إضافة أو تعديل قيد محاسبي مع التحقق من صحة البيانات.
 */
export default function JournalEntryForm({
  initialData,
  onSuccess,
  onClose,
}: JournalEntryFormProps) {
  // حالة لإدارة حقول النموذج
  const [description, setDescription] = useState(initialData?.description || "");
  const [amount, setAmount] = useState(initialData?.amount || 0);
  // حالة لتتبع ما إذا كان النموذج قيد الإرسال
  const [isSubmitting, setIsSubmitting] = useState(false);
  // استخدام خطاف useToast لعرض رسائل التنبيه
  const { toast } = useToast();

  // دالة تُستدعى عند إرسال النموذج
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // منع السلوك الافتراضي لإعادة تحميل الصفحة
    setIsSubmitting(true); // تفعيل حالة الإرسال لمنع الإرسال المتعدد

    // التحقق من صحة البيانات المدخلة
    if (!description || amount <= 0) {
      toast({
        variant: "destructive",
        title: "خطأ في الإدخال",
        description: "يرجى إدخال وصف صحيح ومبلغ أكبر من صفر.",
      });
      setIsSubmitting(false); // إعادة تعطيل حالة الإرسال
      return;
    }

    try {
      // محاكاة عملية حفظ البيانات (يمكن استبدالها باستدعاء API حقيقي)
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // تنفيذ دالة النجاح مع البيانات
      onSuccess({ description, amount });
      
      // عرض رسالة نجاح
      toast({
        title: "تم الحفظ بنجاح",
        description: "تم حفظ القيد المحاسبي بنجاح.",
      });

      onClose(); // إغلاق النموذج بعد النجاح
    } catch (error) {
      console.error("خطأ في حفظ البيانات:", error);
      toast({
        variant: "destructive",
        title: "خطأ في الحفظ",
        description: "حدث خطأ أثناء محاولة حفظ القيد.",
      });
    } finally {
      setIsSubmitting(false); // تعطيل حالة الإرسال في النهاية
    }
  };
  
  // دالة لتصدير البيانات
  const exportData = () => {
    const dataStr = JSON.stringify([], null, 2); // هنا يجب أن تستخدم البيانات الفعلية
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    const link = document.createElement("a");
    link.href = dataUri;
    link.download = `journal-entries-${format(new Date(), "yyyy-MM-dd")}.json`;
    link.click();
    toast({ title: "تم التصدير", description: "تم تصدير البيانات بنجاح" });
  };
  
  // دالة لاستيراد البيانات
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

        // هنا يجب أن تتم عملية إدخال البيانات في قاعدة البيانات
        // const { error } = await supabase.from("journal_entries").insert(entries);
        // if (error) throw error;
        
        toast({ title: "تم الاستيراد", description: `تم استيراد ${entries.length} قيود` });
        // onImportSuccess();
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="description" className="block text-sm font-medium">الوصف</label>
        <input
          id="description"
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border rounded-md"
          disabled={isSubmitting} // تعطيل الحقل أثناء الإرسال
        />
      </div>
      <div>
        <label htmlFor="amount" className="block text-sm font-medium">المبلغ</label>
        <input
          id="amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="mt-1 block w-full px-3 py-2 border rounded-md"
          disabled={isSubmitting} // تعطيل الحقل أثناء الإرسال
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isSubmitting} // تعطيل الزر أثناء الإرسال
        >
          إلغاء
        </Button>
        <Button 
          type="submit" 
          disabled={isSubmitting} // تعطيل الزر أثناء الإرسال
        >
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isSubmitting ? "جاري الحفظ..." : "حفظ"}
        </Button>
      </div>
      
      <div className="mt-4 flex justify-end gap-2 border-t pt-4">
        <Button onClick={exportData} variant="outline" type="button">
          <Download className="mr-2 h-4 w-4" /> تصدير البيانات
        </Button>
        <Button variant="outline" type="button" className="relative">
          <Upload className="mr-2 h-4 w-4" />
          <input
            type="file"
            accept=".json"
            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
            onChange={importData}
          />
          استيراد البيانات
        </Button>
      </div>
    </form>
  );
}
