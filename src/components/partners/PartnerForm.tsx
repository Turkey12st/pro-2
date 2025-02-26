import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAutoSave } from "@/hooks/useAutoSave";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import type { Partner } from "@/types/database";

const initialFormData: Omit<Partner, 'id' | 'created_at' | 'updated_at'> = {
  name: "",
  partner_type: "individual",
  ownership_percentage: 0,
  share_value: 0,
  contact_info: {
    email: "",
    phone: "",
  },
  documents: []
};

export default function PartnerForm({ onSuccess }: { onSuccess: () => void }) {
  const [formData, setFormData] = useState(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useAutoSave({
    formType: "partner",
    data: formData,
    onLoad: (savedData) => setFormData(savedData),
  });

  const validateFormData = () => {
    const errors = [];
    if (!formData.name.trim()) {
      errors.push("اسم الشريك مطلوب");
    }
    if (formData.ownership_percentage <= 0 || formData.ownership_percentage > 100) {
      errors.push("نسبة الملكية يجب أن تكون بين 1 و 100");
    }
    if (formData.share_value < 0) {
      errors.push("قيمة الحصة يجب أن تكون أكبر من أو تساوي صفر");
    }
    return errors;
  };

  const handleSubmit = async () => {
    try {
      setError(null);
      const errors = validateFormData();
      if (errors.length > 0) {
        setError(errors.join("\n"));
        return;
      }

      setIsSubmitting(true);
      console.log("بدء عملية حفظ الشريك...", formData);

      const { data, error } = await supabase
        .from("company_partners")
        .insert([formData])
        .select();

      if (error) throw error;

      console.log("تم حفظ الشريك بنجاح:", data);

      toast({
        title: "تم إضافة الشريك بنجاح",
        description: `تم إضافة ${formData.name} كشريك جديد`
      });
      
      setFormData(initialFormData);
      onSuccess();
    } catch (error: any) {
      console.error("خطأ في حفظ الشريك:", error);
      setError(error.message || "حدث خطأ أثناء حفظ بيانات الشريك");
      toast({
        title: "خطأ في الحفظ",
        description: error.message || "حدث خطأ أثناء حفظ بيانات الشريك",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label>اسم الشريك</Label>
          <Input
            value={formData.name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>نوع الشريك</Label>
            <Select
              value={formData.partner_type}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, partner_type: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر نوع الشريك" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="individual">فرد</SelectItem>
                <SelectItem value="company">شركة</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>نسبة الملكية (%)</Label>
            <Input
              type="number"
              min="0"
              max="100"
              value={formData.ownership_percentage}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  ownership_percentage: parseFloat(e.target.value) || 0,
                }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label>قيمة الحصة (ريال)</Label>
            <Input
              type="number"
              min="0"
              value={formData.share_value}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  share_value: parseFloat(e.target.value) || 0,
                }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label>البريد الإلكتروني</Label>
            <Input
              type="email"
              value={formData.contact_info.email}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  contact_info: { ...prev.contact_info, email: e.target.value },
                }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label>رقم الهاتف</Label>
            <Input
              type="tel"
              value={formData.contact_info.phone}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  contact_info: { ...prev.contact_info, phone: e.target.value },
                }))
              }
            />
          </div>
        </div>

        <Button 
          onClick={handleSubmit} 
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? "جاري الحفظ..." : "إضافة شريك جديد"}
        </Button>
      </CardContent>
    </Card>
  );
}
