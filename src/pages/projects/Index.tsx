import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AppLayout } from "@/components/AppLayout";
import { useToast } from "@/components/ui/use-toast";
import { FolderKanban, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProjectList from "@/components/projects/ProjectList";
import ProjectForm from "@/components/projects/ProjectForm";

export default function ProjectsPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("list");

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">إدارة المشاريع</h1>
          <Button onClick={() => setActiveTab("new")} className="gap-2">
            <Plus className="h-4 w-4" />
            مشروع جديد
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
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
      </div>
    </AppLayout>
  );
}
