
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Partner } from "@/types/database";

interface PartnerFormProps {
  initialData?: Partial<Partner>;
  onSuccess?: (partner: Partner) => void;
  onCancel?: () => void;
}

export default function PartnerForm({ initialData, onSuccess, onCancel }: PartnerFormProps) {
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [partnerData, setPartnerData] = useState<Partial<Partner>>({
    name: "",
    partner_type: "individual",
    ownership_percentage: 0,
    share_value: 0,
    contact_info: {
      email: "",
      phone: ""
    },
    documents: [],
    ...initialData
  });

  const isUpdate = Boolean(initialData?.id);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPartnerData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setPartnerData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleContactChange = (field: string, value: string) => {
    setPartnerData((prev) => ({
      ...prev,
      contact_info: {
        ...(prev.contact_info || {}),
        [field]: value
      }
    }));
  };

  const validateForm = (): boolean => {
    if (!partnerData.name) {
      toast({
        title: "خطأ في البيانات",
        description: "يرجى إدخال اسم الشريك",
        variant: "destructive",
      });
      return false;
    }
    
    if (!partnerData.partner_type) {
      toast({
        title: "خطأ في البيانات",
        description: "يرجى تحديد نوع الشريك",
        variant: "destructive",
      });
      return false;
    }

    if (!partnerData.ownership_percentage || partnerData.ownership_percentage <= 0 || partnerData.ownership_percentage > 100) {
      toast({
        title: "خطأ في البيانات",
        description: "يرجى إدخال نسبة ملكية صحيحة (بين 1 و 100)",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      // تجهيز البيانات للإرسال 
      const partnerPayload = {
        name: partnerData.name,
        partner_type: partnerData.partner_type,
        ownership_percentage: partnerData.ownership_percentage,
        share_value: partnerData.share_value || 0,
        contact_info: partnerData.contact_info || {},
        documents: partnerData.documents || []
      };
      
      let result;

      if (isUpdate && initialData?.id) {
        // تحديث شريك موجود
        const { data, error } = await supabase
          .from("company_partners")
          .update(partnerPayload)
          .eq("id", initialData.id)
          .select("*")
          .single();

        if (error) throw error;
        result = data;
        
        toast({
          title: "تم التحديث",
          description: "تم تحديث بيانات الشريك بنجاح",
        });
      } else {
        // إضافة شريك جديد
        const { data, error } = await supabase
          .from("company_partners")
          .insert([partnerPayload])
          .select("*")
          .single();

        if (error) throw error;
        result = data;
        
        toast({
          title: "تمت الإضافة",
          description: "تم إضافة الشريك بنجاح",
        });
      }

      if (onSuccess && result) {
        onSuccess(result as Partner);
      }
    } catch (error) {
      console.error("Error saving partner:", error);
      toast({
        title: "حدث خطأ",
        description: "لم نتمكن من حفظ البيانات. الرجاء المحاولة مرة أخرى.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="name">اسم الشريك</Label>
          <Input
            id="name"
            name="name"
            value={partnerData.name || ""}
            onChange={handleChange}
            required
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="partner_type">نوع الشريك</Label>
          <Select 
            value={partnerData.partner_type} 
            onValueChange={(value) => handleSelectChange("partner_type", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر نوع الشريك" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="individual">فرد</SelectItem>
              <SelectItem value="company">شركة</SelectItem>
              <SelectItem value="government">جهة حكومية</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="ownership_percentage">نسبة الملكية (%)</Label>
          <Input
            id="ownership_percentage"
            name="ownership_percentage"
            type="number"
            min="0.01"
            max="100"
            step="0.01"
            value={partnerData.ownership_percentage || ""}
            onChange={handleChange}
            required
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="share_value">قيمة الحصة (ريال)</Label>
          <Input
            id="share_value"
            name="share_value"
            type="number"
            min="0"
            step="0.01"
            value={partnerData.share_value || ""}
            onChange={handleChange}
          />
        </div>

        <div className="grid gap-2">
          <Label>معلومات الاتصال</Label>
          <div className="space-y-2">
            <Input
              placeholder="البريد الإلكتروني"
              value={(partnerData.contact_info?.email) || ""}
              onChange={(e) => handleContactChange("email", e.target.value)}
            />
            <Input
              placeholder="رقم الهاتف"
              value={(partnerData.contact_info?.phone) || ""}
              onChange={(e) => handleContactChange("phone", e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          إلغاء
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "جاري الحفظ..." : isUpdate ? "تحديث الشريك" : "إضافة شريك"}
        </Button>
      </div>
    </form>
  );
}
