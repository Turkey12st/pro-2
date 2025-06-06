import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AppLayout } from "@/components/AppLayout";
import { useToast } from "@/hooks/use-toast";
import { UserSquare2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ClientList from "@/components/clients/ClientList";
import ClientForm from "@/components/clients/ClientForm";

export default function ClientsPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("list");

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">إدارة العملاء</h1>
          <Button onClick={() => setActiveTab("new")} className="gap-2">
            <Plus className="h-4 w-4" />
            عميل جديد
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="list">قائمة العملاء</TabsTrigger>
            <TabsTrigger value="new">عميل جديد</TabsTrigger>
          </TabsList>
          <TabsContent value="list">
            <ClientList />
          </TabsContent>
          <TabsContent value="new">
            <ClientForm onSuccess={() => setActiveTab("list")} />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
