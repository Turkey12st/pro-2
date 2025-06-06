
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ProjectForm from "@/components/projects/ProjectForm";
import ProjectList from "@/components/projects/ProjectList";

export default function ProjectsPage() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">إدارة المشاريع</h1>
          <p className="text-muted-foreground">تخطيط ومتابعة المشاريع والمهام</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          مشروع جديد
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>إضافة مشروع جديد</CardTitle>
          </CardHeader>
          <CardContent>
            <ProjectForm onSuccess={() => setShowForm(false)} />
          </CardContent>
        </Card>
      )}

      <ProjectList />
    </div>
  );
}
