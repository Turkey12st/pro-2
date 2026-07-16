import { Users2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PartnersList } from "@/components/partners/PartnersList";
import PartnerForm from "@/components/partners/PartnerForm";
import CapitalInfo from "@/components/partners/capital/CapitalInfo";
import { PageShell } from "@/components/shared/PageShell";

export default function PartnersPage() {
  const [activeTab, setActiveTab] = useState("list");

  return (
    <PageShell
      title="إدارة الشركاء"
      description="بيانات الشركاء ونسب الملكية ورأس المال"
      icon={Users2}
      actions={
        <Button onClick={() => setActiveTab("new")} className="gap-2">
          <Plus className="h-4 w-4" />
          شريك جديد
        </Button>
      }
    >
      <CapitalInfo />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full sm:w-auto grid-cols-2">
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
    </PageShell>
  );
}
