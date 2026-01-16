import React from "react";
import { useNavigate } from "react-router-dom";
import { QuickNavMenu } from "@/components/dashboard/QuickNavMenu";
import { AutoSaveProvider } from "@/components/dashboard/AutoSaveProvider";
import { IntegratedDashboardStats } from "@/components/dashboard/IntegratedDashboardStats";
import { CompactNotificationsPanel } from "@/components/dashboard/CompactNotificationsPanel";
import { FinancialMetricsCard } from "@/components/dashboard/FinancialMetricsCard";
import { ERPDashboard } from "@/components/dashboard/ERPDashboard";
import { OnboardingBanner } from "@/components/onboarding/OnboardingBanner";
import { useOnboardingStatus } from "@/hooks/useOnboardingStatus";

// Security enhancement: Route validation
const VALID_ROUTES = ['/hr', '/projects', '/documents', '/financial', '/partners'];

const validateRoute = (route: string): boolean => {
  return VALID_ROUTES.includes(route);
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const { isComplete: onboardingComplete, loading: onboardingLoading } = useOnboardingStatus();

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
      <div className="page-container">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <h1 className="page-title">لوحة التحكم</h1>
            <p className="page-description">نظرة شاملة على أداء المنشأة</p>
          </div>
          <QuickNavMenu />
        </div>

        {/* نظام الإرشاد للتفعيل الصحيح */}
        <OnboardingBanner showWhenComplete={!onboardingComplete} />

        {/* Main Content Area */}
        <div className="space-y-6">
          {/* مؤشرات الأداء الأساسية */}
          <IntegratedDashboardStats onStatClick={handleStatClick} />

          {/* لوحة التنبيهات المدمجة */}
          <CompactNotificationsPanel />

          {/* المؤشرات المالية المتقدمة */}
          <FinancialMetricsCard />

          {/* لوحة التحكم الشاملة */}
          <ERPDashboard />
        </div>
      </div>
    </AutoSaveProvider>
  );
}