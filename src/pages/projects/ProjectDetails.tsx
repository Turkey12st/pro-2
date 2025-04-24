
import { useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProjectOverview from "@/components/projects/details/ProjectOverview";
import ProjectTasks from "@/components/projects/details/ProjectTasks";
import ProjectTeam from "@/components/projects/details/ProjectTeam";
import ProjectMilestones from "@/components/projects/details/ProjectMilestones";
import ProjectInvoices from "@/components/projects/details/ProjectInvoices";
import ProjectExpenses from "@/components/projects/details/ProjectExpenses";
import ProjectFiles from "@/components/projects/details/ProjectFiles";
import ProjectActivities from "@/components/projects/details/ProjectActivities";
import AppLayout from "@/components/AppLayout";

export default function ProjectDetails() {
  const { id } = useParams();
  
  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto py-6">
        <Tabs defaultValue="overview" dir="rtl">
          <TabsList className="w-full justify-start mb-6">
            <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
            <TabsTrigger value="tasks">المهام</TabsTrigger>
            <TabsTrigger value="team">الفريق</TabsTrigger>
            <TabsTrigger value="milestones">المعالم الرئيسية</TabsTrigger>
            <TabsTrigger value="invoices">الفواتير</TabsTrigger>
            <TabsTrigger value="expenses">المصروفات</TabsTrigger>
            <TabsTrigger value="files">المرفقات</TabsTrigger>
            <TabsTrigger value="activities">الأنشطة</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <ProjectOverview projectId={id} />
          </TabsContent>
          <TabsContent value="tasks">
            <ProjectTasks projectId={id} />
          </TabsContent>
          <TabsContent value="team">
            <ProjectTeam projectId={id} />
          </TabsContent>
          <TabsContent value="milestones">
            <ProjectMilestones projectId={id} />
          </TabsContent>
          <TabsContent value="invoices">
            <ProjectInvoices projectId={id} />
          </TabsContent>
          <TabsContent value="expenses">
            <ProjectExpenses projectId={id} />
          </TabsContent>
          <TabsContent value="files">
            <ProjectFiles projectId={id} />
          </TabsContent>
          <TabsContent value="activities">
            <ProjectActivities projectId={id} />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
