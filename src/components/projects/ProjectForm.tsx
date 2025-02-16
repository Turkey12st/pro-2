
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAutoSave } from "@/hooks/useAutoSave";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type ProjectFormData = {
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  budget: number;
  status: string;
  priority: string;
};

const initialFormData: ProjectFormData = {
  title: "",
  description: "",
  start_date: "",
  end_date: "",
  budget: 0,
  status: "planned",
  priority: "medium",
};

export default function ProjectForm({ onSuccess }: { onSuccess: () => void }) {
  const [formData, setFormData] = useState<ProjectFormData>(initialFormData);
  const { toast } = useToast();

  useAutoSave({
    formType: "project",
    data: formData,
    onLoad: (savedData) => setFormData(savedData),
  });

  const handleSubmit = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("يجب تسجيل الدخول أولاً");
      }

      const { error } = await supabase
        .from("projects")
        .insert([{ ...formData, created_by: user.id }]);

      if (error) throw error;

      toast({
        title: "تم إنشاء المشروع بنجاح",
      });
      
      onSuccess();
    } catch (error) {
      console.error("Error creating project:", error);
      toast({
        variant: "destructive",
        title: "خطأ في إنشاء المشروع",
        description: "حدث خطأ أثناء حفظ بيانات المشروع",
      });
    }
  };

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <div className="space-y-2">
          <Label>عنوان المشروع</Label>
          <Input
            value={formData.title}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, title: e.target.value }))
            }
          />
        </div>

        <div className="space-y-2">
          <Label>وصف المشروع</Label>
          <Textarea
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, description: e.target.value }))
            }
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>تاريخ البداية</Label>
            <Input
              type="date"
              value={formData.start_date}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, start_date: e.target.value }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label>تاريخ النهاية</Label>
            <Input
              type="date"
              value={formData.end_date}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, end_date: e.target.value }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label>الميزانية</Label>
            <Input
              type="number"
              value={formData.budget}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  budget: parseFloat(e.target.value) || 0,
                }))
              }
            />
          </div>
        </div>

        <Button onClick={handleSubmit} className="w-full">
          إنشاء المشروع
        </Button>
      </CardContent>
    </Card>
  );
}
