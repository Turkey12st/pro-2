
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Document } from "@/types/database";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";

interface DocumentFormProps {
  initialData?: Document | null;
  onSuccess: () => void;
}

export function DocumentForm({ initialData, onSuccess }: DocumentFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<Document>>(
    initialData || {
      title: "",
      type: "",
      number: "",
      issue_date: format(new Date(), "yyyy-MM-dd"),
      expiry_date: format(new Date(new Date().setFullYear(new Date().getFullYear() + 1)), "yyyy-MM-dd"),
      reminder_days: [30, 14, 7],
      status: "active",
      document_url: "",
      metadata: {}
    }
  );

  const documentTypes = [
    { value: "cr", label: "سجل تجاري" },
    { value: "vat", label: "شهادة ضريبة القيمة المضافة" },
    { value: "gosi", label: "شهادة التأمينات الاجتماعية" },
    { value: "zakat", label: "شهادة الزكاة" },
    { value: "municipality", label: "رخصة البلدية" },
    { value: "civil_defense", label: "رخصة الدفاع المدني" },
    { value: "saudization", label: "شهادة السعودة" },
    { value: "license", label: "ترخيص المنشأة" },
    { value: "other", label: "أخرى" }
  ];

  const reminderOptions = [
    { id: 90, label: "90 يوم" },
    { id: 60, label: "60 يوم" },
    { id: 30, label: "30 يوم" },
    { id: 14, label: "14 يوم" },
    { id: 7, label: "7 أيام" },
    { id: 3, label: "3 أيام" },
    { id: 1, label: "يوم واحد" }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTypeChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      type: value
    }));
  };

  const handleReminderChange = (id: number, checked: boolean) => {
    setFormData((prev) => {
      const newReminderDays = [...(prev.reminder_days || [])];
      
      if (checked) {
        if (!newReminderDays.includes(id)) {
          newReminderDays.push(id);
        }
      } else {
        const index = newReminderDays.indexOf(id);
        if (index > -1) {
          newReminderDays.splice(index, 1);
        }
      }
      
      return {
        ...prev,
        reminder_days: newReminderDays
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!formData.title || !formData.type || !formData.issue_date || !formData.expiry_date) {
      toast({
        variant: "destructive",
        title: "خطأ في البيانات",
        description: "يرجى ملء جميع الحقول المطلوبة"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const documentData = {
        title: formData.title,
        type: formData.type,
        number: formData.number,
        issue_date: formData.issue_date,
        expiry_date: formData.expiry_date,
        status: formData.status || "active",
        reminder_days: formData.reminder_days || [30, 14, 7],
        document_url: formData.document_url,
        metadata: formData.metadata || {}
      };
      
      let result;
      
      if (initialData?.id) {
        result = await supabase
          .from("company_documents")
          .update(documentData)
          .eq("id", initialData.id);
      } else {
        result = await supabase
          .from("company_documents")
          .insert([documentData]);
      }
      
      if (result.error) throw result.error;
      
      toast({
        title: initialData ? "تم تحديث المستند بنجاح" : "تم إضافة المستند بنجاح",
        description: "تم حفظ بيانات المستند في قاعدة البيانات"
      });
      
      onSuccess();
    } catch (error) {
      console.error("خطأ في حفظ المستند:", error);
      toast({
        variant: "destructive",
        title: "خطأ في الحفظ",
        description: "حدث خطأ أثناء حفظ بيانات المستند"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardContent className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="title">
              عنوان المستند <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              name="title"
              value={formData.title || ""}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="type">
              نوع المستند <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.type || ""}
              onValueChange={handleTypeChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر نوع المستند" />
              </SelectTrigger>
              <SelectContent>
                {documentTypes.map((type) => (
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
              name="number"
              value={formData.number || ""}
              onChange={handleInputChange}
              dir="ltr"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="issue_date">
                تاريخ الإصدار <span className="text-red-500">*</span>
              </Label>
              <Input
                id="issue_date"
                name="issue_date"
                type="date"
                value={formData.issue_date || ""}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="expiry_date">
                تاريخ الانتهاء <span className="text-red-500">*</span>
              </Label>
              <Input
                id="expiry_date"
                name="expiry_date"
                type="date"
                value={formData.expiry_date || ""}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>تنبيهات قبل الانتهاء</Label>
            <div className="flex flex-wrap gap-4">
              {reminderOptions.map((option) => (
                <div key={option.id} className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox 
                    id={`reminder-${option.id}`} 
                    checked={formData.reminder_days?.includes(option.id) || false}
                    onCheckedChange={(checked) => handleReminderChange(option.id, checked === true)}
                  />
                  <label
                    htmlFor={`reminder-${option.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="document_url">رابط المستند</Label>
            <Input
              id="document_url"
              name="document_url"
              value={formData.document_url || ""}
              onChange={handleInputChange}
              dir="ltr"
              placeholder="https://"
            />
          </div>
        </CardContent>
      </Card>
      
      <div className="mt-6 flex justify-end gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "جاري الحفظ..." : (initialData ? "تحديث المستند" : "إضافة المستند")}
        </Button>
      </div>
    </form>
  );
}
