
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CalendarIcon, DollarSign, MapPin, Mail, Phone, User } from "lucide-react";

interface ProjectOverviewProps {
  projectId?: string;
}

export default function ProjectOverview({ projectId }: ProjectOverviewProps) {
  const { data: projectData, isLoading } = useQuery({
    queryKey: ["project-overview", projectId],
    queryFn: async () => {
      if (!projectId) return null;
      
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
    enabled: !!projectId
  });

  if (isLoading) {
    return <div className="text-center py-6">جاري التحميل...</div>;
  }

  if (!projectData) {
    return <div className="text-center py-6">لم يتم العثور على بيانات المشروع</div>;
  }

  // التحقق من وجود بيانات العميل بشكل آمن
  const clientData = projectData.client && typeof projectData.client === 'object' ? projectData.client : null;
  const clientName = clientData?.name || "غير محدد";
  const clientEmail = clientData?.email || "غير محدد";
  const clientPhone = clientData?.phone || "غير محدد";

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">{projectData.name}</CardTitle>
            <Badge variant={projectData.status === 'active' ? 'default' : 'secondary'}>
              {projectData.status === 'active' ? 'نشط' : 'مكتمل'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">{projectData.description}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">تاريخ البداية:</span>
                <span className="text-sm">{projectData.start_date || "غير محدد"}</span>
              </div>
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">تاريخ النهاية:</span>
                <span className="text-sm">{projectData.end_date || "غير محدد"}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">الميزانية:</span>
                <span className="text-sm">{projectData.budget ? `${projectData.budget} ريال` : "غير محددة"}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">الموقع:</span>
                <span className="text-sm">{projectData.location || "غير محدد"}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            معلومات العميل
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">الاسم:</span>
            <span className="text-sm">{clientName}</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">البريد الإلكتروني:</span>
            <span className="text-sm">{clientEmail}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">الهاتف:</span>
            <span className="text-sm">{clientPhone}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
