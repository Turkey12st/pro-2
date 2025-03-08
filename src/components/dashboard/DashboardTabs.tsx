
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FinancialSummary } from "@/components/dashboard/FinancialSummary";
import { FinancialChart } from "@/components/dashboard/FinancialChart";
import { CashFlowChart } from "@/components/dashboard/CashFlowChart";
import { NotificationsList } from "@/components/dashboard/NotificationsList";
import { SalarySummary } from "@/components/dashboard/SalarySummary";
import { DocumentExpiryNotifications } from "@/components/dashboard/DocumentExpiryNotifications";
import { 
  BarChart4, 
  FileText,
  Wallet,
  BellIcon
} from "lucide-react";

interface DashboardTabsProps {
  financialData: {
    total_income: number;
    total_expenses: number;
    net_profit: number;
    profit_margin: number;
  };
  salarySummary: {
    total_salaries: number;
    payment_date: string;
    days_remaining: number;
    employees_count: number;
    status: string;
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

export function DashboardTabs({ financialData, salarySummary, notifications, expiringDocuments }: DashboardTabsProps) {
  return (
    <Tabs defaultValue="financial" className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="financial" className="flex items-center space-x-2 space-x-reverse">
          <BarChart4 className="h-4 w-4 ml-2" />
          <span>الملخص المالي</span>
        </TabsTrigger>
        <TabsTrigger value="documents" className="flex items-center space-x-2 space-x-reverse">
          <FileText className="h-4 w-4 ml-2" />
          <span>المستندات</span>
        </TabsTrigger>
        <TabsTrigger value="salaries" className="flex items-center space-x-2 space-x-reverse">
          <Wallet className="h-4 w-4 ml-2" />
          <span>الرواتب</span>
        </TabsTrigger>
        <TabsTrigger value="notifications" className="flex items-center space-x-2 space-x-reverse">
          <BellIcon className="h-4 w-4 ml-2" />
          <span>الإشعارات</span>
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="financial" className="space-y-4">
        <FinancialSummary data={financialData} />
        <div className="grid gap-4 md:grid-cols-2">
          <FinancialChart />
          <CashFlowChart />
        </div>
      </TabsContent>
      
      <TabsContent value="documents">
        <DocumentExpiryNotifications />
      </TabsContent>
      
      <TabsContent value="salaries">
        <SalarySummary data={salarySummary} />
      </TabsContent>
      
      <TabsContent value="notifications">
        <NotificationsList />
      </TabsContent>
    </Tabs>
  );
}
