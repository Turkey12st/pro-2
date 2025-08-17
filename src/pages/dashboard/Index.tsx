
import React from "react";
import { useNavigate } from "react-router-dom";
import { Container } from "@/components/ui/container";
import { CompanyInfoCard } from "@/components/dashboard/CompanyInfoCard";
import { ERPDashboard } from "@/components/dashboard/ERPDashboard";
import { QuickNavMenu } from "@/components/dashboard/QuickNavMenu";
import { AutoSaveProvider } from "@/components/dashboard/AutoSaveProvider";
import { IntegratedDashboardStats } from "@/components/dashboard/IntegratedDashboardStats";
import { CompactNotificationsPanel } from "@/components/dashboard/CompactNotificationsPanel";
import { FinancialMetricsCard } from "@/components/dashboard/FinancialMetricsCard";

// Security enhancement: Route validation
const VALID_ROUTES = ['/hr', '/projects', '/documents', '/financial', '/partners'];

const validateRoute = (route: string): boolean => {
  return VALID_ROUTES.includes(route);
};

export default function DashboardPage() {
  const navigate = useNavigate();

  // Security enhancement: Safe navigation with route validation
  const handleStatClick = (type: string) => {
    try {
      let route = '';
      
      switch (type) {
        case 'employees':
          route = '/hr';
          break;
        case 'projects':
          route = '/projects';
          break;
        case 'documents':
          route = '/documents';
          break;
        case 'financial':
          route = '/financial';
          break;
        case 'partners':
          route = '/partners';
          break;
        default:
          console.warn('Invalid navigation type:', type);
          return;
      }

      // Security: Validate route before navigation
      if (validateRoute(route)) {
        navigate(route);
      } else {
        console.error('Attempted to navigate to invalid route:', route);
      }
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  return (
    <AutoSaveProvider>
      <div className="min-h-screen max-w-full mx-auto space-y-4 p-2 sm:p-4">
        <div className="flex justify-end items-center mb-4">
          <QuickNavMenu />
        </div>

        {/* Main Content Area - Single Column Layout */}
        <div className="space-y-4">
          {/* مؤشرات الأداء الأساسية */}
          <div className="w-full">
            <IntegratedDashboardStats onStatClick={handleStatClick} />
          </div>

          {/* لوحة التنبيهات المدمجة */}
          <div className="w-full">
            <CompactNotificationsPanel />
          </div>

          {/* المؤشرات المالية المتقدمة */}
          <div className="w-full">
            <FinancialMetricsCard />
          </div>

          {/* لوحة التحكم الشاملة */}
          <div className="w-full">
            <ERPDashboard />
          </div>
        </div>
      </div>
    </AutoSaveProvider>
  );
}
