
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarClock, Calculator, LineChart, ClipboardList, Settings } from "lucide-react";
import { TaskScheduler } from "@/components/settings/TaskScheduler";
import { LoanCalculator } from "@/components/settings/LoanCalculator";
import { BusinessPlanner } from "@/components/settings/BusinessPlanner";
import { ActivityLog } from "@/components/settings/ActivityLog";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("task-scheduler");

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center">
          <Settings className="mr-2 h-6 w-6" />
          الأدوات والإعدادات
        </h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-2 lg:grid-cols-4 h-auto">
          <TabsTrigger value="task-scheduler" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-2">
            <CalendarClock className="h-4 w-4 ml-2" />
            جدولة المهام
          </TabsTrigger>
          <TabsTrigger value="loan-calculator" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-2">
            <Calculator className="h-4 w-4 ml-2" />
            حاسبة القروض
          </TabsTrigger>
          <TabsTrigger value="business-planner" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-2">
            <LineChart className="h-4 w-4 ml-2" />
            مخطط الأعمال
          </TabsTrigger>
          <TabsTrigger value="activity-log" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-2">
            <ClipboardList className="h-4 w-4 ml-2" />
            سجل الأنشطة
          </TabsTrigger>
        </TabsList>

        <Card>
          <CardHeader>
            <CardTitle>
              {activeTab === "task-scheduler" && "جدولة المهام"}
              {activeTab === "loan-calculator" && "حاسبة القروض"}
              {activeTab === "business-planner" && "مخطط الأعمال"}
              {activeTab === "activity-log" && "سجل الأنشطة"}
            </CardTitle>
            <CardDescription>
              {activeTab === "task-scheduler" && "جدولة وإدارة المهام الدورية والتذكيرات"}
              {activeTab === "loan-calculator" && "حساب أقساط القروض والتمويلات"}
              {activeTab === "business-planner" && "تخطيط الأعمال ووضع الأهداف"}
              {activeTab === "activity-log" && "متابعة أنشطة النظام والمستخدمين"}
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
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
}
