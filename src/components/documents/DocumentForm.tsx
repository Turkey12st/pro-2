
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { FilePlus, Save } from "lucide-react";
import { format } from "date-fns";
import { Json } from "@/integrations/supabase/types";

interface DocumentFormProps {
  onSuccess?: () => void;
}

interface DocumentFormData {
  title: string;
  type: string;
  number: string;
  issue_date: string;
  expiry_date: string;
  reminder_days: number[];
  document_url?: string;
  status: "active" | "expired" | "soon-expire";
  metadata?: Record<string, unknown>;
}

export default function DocumentForm({ onSuccess }: DocumentFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<DocumentFormData>({
    title: "",
    type: "commercial_registration",
    number: "",
    issue_date: format(new Date(), "yyyy-MM-dd"),
    expiry_date: format(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
    reminder_days: [30, 14, 7],
    status: "active"
  });

  const documentTypes = [
    { id: "commercial_registration", label: "السجل التجاري" },
    { id: "tax_certificate", label: "شهادة ضريبة القيمة المضافة" },
    { id: "chamber_of_commerce", label: "شهادة الغرفة التجارية" },
    { id: "municipality_license", label: "رخصة البلدية" },
    { id: "zakat_certificate", label: "شهادة الزكاة" },
    { id: "gosi_certificate", label: "شهادة التأمينات الاجتماعية" },
    { id: "saudization_certificate", label: "شهادة السعودة" },
    { id: "bank_certificate", label: "شهادة بنكية" },
    { id: "other", label: "أخرى" }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (name: string, date: Date | undefined) => {
    if (date) {
      setFormData((prev) => ({
        ...prev,
        [name]: format(date, "yyyy-MM-dd")
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // تحقق من صحة البيانات المدخلة
      if (!formData.title || !formData.type || !formData.issue_date || !formData.expiry_date) {
        toast({
          variant: "destructive",
          title: "خطأ في البيانات",
          description: "يرجى ملء جميع الحقول المطلوبة"
        });
        return;
      }

      // تحويل البيانات إلى الصيغة المناسبة للتخزين
      const documentToSave = {
        title: formData.title,
        type: formData.type,
        number: formData.number,
        issue_date: formData.issue_date,
        expiry_date: formData.expiry_date,
        reminder_days: formData.reminder_days,
        document_url: formData.document_url,
        status: "active", // الحالة الافتراضية للمستندات الجديدة
        metadata: formData.metadata as Json
      };

      // حفظ المستند في قاعدة البيانات
      const { error } = await supabase.from("company_documents").insert(documentToSave);

      if (error) {
        throw error;
      }

      toast({
        title: "تم إضافة المستند بنجاح",
        description: "تم حفظ المستند في قاعدة البيانات"
      });

      // إعادة تعيين النموذج
      setFormData({
        title: "",
        type: "commercial_registration",
        number: "",
        issue_date: format(new Date(), "yyyy-MM-dd"),
        expiry_date: format(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
        reminder_days: [30, 14, 7],
        status: "active"
      });

      // استدعاء دالة النجاح إذا تم توفيرها
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error saving document:", error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "حدث خطأ أثناء حفظ المستند"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center mb-6">
          <FilePlus className="h-5 w-5 mr-2" />
          <h2 className="text-xl font-semibold">إضافة مستند جديد</h2>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="title">عنوان المستند</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="أدخل عنوان المستند"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">نوع المستند</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleSelectChange("type", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر نوع المستند" />
                </SelectTrigger>
                <SelectContent>
                  {documentTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="number">رقم المستند</Label>
              <Input
                id="number"
                name="number"
                value={formData.number}
                onChange={handleInputChange}
                placeholder="أدخل رقم المستند"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="issue_date">تاريخ الإصدار</Label>
              <DatePicker
                selected={formData.issue_date ? new Date(formData.issue_date) : undefined}
                onSelect={(date) => handleDateChange("issue_date", date)}
                className="w-full"
              />
            </div>
            <div>
              <Label htmlFor="expiry_date">تاريخ الانتهاء</Label>
              <DatePicker
                selected={formData.expiry_date ? new Date(formData.expiry_date) : undefined}
                onSelect={(date) => handleDateChange("expiry_date", date)}
                className="w-full"
              />
            </div>
          </div>

          <Alert className="bg-blue-50 text-blue-800 border-blue-200">
            <AlertDescription>
              سيتم إشعارك عند اقتراب موعد انتهاء المستند بـ {formData.reminder_days.join(", ")} يوم.
            </AlertDescription>
          </Alert>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={isSubmitting} className="gap-2">
          <Save className="h-4 w-4" />
          {isSubmitting ? "جارٍ الحفظ..." : "حفظ المستند"}
        </Button>
      </div>
    </form>
  );
}
