import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

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
    </form>
  );
}
