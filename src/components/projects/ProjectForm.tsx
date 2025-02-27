
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useAutoSave({
    formType: "project",
    data: formData,
    onLoad: (savedData) => setFormData(savedData),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("يجب تسجيل الدخول أولاً");
      }

      if (!formData.title || !formData.start_date) {
        throw new Error("يرجى إدخال جميع البيانات المطلوبة");
      }

      const { error } = await supabase
        .from("projects")
        .insert({
          ...formData,
          created_by: user.id,
          created_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "تم إنشاء المشروع بنجاح",
        description: "تم حفظ بيانات المشروع في قاعدة البيانات"
      });
      
      onSuccess();
    } catch (error) {
      console.error("Error creating project:", error);
      toast({
        variant: "destructive",
        title: "خطأ في إنشاء المشروع",
        description: error instanceof Error ? error.message : "حدث خطأ أثناء حفظ بيانات المشروع"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">عنوان المشروع</Label>
              <Input
                id="title"
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">وصف المشروع</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">تاريخ البداية</Label>
                <Input
                  id="start_date"
                  type="date"
                  required
                  value={formData.start_date}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, start_date: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="end_date">تاريخ النهاية</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, end_date: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="budget">الميزانية</Label>
                <Input
                  id="budget"
                  type="number"
                  min="0"
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

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "جاري الحفظ..." : "إنشاء المشروع"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
