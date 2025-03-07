import { useState, useEffect } from "react";
import { useAutoSave } from "@/hooks/useAutoSave";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Document } from "@/types/database";
import { format, parseISO } from "date-fns";

const DOCUMENT_TYPES = [
  { value: "commercial_registration", label: "السجل التجاري" },
  { value: "tax_certificate", label: "شهادة الزكاة والضريبة" },
  { value: "gosi_certificate", label: "شهادة التأمينات الاجتماعية" },
  { value: "hrsd_certificate", label: "شهادة وزارة الموارد البشرية" },
  { value: "municipality_license", label: "رخصة البلدية" },
  { value: "civil_defense_license", label: "رخصة الدفاع المدني" },
  { value: "other", label: "أخرى" },
];

interface AutoSaveDocumentFormProps {
  initialValues?: Partial<Document>;
  onSave: (data: Partial<Document>) => Promise<void>;
}

const AutoSaveDocumentForm = ({ initialValues = {}, onSave }: AutoSaveDocumentFormProps) => {
  const { formData, setFormData, isLoading, saveData } = useAutoSave<Partial<Document>>({
    formType: "document_form",
    initialData: initialValues,
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (Object.keys(initialValues).length > 0) {
      setFormData({ 
        ...initialValues,
        issue_date: initialValues.issue_date ? format(parseISO(initialValues.issue_date), 'yyyy-MM-dd') : '',
        expiry_date: initialValues.expiry_date ? format(parseISO(initialValues.expiry_date), 'yyyy-MM-dd') : '',
      });
    }
  }, [initialValues, setFormData]);

  const handleChange = (key: string, value: any) => {
    setFormData({ ...formData, [key]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const dataToSave: Partial<Document> = {
        ...formData,
        status: formData.status as 'active' | 'expired' | 'soon-expire' || 'active',
        reminder_days: formData.reminder_days || [30, 14, 7],
        metadata: {
          ...(formData.metadata || {}),
          notes: formData.metadata?.notes || ""
        }
      };

      await saveData(dataToSave);
      
      await onSave(dataToSave);

      toast({
        title: "تم حفظ المستند",
        description: "تم حفظ بيانات المستند بنجاح",
      });
    } catch (error) {
      console.error("Error saving document:", error);
      toast({
        title: "خطأ في حفظ المستند",
        description: "حدث خطأ أثناء محاولة حفظ بيانات المستند",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="title">عنوان المستند <span className="text-red-500">*</span></Label>
          <Input
            id="title"
            value={formData.title || ""}
            onChange={(e) => handleChange("title", e.target.value)}
            placeholder="أدخل عنوان المستند"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="type">نوع المستند <span className="text-red-500">*</span></Label>
          <Select
            value={formData.type || ""}
            onValueChange={(value) => handleChange("type", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر نوع المستند" />
            </SelectTrigger>
            <SelectContent>
              {DOCUMENT_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="number">رقم المستند</Label>
          <Input
            id="number"
            value={formData.number || ""}
            onChange={(e) => handleChange("number", e.target.value)}
            placeholder="أدخل رقم المستند (اختياري)"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="status">حالة المستند</Label>
          <Select
            value={formData.status || "active"}
            onValueChange={(value) => handleChange("status", value as "active" | "expired" | "soon-expire")}
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر حالة المستند" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">ساري</SelectItem>
              <SelectItem value="soon-expire">قريب من الانتهاء</SelectItem>
              <SelectItem value="expired">منتهي</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="issue_date">تاريخ الإصدار <span className="text-red-500">*</span></Label>
          <DatePicker
            date={formData.issue_date ? parseISO(formData.issue_date) : undefined}
            setDate={(date) => handleChange("issue_date", format(date, "yyyy-MM-dd"))}
            className="w-full"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="expiry_date">تاريخ الانتهاء <span className="text-red-500">*</span></Label>
          <DatePicker
            date={formData.expiry_date ? parseISO(formData.expiry_date) : undefined}
            setDate={(date) => handleChange("expiry_date", format(date, "yyyy-MM-dd"))}
            className="w-full"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="notes">ملاحظات</Label>
        <Textarea
          id="notes"
          value={formData.metadata?.notes || ""}
          onChange={(e) => handleChange("metadata.notes", e.target.value)}
          placeholder="أدخل أي ملاحظات إضافية حول المستند"
          rows={4}
        />
      </div>
      
      <div className="flex justify-end space-x-2 rtl:space-x-reverse">
        <Button type="submit" disabled={isSubmitting || isLoading}>
          {isSubmitting ? "جاري الحفظ..." : "إضافة المستند"}
        </Button>
      </div>
      
      {isLoading && (
        <div className="text-sm text-muted-foreground text-center">
          جاري الحفظ التلقائي...
        </div>
      )}
    </form>
  );
};

export default AutoSaveDocumentForm;
