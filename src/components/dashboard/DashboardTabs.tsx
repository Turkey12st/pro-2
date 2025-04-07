
import React from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { TabsList } from "./tabs/TabsList";
import { TabContents } from "./tabs/TabContents";
import { FinancialSummaryType, SalarySummary as SalarySummaryType } from "@/types/database";

interface DashboardTabsProps {
  financialData: FinancialSummaryType;
  salarySummary: SalarySummaryType;
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
      <TabsList />
      
      <TabsContent value="financial">
        <TabContents 
          activeTab="financial"
          financialData={financialData}
          salarySummary={salarySummary}
        />
      </TabsContent>
      
      <TabsContent value="documents">
        <TabContents 
          activeTab="documents"
          financialData={financialData}
          salarySummary={salarySummary}
        />
      </TabsContent>
      
      <TabsContent value="salaries">
        <TabContents 
          activeTab="salaries"
          financialData={financialData}
          salarySummary={salarySummary}
        />
      </TabsContent>
      
      <TabsContent value="performance">
        <TabContents 
          activeTab="performance"
          financialData={financialData}
          salarySummary={salarySummary}
        />
      </TabsContent>
      
      <TabsContent value="notifications">
        <TabContents 
          activeTab="notifications"
          financialData={financialData}
          salarySummary={salarySummary}
        />
      </TabsContent>
    </Tabs>
  );
}
