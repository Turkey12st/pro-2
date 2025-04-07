
import React from "react";
import { FinancialSummary } from "@/components/dashboard/FinancialSummary";
import { FinancialChart } from "@/components/dashboard/FinancialChart";
import { CashFlowChart } from "@/components/dashboard/CashFlowChart";
import { NotificationsList } from "@/components/dashboard/NotificationsList";
import { SalarySummary } from "@/components/dashboard/SalarySummary";
import { DocumentExpiryNotifications } from "@/components/dashboard/DocumentExpiryNotifications";
import { PerformanceTab } from "@/components/dashboard/tabs/PerformanceTab";
import { FinancialSummaryType, SalarySummary as SalarySummaryType } from "@/types/database";

interface TabContentsProps {
  activeTab: string;
  financialData: FinancialSummaryType;
  salarySummary: SalarySummaryType;
}

export function TabContents({ activeTab, financialData, salarySummary }: TabContentsProps) {
  switch (activeTab) {
    case "financial":
      return (
        <div className="space-y-4">
          <FinancialSummary data={financialData} />
          <div className="grid gap-4 md:grid-cols-2">
            <FinancialChart />
            <CashFlowChart />
          </div>
        </div>
      );
    
    case "documents":
      return <DocumentExpiryNotifications />;
    
    case "salaries":
      return <SalarySummary data={salarySummary} />;
    
    case "performance":
      return <PerformanceTab financialData={financialData} />;
    
    case "notifications":
      return <NotificationsList />;
    
    default:
      return <div>No content available</div>;
  }
}
