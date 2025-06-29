
import React from "react";
import { Container } from "@/components/ui/container";
import { CompanyInfoCard } from "@/components/dashboard/CompanyInfoCard";
import { ERPDashboard } from "@/components/dashboard/ERPDashboard";
import { QuickNavMenu } from "@/components/dashboard/QuickNavMenu";
import { AutoSaveProvider } from "@/components/dashboard/AutoSaveProvider";
import { IntegratedDashboardStats } from "@/components/dashboard/IntegratedDashboardStats";

export default function DashboardPage() {
  return (
    <AutoSaveProvider>
      <div className="min-h-screen max-w-full mx-auto space-y-4 p-2 sm:p-4 md:p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">لوحة التحكم المتكاملة</h1>
            <p className="text-sm text-muted-foreground">نظام ERP شامل لإدارة الأعمال</p>
          </div>
          <QuickNavMenu />
        </div>

        {/* مؤشرات الأداء الأساسية - مضغوطة */}
        <div className="w-full">
          <IntegratedDashboardStats />
        </div>

        {/* لوحة التحكم الشاملة - عرض كامل */}
        <div className="w-full">
          <ERPDashboard />
        </div>
      </div>
    </AutoSaveProvider>
  );
}
