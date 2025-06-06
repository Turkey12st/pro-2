
import React from "react";
import { Container } from "@/components/ui/container";
import { CompanyInfoCard } from "@/components/dashboard/CompanyInfoCard";
import { ERPDashboard } from "@/components/dashboard/ERPDashboard";
import { QuickNavMenu } from "@/components/dashboard/QuickNavMenu";
import { AutoSaveProvider } from "@/components/dashboard/AutoSaveProvider";

export default function DashboardPage() {
  return (
    <AutoSaveProvider>
      <div className="space-y-6 p-4 sm:p-6 md:p-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">لوحة التحكم المتكاملة</h1>
            <p className="text-muted-foreground">نظام ERP شامل لإدارة الأعمال</p>
          </div>
          <QuickNavMenu />
        </div>

        <ERPDashboard />
      </div>
    </AutoSaveProvider>
  );
}
