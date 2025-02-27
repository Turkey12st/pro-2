
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAutoSave } from "@/hooks/useAutoSave";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ClientFormData = {
  name: string;
  email: string;
  phone: string;
  vat_number: string;
  cr_number: string;
  contact_person: string;
  type: "company" | "individual";
};

const initialFormData: ClientFormData = {
  name: "",
  email: "",
  phone: "",
  vat_number: "",
  cr_number: "",
  contact_person: "",
  type: "company",
};

export default function ClientForm({ onSuccess }: { onSuccess: () => void }) {
  const [formData, setFormData] = useState<ClientFormData>(initialFormData);
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useAutoSave({
    formType: "client",
    data: formData,
    onLoad: (savedData) => setFormData(savedData),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) {
      toast({
        variant: "destructive",
        title: "خطأ في البيانات",
        description: "يرجى إدخال اسم العميل",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("clients").insert([
        {
          ...formData,
          metadata: {},
          address: {},
        }
      ]);

      if (error) throw error;

      toast({
        title: "تم إضافة العميل بنجاح",
        description: `تم إضافة العميل ${formData.name} بنجاح`,
      });

      onSuccess();
    } catch (error) {
      console.error("Error creating client:", error);
      toast({
        variant: "destructive",
        title: "خطأ في إضافة العميل",
        description: "حدث خطأ أثناء حفظ بيانات العميل",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <div className="space-y-2">
          <Label>نوع العميل</Label>
          <Select
            value={formData.type}
            onValueChange={(value: "company" | "individual") =>
              setFormData((prev) => ({ ...prev, type: value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر نوع العميل" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="company">شركة</SelectItem>
              <SelectItem value="individual">فرد</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>
            اسم العميل <span className="text-red-500">*</span>
          </Label>
          <Input
            value={formData.name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>البريد الإلكتروني</Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              dir="ltr"
            />
          </div>

          <div className="space-y-2">
            <Label>رقم الهاتف</Label>
            <Input
              type="tel"
              value={formData.phone}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, phone: e.target.value }))
              }
              dir="ltr"
            />
          </div>

          {formData.type === "company" && (
            <>
              <div className="space-y-2">
                <Label>الرقم الضريبي</Label>
                <Input
                  value={formData.vat_number}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, vat_number: e.target.value }))
                  }
                  dir="ltr"
                />
              </div>

              <div className="space-y-2">
                <Label>السجل التجاري</Label>
                <Input
                  value={formData.cr_number}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, cr_number: e.target.value }))
                  }
                  dir="ltr"
                />
              </div>

              <div className="space-y-2">
                <Label>الشخص المسؤول</Label>
                <Input
                  value={formData.contact_person}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, contact_person: e.target.value }))
                  }
                />
              </div>
            </>
          )}
        </div>

        <Button 
          onClick={handleSubmit} 
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? "جاري الحفظ..." : "إضافة العميل"}
        </Button>
      </CardContent>
    </Card>
  );
}
