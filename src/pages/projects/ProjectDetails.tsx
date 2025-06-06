
import { useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Users, DollarSign, FileText, Activity, CheckSquare, Paperclip } from "lucide-react";

import { ProjectOverview } from "@/components/projects/details/ProjectOverview";
import ProjectTasks from "@/components/projects/details/ProjectTasks";
import ProjectTeam from "@/components/projects/details/ProjectTeam";
import ProjectExpenses from "@/components/projects/details/ProjectExpenses";
import ProjectFiles from "@/components/projects/details/ProjectFiles";
import ProjectActivities from "@/components/projects/details/ProjectActivities";
import ProjectMilestones from "@/components/projects/details/ProjectMilestones";
import ProjectInvoices from "@/components/projects/details/ProjectInvoices";

export default function ProjectDetails() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState("overview");

  // Mock project data - properly structured for ProjectOverview component
  const project = {
    id: id || "1",
    title: "مشروع تطوير موقع الشركة",
    description: "تطوير موقع إلكتروني متطور للشركة مع نظام إدارة المحتوى",
    status: "in-progress" as const,
    priority: "high" as const,
    start_date: "2024-01-15",
    end_date: "2024-06-15",
    budget: 150000,
    progress: 35,
    created_at: "2024-01-01T00:00:00Z",
    client_id: "client-1",
    manager_id: "manager-1",
    team_members: [
      { id: "1", name: "سارة أحمد", role: "مطور أمامي", avatar: "" },
      { id: "2", name: "محمد علي", role: "مطور خلفي", avatar: "" },
      { id: "3", name: "فاطمة حسن", role: "مصمم UI/UX", avatar: "" }
    ]
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      <div className="container mx-auto py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{project.title}</h1>
              <p className="text-muted-foreground">{project.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={project.status === "completed" ? "default" : "secondary"}>
              {project.status === "in-progress" ? "قيد التنفيذ" : "مكتمل"}
            </Badge>
            <Badge variant={project.priority === "high" ? "destructive" : "outline"}>
              {project.priority === "high" ? "أولوية عالية" : "أولوية متوسطة"}
            </Badge>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">تاريخ الانتهاء</p>
                  <p className="font-medium">{project.end_date}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">أعضاء الفريق</p>
                  <p className="font-medium">{project.team_members?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">الميزانية</p>
                  <p className="font-medium">{project.budget?.toLocaleString() || 0} ر.س</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">التقدم</p>
                  <p className="font-medium">{project.progress || 0}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              نظرة عامة
            </TabsTrigger>
            <TabsTrigger value="tasks" className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4" />
              المهام
            </TabsTrigger>
            <TabsTrigger value="team" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              الفريق
            </TabsTrigger>
            <TabsTrigger value="expenses" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              المصروفات
            </TabsTrigger>
            <TabsTrigger value="files" className="flex items-center gap-2">
              <Paperclip className="h-4 w-4" />
              الملفات
            </TabsTrigger>
            <TabsTrigger value="activities" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              الأنشطة
            </TabsTrigger>
            <TabsTrigger value="milestones" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              المعالم
            </TabsTrigger>
            <TabsTrigger value="invoices" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              الفواتير
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <ProjectOverview project={project} />
          </TabsContent>

          <TabsContent value="tasks">
            <ProjectTasks projectId={project.id} />
          </TabsContent>

          <TabsContent value="team">
            <ProjectTeam projectId={project.id} />
          </TabsContent>

          <TabsContent value="expenses">
            <ProjectExpenses projectId={project.id} />
          </TabsContent>

          <TabsContent value="files">
            <ProjectFiles projectId={project.id} />
          </TabsContent>

          <TabsContent value="activities">
            <ProjectActivities projectId={project.id} />
          </TabsContent>

          <TabsContent value="milestones">
            <ProjectMilestones projectId={project.id} />
          </TabsContent>

          <TabsContent value="invoices">
            <ProjectInvoices projectId={project.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
