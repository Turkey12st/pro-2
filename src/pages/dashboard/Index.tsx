
import React from "react";
import { useNavigate } from "react-router-dom";
import { Container } from "@/components/ui/container";
import { CompanyInfoCard } from "@/components/dashboard/CompanyInfoCard";
import { ERPDashboard } from "@/components/dashboard/ERPDashboard";
import { QuickNavMenu } from "@/components/dashboard/QuickNavMenu";
import { AutoSaveProvider } from "@/components/dashboard/AutoSaveProvider";
import { IntegratedDashboardStats } from "@/components/dashboard/IntegratedDashboardStats";
import { CompactNotificationsPanel } from "@/components/dashboard/CompactNotificationsPanel";

export default function DashboardPage() {
  const navigate = useNavigate();

  const handleStatClick = (type: string) => {
    switch (type) {
      case 'employees':
        navigate('/hr');
        break;
      case 'projects':
        navigate('/projects');
        break;
      case 'documents':
        navigate('/documents');
        break;
      case 'financial':
        navigate('/financial');
        break;
      case 'partners':
        navigate('/partners');
        break;
      default:
        break;
    }
  };

  return (
    <AutoSaveProvider>
      <div className="min-h-screen max-w-full mx-auto space-y-4 p-2 sm:p-4">
        <div className="flex justify-end items-center mb-4">
          <QuickNavMenu />
        </div>

        {/* Layout with main content and sidebar notifications */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Main Content Area */}
          <div className="col-span-1 lg:col-span-3 space-y-4">
            {/* مؤشرات الأداء الأساسية */}
            <div className="w-full">
              <IntegratedDashboardStats onStatClick={handleStatClick} />
            </div>

            {/* لوحة التحكم الشاملة */}
            <div className="w-full">
              <ERPDashboard />
            </div>
          </div>

          {/* Compact Notifications Sidebar */}
          <div className="col-span-1">
            <CompactNotificationsPanel />
          </div>
        </div>
      </div>
    </AutoSaveProvider>
  );
}
