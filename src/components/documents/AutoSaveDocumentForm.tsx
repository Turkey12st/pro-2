
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { useToast } from "@/hooks/use-toast";
import { useAutoSave } from "@/hooks/useAutoSave";
import { supabase } from "@/integrations/supabase/client";
import { Document } from "@/types/database";
import { format, parseISO } from "date-fns";

interface AutoSaveDocumentFormProps {
  onSuccess?: () => void;
  initialData?: Partial<Document>;
}

export const AutoSaveDocumentForm = ({ onSuccess, initialData }: AutoSaveDocumentFormProps) => {
  const { toast } = useToast();
  const { saveData, isLoading } = useAutoSave();
  
  const [formData, setFormData] = useState<Partial<Document>>({
    title: "",
    type: "",
    number: "",
    issue_date: format(new Date(), "yyyy-MM-dd"),
    expiry_date: format(new Date(new Date().setFullYear(new Date().getFullYear() + 1)), "yyyy-MM-dd"),
    status: "active" as "active" | "expired" | "soon-expire",
    reminder_days: [30, 14, 7],
    metadata: {
      notes: ""
    },
    ...initialData
  });

  const [isSaving, setIsSaving] = useState(false);
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Fill form with initial data if provided
    if (initialData) {
      setFormData(prev => ({ ...prev, ...initialData }));
    }
    
    // Load auto-saved data if exists and no initial data
    if (!initialData) {
      loadAutoSavedData();
    }
    
    return () => {
      if (autoSaveTimer) clearTimeout(autoSaveTimer);
    };
  }, [initialData]);

  const loadAutoSavedData = async () => {
    try {
      const { data, error } = await supabase
        .from('auto_saves')
        .select('form_data')
        .eq('user_id', 'system')
        .eq('form_type', 'document_form')
        .single();
      
      if (error) {
        console.log('No auto-saved data found');
        return;
      }
      
      if (data?.form_data) {
        setFormData(data.form_data);
        toast({
          title: "تم استعادة البيانات المحفوظة تلقائيًا",
          description: "تم استعادة آخر بيانات تم حفظها تلقائيًا"
        });
      }
    } catch (error) {
      console.error('Error loading auto-saved data:', error);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);
    
    // Clear existing timer and set a new one
    if (autoSaveTimer) clearTimeout(autoSaveTimer);
    const timer = setTimeout(() => {
      handleAutoSave(newFormData);
    }, 1500);
    setAutoSaveTimer(timer as any);
  };

  const handleMetadataChange = (field: string, value: any) => {
    const newMetadata = { ...formData.metadata, [field]: value };
    const newFormData = { ...formData, metadata: newMetadata };
    setFormData(newFormData);
    
    // Clear existing timer and set a new one
    if (autoSaveTimer) clearTimeout(autoSaveTimer);
    const timer = setTimeout(() => {
      handleAutoSave(newFormData);
    }, 1500);
    setAutoSaveTimer(timer as any);
  };

  const handleAutoSave = async (data: Partial<Document>) => {
    try {
      await saveData("document_form", data);
      console.log("Document form auto-saved");
    } catch (error) {
      console.error("Error auto-saving document form:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      // Validate required fields
      if (!formData.title || !formData.type || !formData.issue_date || !formData.expiry_date) {
        throw new Error("جميع الحقول المطلوبة يجب ملؤها");
      }
      
      const documentData = {
        title: formData.title,
        type: formData.type,
        number: formData.number || null,
        issue_date: formData.issue_date,
        expiry_date: formData.expiry_date,
        status: formData.status as "active" | "expired" | "soon-expire",
        reminder_days: formData.reminder_days || [30, 14, 7],
        document_url: formData.document_url || null,
        metadata: formData.metadata || { notes: "" }
      };
      
      let result;
      
      if (initialData?.id) {
        // Update existing document
        const { data, error } = await supabase
          .from('company_documents')
          .update(documentData)
          .eq('id', initialData.id)
          .select()
          .single();
          
        if (error) throw error;
        result = data;
        
        toast({
          title: "تم تحديث المستند",
          description: "تم تحديث المستند بنجاح"
        });
      } else {
        // Insert new document
        const { data, error } = await supabase
          .from('company_documents')
          .insert(documentData)
          .select()
          .single();
          
        if (error) throw error;
        result = data;
        
        toast({
          title: "تم إضافة المستند",
          description: "تم إضافة المستند بنجاح"
        });
        
        // Clear form and auto-saved data
        setFormData({
          title: "",
          type: "",
          number: "",
          issue_date: format(new Date(), "yyyy-MM-dd"),
          expiry_date: format(new Date(new Date().setFullYear(new Date().getFullYear() + 1)), "yyyy-MM-dd"),
          status: "active" as "active" | "expired" | "soon-expire",
          reminder_days: [30, 14, 7],
          metadata: {
            notes: ""
          }
        });
        
        // Clear auto-saved data
        await supabase
          .from('auto_saves')
          .delete()
          .eq('user_id', 'system')
          .eq('form_type', 'document_form');
      }
      
      if (onSuccess) {
        onSuccess();
      }
      
    } catch (error: any) {
      console.error("Error saving document:", error);
      toast({
        title: "خطأ في حفظ المستند",
        description: error.message || "حدث خطأ أثناء محاولة حفظ المستند",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const documentTypes = [
    "رخصة تجارية",
    "شهادة السجل التجاري",
    "شهادة الزكاة والدخل",
    "شهادة التأمينات الاجتماعية",
    "شهادة الغرفة التجارية",
    "شهادة الاشتراك في نظام العمل",
    "شهادة سعودة",
    "رخصة بلدية",
    "وثيقة تأمين",
    "أخرى"
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="title">عنوان المستند <span className="text-red-500">*</span></Label>
          <Input
            id="title"
            value={formData.title || ""}
            onChange={(e) => handleInputChange("title", e.target.value)}
            placeholder="أدخل عنوان المستند"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="type">نوع المستند <span className="text-red-500">*</span></Label>
          <Select
            value={formData.type || ""}
            onValueChange={(value) => handleInputChange("type", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر نوع المستند" />
            </SelectTrigger>
            <SelectContent>
              {documentTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
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
            onChange={(e) => handleInputChange("number", e.target.value)}
            placeholder="أدخل رقم المستند (اختياري)"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="status">حالة المستند</Label>
          <Select
            value={formData.status || "active"}
            onValueChange={(value) => handleInputChange("status", value as "active" | "expired" | "soon-expire")}
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
            setDate={(date) => handleInputChange("issue_date", format(date, "yyyy-MM-dd"))}
            className="w-full"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="expiry_date">تاريخ الانتهاء <span className="text-red-500">*</span></Label>
          <DatePicker
            date={formData.expiry_date ? parseISO(formData.expiry_date) : undefined}
            setDate={(date) => handleInputChange("expiry_date", format(date, "yyyy-MM-dd"))}
            className="w-full"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="notes">ملاحظات</Label>
        <Textarea
          id="notes"
          value={formData.metadata?.notes || ""}
          onChange={(e) => handleMetadataChange("notes", e.target.value)}
          placeholder="أدخل أي ملاحظات إضافية حول المستند"
          rows={4}
        />
      </div>
      
      <div className="flex justify-end space-x-2 rtl:space-x-reverse">
        <Button type="submit" disabled={isSaving || isLoading}>
          {isSaving ? "جاري الحفظ..." : (initialData?.id ? "تحديث المستند" : "إضافة المستند")}
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
