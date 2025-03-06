
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AppLayout from "@/components/AppLayout";
import { useToast } from "@/hooks/use-toast";
import { Users2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PartnersList from "@/components/partners/PartnersList";
import PartnerForm from "@/components/partners/PartnerForm";
import CapitalInfo from "@/components/partners/CapitalInfo";

export default function PartnersPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("list");

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* العنوان وزر إضافة شريك جديد */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">إدارة الشركاء</h1>
          <Button onClick={() => setActiveTab("new")} className="gap-2">
            <Plus className="h-4 w-4" />
            شريك جديد
          </Button>
        </div>

        {/* معلومات رأس المال */}
        <CapitalInfo />

        {/* الألسنة */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="list">قائمة الشركاء</TabsTrigger>
            <TabsTrigger value="new">شريك جديد</TabsTrigger>
          </TabsList>

          {/* محتوى اللسان الأول: قائمة الشركاء */}
          <TabsContent value="list">
            <PartnersList />
          </TabsContent>

          {/* محتوى اللسان الثاني: نموذج إضافة شريك جديد */}
          <TabsContent value="new">
            <PartnerForm onSuccess={() => setActiveTab("list")} />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
