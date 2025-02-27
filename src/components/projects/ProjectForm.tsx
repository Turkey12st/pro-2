
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAutoSave } from "@/hooks/useAutoSave";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
      if (!formData.title || !formData.start_date) {
        throw new Error("يرجى إدخال عنوان المشروع وتاريخ البداية على الأقل");
      }

      // إنشاء كائن البيانات للإرسال
      const projectData = {
        title: formData.title,
        description: formData.description,
        start_date: formData.start_date,
        end_date: formData.end_date || null,
        budget: formData.budget || 0,
        status: formData.status,
        priority: formData.priority,
        progress: 0
      };

      const { data, error } = await supabase
        .from("projects")
        .insert([projectData])
        .select();

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
              <Label htmlFor="title">
                عنوان المشروع <span className="text-red-500">*</span>
              </Label>
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
                <Label htmlFor="start_date">
                  تاريخ البداية <span className="text-red-500">*</span>
                </Label>
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
                <Label htmlFor="budget">الميزانية (ريال)</Label>
                <Input
                  id="budget"
                  type="number"
                  min="0"
                  dir="ltr"
                  value={formData.budget}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      budget: parseFloat(e.target.value) || 0,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">حالة المشروع</Label>
                <Select 
                  value={formData.status}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر حالة المشروع" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planned">مخطط له</SelectItem>
                    <SelectItem value="in-progress">قيد التنفيذ</SelectItem>
                    <SelectItem value="completed">مكتمل</SelectItem>
                    <SelectItem value="cancelled">ملغي</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">الأولوية</Label>
                <Select 
                  value={formData.priority}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر أولوية المشروع" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">منخفضة</SelectItem>
                    <SelectItem value="medium">متوسطة</SelectItem>
                    <SelectItem value="high">عالية</SelectItem>
                  </SelectContent>
                </Select>
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
