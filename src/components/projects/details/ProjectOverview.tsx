
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Calendar, 
  User, 
  DollarSign, 
  Target, 
  Clock,
  MapPin,
  Mail,
  Phone,
  Building
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ProjectOverviewProps {
  projectId?: string;
}

export function ProjectOverview({ projectId }: ProjectOverviewProps) {
  const { id } = useParams();
  const currentProjectId = projectId || id;

  const { data: project, isLoading } = useQuery({
    queryKey: ['project', currentProjectId],
    queryFn: async () => {
      if (!currentProjectId) return null;
      
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', currentProjectId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!currentProjectId
  });

  const { data: client } = useQuery({
    queryKey: ['client', project?.client_id],
    queryFn: async () => {
      if (!project?.client_id) return null;
      
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', project.client_id)
        .single();
      
      if (error) {
        console.error('Error fetching client:', error);
        return null;
      }
      return data;
    },
    enabled: !!project?.client_id
  });

  if (isLoading) {
    return <div className="text-center">جاري التحميل...</div>;
  }

  if (!project) {
    return <div className="text-center">لم يتم العثور على المشروع</div>;
  }

  const statusColors = {
    planned: "bg-blue-100 text-blue-800",
    active: "bg-green-100 text-green-800",
    paused: "bg-yellow-100 text-yellow-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800"
  };

  const priorityColors = {
    low: "bg-gray-100 text-gray-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-red-100 text-red-800"
  };

  return (
    <div className="space-y-6">
      {/* Project Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl mb-2">{project.title}</CardTitle>
              <p className="text-muted-foreground">{project.description}</p>
            </div>
            <div className="flex gap-2">
              <Badge className={statusColors[project.status as keyof typeof statusColors]}>
                {project.status === 'planned' && 'مخطط'}
                {project.status === 'active' && 'نشط'}
                {project.status === 'paused' && 'متوقف'}
                {project.status === 'completed' && 'مكتمل'}
                {project.status === 'cancelled' && 'ملغى'}
              </Badge>
              <Badge className={priorityColors[project.priority as keyof typeof priorityColors]}>
                {project.priority === 'low' && 'منخفض'}
                {project.priority === 'medium' && 'متوسط'}
                {project.priority === 'high' && 'عالي'}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Project Details Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Timeline & Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              الجدول الزمني والتقدم
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>تاريخ البدء:</span>
                <span>{new Date(project.start_date).toLocaleDateString('ar-SA')}</span>
              </div>
              {project.end_date && (
                <div className="flex justify-between text-sm">
                  <span>تاريخ الانتهاء:</span>
                  <span>{new Date(project.end_date).toLocaleDateString('ar-SA')}</span>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>التقدم:</span>
                <span>{project.progress || 0}%</span>
              </div>
              <Progress value={project.progress || 0} className="w-full" />
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">المهام المكتملة:</span>
                <p className="font-medium">{project.completed_tasks || 0}</p>
              </div>
              <div>
                <span className="text-muted-foreground">إجمالي المهام:</span>
                <p className="font-medium">{project.total_tasks || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Financial Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              المعلومات المالية
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {project.budget && (
              <div className="flex justify-between text-sm">
                <span>الميزانية:</span>
                <span className="font-medium">{project.budget.toLocaleString()} ريال</span>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">التكلفة المقدرة:</span>
                <p className="font-medium">{project.estimated_cost?.toLocaleString() || 0} ريال</p>
              </div>
              <div>
                <span className="text-muted-foreground">التكلفة الفعلية:</span>
                <p className="font-medium">{project.actual_cost?.toLocaleString() || 0} ريال</p>
              </div>
              <div>
                <span className="text-muted-foreground">الإيرادات:</span>
                <p className="font-medium">{project.revenue?.toLocaleString() || 0} ريال</p>
              </div>
              <div>
                <span className="text-muted-foreground">الربح:</span>
                <p className="font-medium">{project.profit?.toLocaleString() || 0} ريال</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Client Information */}
        {client && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                معلومات العميل
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-lg font-medium">{client.name}</div>
              
              <div className="space-y-2 text-sm">
                {client.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{client.email}</span>
                  </div>
                )}
                
                {client.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{client.phone}</span>
                  </div>
                )}
                
                {client.address && typeof client.address === 'object' && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {[
                        client.address.street,
                        client.address.city,
                        client.address.country
                      ].filter(Boolean).join(', ')}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Time Tracking */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              تتبع الوقت
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">الساعات المقدرة:</span>
                <p className="font-medium">{project.estimated_hours || 0} ساعة</p>
              </div>
              <div>
                <span className="text-muted-foreground">الساعات الفعلية:</span>
                <p className="font-medium">{project.actual_hours || 0} ساعة</p>
              </div>
            </div>

            {project.estimated_hours && project.actual_hours && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>كفاءة الوقت:</span>
                  <span>{((project.estimated_hours / project.actual_hours) * 100).toFixed(1)}%</span>
                </div>
                <Progress 
                  value={(project.actual_hours / project.estimated_hours) * 100} 
                  className="w-full" 
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Additional Notes */}
      {project.notes && (
        <Card>
          <CardHeader>
            <CardTitle>ملاحظات إضافية</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{project.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
