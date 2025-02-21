
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AppLayout from "@/components/AppLayout";
import { useToast } from "@/hooks/use-toast";
import { Users2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PartnersList from "@/components/partners/PartnersList";
import PartnerForm from "@/components/partners/PartnerForm";

export default function PartnersPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("list");

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">إدارة الشركاء</h1>
          <Button onClick={() => setActiveTab("new")} className="gap-2">
            <Plus className="h-4 w-4" />
            شريك جديد
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="list">قائمة الشركاء</TabsTrigger>
            <TabsTrigger value="new">شريك جديد</TabsTrigger>
          </TabsList>
          <TabsContent value="list">
            <PartnersList />
          </TabsContent>
          <TabsContent value="new">
            <PartnerForm onSuccess={() => setActiveTab("list")} />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
