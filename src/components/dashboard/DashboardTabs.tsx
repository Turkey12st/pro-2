
import React from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { FinancialSummary } from "@/components/dashboard/FinancialSummary";
import { CashFlowChart } from "@/components/dashboard/CashFlowChart";
import { NotificationsList } from "@/components/dashboard/NotificationsList";
import { SalarySummary } from "@/components/dashboard/SalarySummary";
import { DocumentExpiryNotifications } from "@/components/dashboard/DocumentExpiryNotifications";
import { TabNavigation } from "./tabs/TabNavigation";
import { PerformanceMetrics } from "./tabs/PerformanceMetrics";
import { FinancialSummaryType } from "@/types/database";

interface DashboardTabsProps {
  financialData: FinancialSummaryType;
  salarySummary: {
    total_salaries: number;
    payment_date: string;
    days_remaining: number;
    employees_count: number;
    status: "upcoming" | "overdue" | "paid";
  };
  notifications: Array<{
    id: string;
    title: string;
    message: string;
    type: string;
    date: string;
  }>;
  expiringDocuments: Array<{
    id: string;
    title: string;
    type: string;
    expiry_date: string;
    days_remaining: number;
    status: string;
  }>;
}

export function DashboardTabs({ 
  financialData, 
  salarySummary, 
  notifications, 
  expiringDocuments 
}: DashboardTabsProps) {
  return (
    <Tabs defaultValue="financial" className="w-full">
      <TabNavigation />
      
      <TabsContent value="financial" className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <FinancialSummary data={financialData} />
          <CashFlowChart />
        </div>
      </TabsContent>
      
      <TabsContent value="documents">
        <DocumentExpiryNotifications />
      </TabsContent>
      
      <TabsContent value="salaries">
        <SalarySummary data={salarySummary} />
      </TabsContent>
      
      <TabsContent value="performance" className="space-y-4">
        <PerformanceMetrics financialData={financialData} />
      </TabsContent>
      
      <TabsContent value="notifications">
        <NotificationsList />
      </TabsContent>
    </Tabs>
  );
}
