
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CalendarIcon, User, MapPin, Phone, Mail } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ProjectOverviewProps {
  projectId?: string;
}

export function ProjectOverview({ projectId }: ProjectOverviewProps) {
  const { data: project, isLoading } = useQuery({
    queryKey: ["project", projectId],
    queryFn: async () => {
      if (!projectId) return null;
      
      const { data, error } = await supabase
        .from("projects")
        .select(`
          *,
          clients!inner (
            id,
            name,
            email,
            phone,
            address
          )
        `)
        .eq("id", projectId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!projectId,
  });

  if (isLoading) {
    return <div>جاري التحميل...</div>;
  }

  if (!project) {
    return <div>لم يتم العثور على المشروع</div>;
  }

  const clientData = project.clients;
  const clientName = clientData?.name || "غير محدد";
  const clientEmail = clientData?.email || "غير محدد";
  const clientPhone = clientData?.phone || "غير محدد";

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "مكتمل";
      case "in_progress":
        return "قيد التنفيذ";
      case "pending":
        return "في الانتظار";
      default:
        return status;
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>معلومات المشروع</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg">{project.title}</h3>
            <p className="text-muted-foreground">{project.description}</p>
          </div>

          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(project.status)}>
              {getStatusText(project.status)}
            </Badge>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <CalendarIcon className="h-4 w-4" />
              <span>تاريخ البداية: {new Date(project.start_date).toLocaleDateString('ar-SA')}</span>
            </div>
            {project.end_date && (
              <div className="flex items-center gap-2 text-sm">
                <CalendarIcon className="h-4 w-4" />
                <span>تاريخ الانتهاء: {new Date(project.end_date).toLocaleDateString('ar-SA')}</span>
              </div>
            )}
          </div>

          <div>
            <p className="text-sm font-medium mb-2">نسبة الإنجاز</p>
            <Progress value={project.progress || 0} className="w-full" />
            <p className="text-sm text-muted-foreground mt-1">{project.progress || 0}%</p>
          </div>

          <div>
            <p className="text-sm font-medium">الميزانية</p>
            <p className="text-lg font-semibold">{project.budget?.toLocaleString()} ريال</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>معلومات العميل</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="font-medium">{clientName}</span>
          </div>

          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            <span className="text-sm">{clientEmail}</span>
          </div>

          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            <span className="text-sm">{clientPhone}</span>
          </div>

          {clientData?.address && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span className="text-sm">{typeof clientData.address === 'string' ? clientData.address : JSON.stringify(clientData.address)}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
