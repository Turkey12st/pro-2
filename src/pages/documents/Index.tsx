
import React, { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DocumentsList from "@/components/documents/DocumentsList";
import { DocumentForm } from "@/components/documents/DocumentForm";
import { Button } from "@/components/ui/button";
import { FileText, Plus } from "lucide-react";

export default function DocumentsPage() {
  const [activeTab, setActiveTab] = useState("list");

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold">المستندات والتراخيص</h1>
            <p className="text-muted-foreground">إدارة المستندات والتراخيص الخاصة بالشركة</p>
          </div>
          <Button onClick={() => setActiveTab("add")}>
            <Plus className="mr-2 h-4 w-4" /> إضافة مستند
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="list" className="flex-1">
              <FileText className="h-4 w-4 mr-2" />
              قائمة المستندات
            </TabsTrigger>
            <TabsTrigger value="add" className="flex-1">
              <Plus className="h-4 w-4 mr-2" />
              إضافة مستند
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list">
            <DocumentsList />
          </TabsContent>

          <TabsContent value="add">
            <DocumentForm onSuccess={() => setActiveTab("list")} />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
