
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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="min-w-0 space-y-4">
          <div className="overflow-x-auto pb-1">
            <TabsList className="flex h-auto min-w-max rounded-xl">
            <TabsTrigger value="task-scheduler" className="gap-2 px-3 py-2.5 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground sm:px-4 sm:text-sm">
              <CalendarClock className="h-4 w-4" />
              جدولة المهام
            </TabsTrigger>
            <TabsTrigger value="loan-calculator" className="gap-2 px-3 py-2.5 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground sm:px-4 sm:text-sm">
              <Calculator className="h-4 w-4" />
              حاسبة القروض
            </TabsTrigger>
            <TabsTrigger value="business-planner" className="gap-2 px-3 py-2.5 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground sm:px-4 sm:text-sm">
              <LineChart className="h-4 w-4" />
              مخطط الأعمال
            </TabsTrigger>
            <TabsTrigger value="activity-log" className="gap-2 px-3 py-2.5 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground sm:px-4 sm:text-sm">
              <ClipboardList className="h-4 w-4" />
              سجل الأنشطة
            </TabsTrigger>
            <TabsTrigger value="api-integrations" className="gap-2 px-3 py-2.5 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground sm:px-4 sm:text-sm">
              <Settings className="h-4 w-4" />
              تكاملات API
            </TabsTrigger>
            </TabsList>
          </div>

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
