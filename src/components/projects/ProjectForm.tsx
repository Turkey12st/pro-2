
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function ProjectForm({ onSuccess }: { onSuccess: () => void }) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [projectData, setProjectData] = useState({
    title: "",
    description: "",
    start_date: format(new Date(), "yyyy-MM-dd"),
    end_date: format(new Date(new Date().setMonth(new Date().getMonth() + 1)), "yyyy-MM-dd"),
    budget: 0,
    status: "planned",
    priority: "medium",
    progress: 0
  });

  const handleChange = (field: string, value: string | number) => {
    setProjectData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDateSelect = (field: string, date: Date | undefined) => {
    if (date) {
      setProjectData(prev => ({
        ...prev,
        [field]: format(date, "yyyy-MM-dd")
      }));
    }
  };

  const handleSubmit = async () => {
    if (!projectData.title) {
      toast({
        variant: "destructive",
        title: "خطأ في البيانات",
        description: "يرجى إدخال عنوان المشروع"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // إنشاء كائن البيانات بما في ذلك معرف المنشئ
      const projectToSave = {
        title: projectData.title,
        description: projectData.description,
        start_date: projectData.start_date,
        end_date: projectData.end_date,
        budget: parseFloat(projectData.budget.toString()),
        status: projectData.status,
        priority: projectData.priority,
        progress: parseInt(projectData.progress.toString())
      };
      
      const { error } = await supabase
        .from("projects")
        .insert([projectToSave]);

      if (error) {
        throw error;
      }

      toast({
        title: "تم إنشاء المشروع بنجاح",
        description: `تم إضافة مشروع ${projectData.title} بنجاح`
      });

      // إعادة تعيين النموذج
      setProjectData({
        title: "",
        description: "",
        start_date: format(new Date(), "yyyy-MM-dd"),
        end_date: format(new Date(new Date().setMonth(new Date().getMonth() + 1)), "yyyy-MM-dd"),
        budget: 0,
        status: "planned",
        priority: "medium",
        progress: 0
      });

      // استدعاء دالة النجاح
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error creating project:", error);
      toast({
        variant: "destructive",
        title: "خطأ في إنشاء المشروع",
        description: "حدث خطأ أثناء محاولة إنشاء المشروع"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">عنوان المشروع <span className="text-red-500">*</span></Label>
          <Input
            id="title"
            value={projectData.title}
            onChange={(e) => handleChange("title", e.target.value)}
            placeholder="أدخل عنوان المشروع"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">وصف المشروع</Label>
          <Textarea
            id="description"
            value={projectData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            placeholder="أدخل وصفاً مختصراً للمشروع"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>تاريخ البدء <span className="text-red-500">*</span></Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between text-right"
                >
                  {projectData.start_date ? (
                    format(new Date(projectData.start_date), "yyyy/MM/dd", { locale: ar })
                  ) : (
                    <span>اختر تاريخاً</span>
                  )}
                  <CalendarIcon className="h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  locale={ar}
                  selected={projectData.start_date ? new Date(projectData.start_date) : undefined}
                  onSelect={(date) => handleDateSelect("start_date", date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>تاريخ الانتهاء <span className="text-red-500">*</span></Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between text-right"
                >
                  {projectData.end_date ? (
                    format(new Date(projectData.end_date), "yyyy/MM/dd", { locale: ar })
                  ) : (
                    <span>اختر تاريخاً</span>
                  )}
                  <CalendarIcon className="h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  locale={ar}
                  selected={projectData.end_date ? new Date(projectData.end_date) : undefined}
                  onSelect={(date) => handleDateSelect("end_date", date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="budget">الميزانية (ريال)</Label>
            <Input
              id="budget"
              type="number"
              value={projectData.budget}
              onChange={(e) => handleChange("budget", parseFloat(e.target.value))}
              placeholder="0"
              dir="ltr"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="progress">نسبة الإنجاز (%)</Label>
            <Input
              id="progress"
              type="number"
              min="0"
              max="100"
              value={projectData.progress}
              onChange={(e) => handleChange("progress", parseInt(e.target.value))}
              placeholder="0"
              dir="ltr"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>الحالة</Label>
            <Select
              value={projectData.status}
              onValueChange={(value) => handleChange("status", value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="اختر حالة المشروع" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="planned">مخطط</SelectItem>
                <SelectItem value="in-progress">قيد التنفيذ</SelectItem>
                <SelectItem value="on-hold">معلق</SelectItem>
                <SelectItem value="completed">مكتمل</SelectItem>
                <SelectItem value="cancelled">ملغي</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>الأولوية</Label>
            <Select
              value={projectData.priority}
              onValueChange={(value) => handleChange("priority", value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="اختر أولوية المشروع" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">منخفضة</SelectItem>
                <SelectItem value="medium">متوسطة</SelectItem>
                <SelectItem value="high">عالية</SelectItem>
                <SelectItem value="urgent">عاجلة</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button 
          onClick={handleSubmit} 
          className="w-full mt-4"
          disabled={isSubmitting}
        >
          {isSubmitting ? "جاري الحفظ..." : "إضافة المشروع"}
        </Button>
      </CardContent>
    </Card>
  );
}
