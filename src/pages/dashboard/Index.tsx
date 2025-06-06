
import React from "react";
import { Container } from "@/components/ui/container";
import { CompanyInfoCard } from "@/components/dashboard/CompanyInfoCard";
import { IntegratedDashboardStats } from "@/components/dashboard/IntegratedDashboardStats";
import DashboardTabs from "@/components/dashboard/DashboardTabs";
import { QuickNavMenu } from "@/components/dashboard/QuickNavMenu";
import { AutoSaveProvider } from "@/components/dashboard/AutoSaveProvider";

export default function DashboardPage() {
  return (
    <AutoSaveProvider>
      <div className="space-y-6 p-4 sm:p-6 md:p-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">لوحة المعلومات المتكاملة</h1>
          <QuickNavMenu />
        </div>

        <IntegratedDashboardStats />

        <div className="grid gap-4 md:grid-cols-12">
          <div className="md:col-span-3">
            <CompanyInfoCard />
          </div>
          
          <div className="md:col-span-9">
            <DashboardTabs />
          </div>
        </div>
      </div>
    </AutoSaveProvider>
  );
}
