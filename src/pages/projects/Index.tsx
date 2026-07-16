
import { FolderKanban, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProjectList from "@/components/projects/ProjectList";
import ProjectForm from "@/components/projects/ProjectForm";
import { PageShell } from "@/components/shared/PageShell";

export default function ProjectsPage() {
  const [activeTab, setActiveTab] = useState("list");

  return (
    <PageShell
      title="إدارة المشاريع"
      description="متابعة المشاريع النشطة والمكتملة وإنشاء مشاريع جديدة"
      icon={FolderKanban}
      actions={
        <Button onClick={() => setActiveTab("new")} className="gap-2">
          <Plus className="h-4 w-4" />
          مشروع جديد
        </Button>
      }
    >
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full sm:w-auto grid-cols-2">
          <TabsTrigger value="list">قائمة المشاريع</TabsTrigger>
          <TabsTrigger value="new">مشروع جديد</TabsTrigger>
        </TabsList>
        <TabsContent value="list">
          <ProjectList />
        </TabsContent>
        <TabsContent value="new">
          <ProjectForm onSuccess={() => setActiveTab("list")} />
        </TabsContent>
      </Tabs>
    </PageShell>
  );
}
