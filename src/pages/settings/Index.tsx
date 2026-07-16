
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarClock, Calculator, LineChart, ClipboardList, Settings } from "lucide-react";
import { TaskScheduler } from "@/components/settings/TaskScheduler";
import { LoanCalculator } from "@/components/settings/LoanCalculator";
import { BusinessPlanner } from "@/components/settings/BusinessPlanner";
import { ActivityLog } from "@/components/settings/ActivityLog";
import { APIIntegrationManager } from "@/components/settings/APIIntegrationManager";
import { PageShell } from "@/components/shared/PageShell";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("task-scheduler");

  return (
    <PageShell
      title="الأدوات والإعدادات"
      description="أدوات مساعدة وتكاملات خارجية وإعدادات النظام"
      icon={Settings}
    >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-2 lg:grid-cols-5 h-auto">
            <TabsTrigger value="task-scheduler" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-2">
              <CalendarClock className="h-4 w-4" />
              جدولة المهام
            </TabsTrigger>
            <TabsTrigger value="loan-calculator" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-2">
              <Calculator className="h-4 w-4" />
              حاسبة القروض
            </TabsTrigger>
            <TabsTrigger value="business-planner" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-2">
              <LineChart className="h-4 w-4" />
              مخطط الأعمال
            </TabsTrigger>
            <TabsTrigger value="activity-log" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-2">
              <ClipboardList className="h-4 w-4" />
              سجل الأنشطة
            </TabsTrigger>
            <TabsTrigger value="api-integrations" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-2">
              <Settings className="h-4 w-4" />
              تكاملات API
            </TabsTrigger>
          </TabsList>

          <Card>
            <CardHeader>
              <CardTitle>
                {activeTab === "task-scheduler" && "جدولة المهام"}
                {activeTab === "loan-calculator" && "حاسبة القروض"}
                {activeTab === "business-planner" && "مخطط الأعمال"}
                {activeTab === "activity-log" && "سجل الأنشطة"}
                {activeTab === "api-integrations" && "تكاملات API"}
              </CardTitle>
              <CardDescription>
                {activeTab === "task-scheduler" && "جدولة وإدارة المهام الدورية والتذكيرات"}
                {activeTab === "loan-calculator" && "حساب أقساط القروض والتمويلات"}
                {activeTab === "business-planner" && "تخطيط الأعمال ووضع الأهداف"}
                {activeTab === "activity-log" && "متابعة أنشطة النظام والمستخدمين"}
                {activeTab === "api-integrations" && "إعداد ربط n8n وZapier وWebhooks"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TabsContent value="task-scheduler" className="mt-0">
                <TaskScheduler />
              </TabsContent>
              <TabsContent value="loan-calculator" className="mt-0">
                <LoanCalculator />
              </TabsContent>
              <TabsContent value="business-planner" className="mt-0">
                <BusinessPlanner />
              </TabsContent>
              <TabsContent value="activity-log" className="mt-0">
                <ActivityLog />
              </TabsContent>
              <TabsContent value="api-integrations" className="mt-0">
                <APIIntegrationManager />
              </TabsContent>
            </CardContent>
          </Card>
        </Tabs>
    </PageShell>
  );
}
