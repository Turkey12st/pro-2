
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CalendarIcon, Users, Briefcase, Clock, DollarSign, PieChart, LineChart } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface Client {
  name: string;
  email: string;
  phone: string;
}

interface Project {
  id: string;
  title: string;
  description?: string;
  client?: Client;
  start_date: string;
  end_date?: string;
  budget?: number;
  actual_cost?: number;
  progress: number;
  total_tasks: number;
  completed_tasks: number;
  status: string;
  priority: string;
  estimated_hours?: number;
  actual_hours?: number;
  profit?: number;
  revenue?: number;
  manager_id?: string;
}

interface ProjectOverviewProps {
  projectId?: string;
}

export default function ProjectOverview({ projectId }: ProjectOverviewProps) {
  const { data: projectData } = useQuery({
    queryKey: ["project-overview", projectId],
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
      return data;
    },
  });

  // Transform the data to ensure it conforms to our interface
  const project: Project | undefined = projectData ? {
    id: projectData.id,
    title: projectData.title,
    description: projectData.description,
    client: projectData.client?.error ? undefined : {
      name: projectData.client?.name || "غير محدد",
      email: projectData.client?.email || "",
      phone: projectData.client?.phone || ""
    },
    start_date: projectData.start_date,
    end_date: projectData.end_date,
    budget: projectData.budget,
    actual_cost: projectData.actual_cost,
    progress: projectData.progress || 0,
    total_tasks: projectData.total_tasks || 0,
    completed_tasks: projectData.completed_tasks || 0,
    status: projectData.status,
    priority: projectData.priority,
    estimated_hours: projectData.estimated_hours,
    actual_hours: projectData.actual_hours,
    profit: projectData.profit,
    revenue: projectData.revenue,
    manager_id: projectData.manager_id
  } : undefined;

  // Format dates properly
  const formatDate = (dateString?: string) => {
    if (!dateString) return "غير محدد";
    try {
      return format(new Date(dateString), "dd MMMM yyyy", { locale: ar });
    } catch (e) {
      return "تاريخ غير صالح";
    }
  };

  // Format currency values
  const formatCurrency = (value?: number) => {
    if (value == null) return "غير محدد";
    return new Intl.NumberFormat("ar-SA", {
      style: "currency",
      currency: "SAR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (!project) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        جاري تحميل بيانات المشروع...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">معلومات المشروع</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">{project.title}</h3>
              <p className="text-muted-foreground">{project.description || "لا يوجد وصف"}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">تاريخ البدء</p>
                  <p className="font-medium">{formatDate(project.start_date)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">تاريخ الانتهاء</p>
                  <p className="font-medium">{formatDate(project.end_date)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">الحالة</p>
                  <p className="font-medium">{project.status}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <PieChart className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">الأولوية</p>
                  <p className="font-medium">{project.priority}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">معلومات العميل</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-2">
                <div>
                  <p className="text-sm text-muted-foreground">اسم العميل</p>
                  <p className="font-medium">
                    {project.client?.name || "غير محدد"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">البريد الإلكتروني</p>
                  <p className="font-medium">
                    {project.client?.email || "غير محدد"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">رقم الهاتف</p>
                  <p className="font-medium">
                    {project.client?.phone || "غير محدد"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">التقدم</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="font-medium text-xl">{project.progress}%</p>
                <p className="text-xs text-muted-foreground">{project.completed_tasks}/{project.total_tasks} مهام</p>
              </div>
              <Progress value={project.progress} />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">الساعات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-2xl font-medium">
                  {project.actual_hours || 0}
                </p>
                <p className="text-xs text-muted-foreground">ساعات العمل</p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              المقدر: {project.estimated_hours || 0} ساعة
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">الميزانية</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-2xl font-medium">
                  {formatCurrency(project.actual_cost)}
                </p>
                <p className="text-xs text-muted-foreground">التكلفة الفعلية</p>
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              المقدر: {formatCurrency(project.budget)}
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">الإيرادات</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground">الإيرادات</p>
                <p className="font-medium">{formatCurrency(project.revenue)}</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground">التكاليف</p>
                <p className="font-medium">{formatCurrency(project.actual_cost)}</p>
              </div>
              <div className="flex items-center justify-between border-t pt-4">
                <p className="font-medium">الأرباح</p>
                <p className="font-semibold">{formatCurrency(project.profit)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">فريق العمل</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Users className="h-10 w-10 text-muted-foreground" />
              <div>
                <p className="text-lg font-medium">
                  {project.manager_id ? "1" : "0"} مدير مشروع
                </p>
                <p className="text-sm text-muted-foreground">
                  و {Array.isArray(projectData?.team_members) ? projectData.team_members.length : 0} أعضاء فريق
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
