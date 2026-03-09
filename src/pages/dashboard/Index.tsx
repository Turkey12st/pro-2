import React from "react";
import { useNavigate } from "react-router-dom";
import { QuickNavMenu } from "@/components/dashboard/QuickNavMenu";
import { AutoSaveProvider } from "@/components/dashboard/AutoSaveProvider";
import { IntegratedDashboardStats } from "@/components/dashboard/IntegratedDashboardStats";
import { CompactNotificationsPanel } from "@/components/dashboard/CompactNotificationsPanel";
import { FinancialMetricsCard } from "@/components/dashboard/FinancialMetricsCard";
import { ERPDashboard } from "@/components/dashboard/ERPDashboard";
import { IntegratedKPIWidgets } from "@/components/dashboard/IntegratedKPIWidgets";
import { useRealtimeSync } from "@/hooks/useRealtimeSync";
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

  // تفعيل المزامنة الفورية على الجداول الحرجة
  useRealtimeSync({
    tables: ['employees', 'employee_salaries', 'journal_entries', 'data_sync_log'],
    showNotifications: true,
  });

  // Security enhancement: Safe navigation with route validation
  const handleStatClick = (type: string) => {
    const routes: Record<string, string> = {
      employees: '/hr',
      projects: '/projects',
      documents: '/documents',
      financial: '/financial',
      partners: '/partners',
    };
    const route = routes[type];
    if (route) navigate(route);
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

        <OnboardingBanner showWhenComplete={!onboardingComplete} />

        <div className="space-y-6">
          {/* المؤشرات المترابطة HR → Payroll → Finance */}
          <IntegratedKPIWidgets />

          <IntegratedDashboardStats onStatClick={handleStatClick} />
          <CompactNotificationsPanel />
          <FinancialMetricsCard />
          <ERPDashboard />
        </div>
      </div>
    </AutoSaveProvider>
  );
}