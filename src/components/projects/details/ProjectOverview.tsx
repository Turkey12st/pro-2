
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface Client {
  name: string;
  email: string | null;
  phone: string | null;
}

interface Project {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string | null;
  budget: number;
  actual_cost: number;
  progress: number;
  estimated_hours: number;
  actual_hours: number;
  client: Client | null;
}

interface ProjectOverviewProps {
  projectId?: string;
}

export default function ProjectOverview({ projectId }: ProjectOverviewProps) {
  const { data: project } = useQuery({
    queryKey: ["project", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select(`
          *,
          client:client_id (
            name,
            email,
            phone
          )
        `)
        .eq("id", projectId)
        .single();

      if (error) throw error;
      
      // Ensure client data is properly formatted
      const clientData = data.client || null;
      
      return {
        ...data,
        client: clientData
      } as Project;
    },
  });

  if (!project) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex justify-between">
              <h3 className="font-semibold">تقدم المشروع</h3>
              <span className="text-lg">{project.progress}%</span>
            </div>
            <Progress value={project.progress} className="h-2" />
            
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div>
                <p className="text-sm text-muted-foreground">تاريخ البدء</p>
                <p className="font-medium">
                  {format(new Date(project.start_date), "dd MMMM yyyy", { locale: ar })}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">الموعد النهائي</p>
                <p className="font-medium">
                  {project.end_date ? format(new Date(project.end_date), "dd MMMM yyyy", { locale: ar }) : "غير محدد"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">الميزانية</p>
                <p className="font-medium">{project.budget?.toLocaleString()} ريال</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">التكلفة الفعلية</p>
                <p className="font-medium">{project.actual_cost?.toLocaleString()} ريال</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">الساعات المقدرة</p>
                <p className="font-medium">{project.estimated_hours || 0} ساعة</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">الساعات الفعلية</p>
                <p className="font-medium">{project.actual_hours || 0} ساعة</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-4">معلومات العميل</h3>
          {project.client ? (
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">اسم العميل</p>
                <p className="font-medium">{project.client.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">البريد الإلكتروني</p>
                <p className="font-medium">{project.client.email || "غير متوفر"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">رقم الهاتف</p>
                <p className="font-medium">{project.client.phone || "غير متوفر"}</p>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">لم يتم تحديد العميل</p>
          )}
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-4">وصف المشروع</h3>
          <p className="text-muted-foreground">
            {project.description || "لا يوجد وصف للمشروع"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
