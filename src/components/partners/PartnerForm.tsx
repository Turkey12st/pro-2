
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
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAutoSave } from "@/hooks/useAutoSave";

type PartnerFormData = {
  name: string;
  partner_type: string;
  ownership_percentage: number;
  share_value: number;
  contact_info: {
    email: string;
    phone: string;
  };
};

const initialFormData: PartnerFormData = {
  name: "",
  partner_type: "individual",
  ownership_percentage: 0,
  share_value: 0,
  contact_info: {
    email: "",
    phone: "",
  },
};

export default function PartnerForm({ onSuccess }: { onSuccess: () => void }) {
  const [formData, setFormData] = useState<PartnerFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // تفعيل الحفظ التلقائي
  useAutoSave({
    formType: "partner",
    data: formData,
    onLoad: (savedData) => setFormData(savedData),
  });

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      const { error } = await supabase
        .from("company_partners")
        .insert([formData]);

      if (error) throw error;

      toast({
        title: "تم إضافة الشريك بنجاح",
      });
      
      onSuccess();
    } catch (error) {
      console.error("Error saving partner:", error);
      toast({
        title: "خطأ في الحفظ",
        description: "حدث خطأ أثناء حفظ بيانات الشريك",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
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
