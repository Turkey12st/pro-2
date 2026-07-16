import React from "react";
import { useNavigate } from "react-router-dom";
import { AutoSaveProvider } from "@/components/dashboard/AutoSaveProvider";
import { IntegratedDashboardStats } from "@/components/dashboard/IntegratedDashboardStats";
import { CompactNotificationsPanel } from "@/components/dashboard/CompactNotificationsPanel";
import { FinancialMetricsCard } from "@/components/dashboard/FinancialMetricsCard";
import { ERPDashboard } from "@/components/dashboard/ERPDashboard";
import { IntegratedKPIWidgets } from "@/components/dashboard/IntegratedKPIWidgets";
import { useRealtimeSync } from "@/hooks/useRealtimeSync";
import { OnboardingBanner } from "@/components/onboarding/OnboardingBanner";
import { useOnboardingStatus } from "@/hooks/useOnboardingStatus";
import { LayoutDashboard } from "lucide-react";
import { PageShell } from "@/components/shared/PageShell";
import { useTranslation } from "react-i18next";
import { CashFlowChart } from "@/components/dashboard/CashFlowChart";
import { useLanguage } from "@/contexts/LanguageContext";

export default function DashboardPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { isComplete: onboardingComplete, loading: onboardingLoading } = useOnboardingStatus();

  useRealtimeSync({
    tables: ['employees', 'employee_salaries', 'journal_entries', 'data_sync_log'],
    showNotifications: true,
  });

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

  const currentDate = new Date().toLocaleDateString(language === "ar" ? "ar-SA" : "en-US", {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <AutoSaveProvider>
      <PageShell
        title={t("pages.dashboard.title")}
        description={currentDate}
        icon={LayoutDashboard}
      >
        <OnboardingBanner showWhenComplete={!onboardingComplete} />

        <div className="space-y-8">
          {/* KPI Widgets - Premium Design */}
          <section className="animate-slide-up">
            <IntegratedKPIWidgets />
          </section>
          
          {/* Dashboard Stats */}
          <section className="animate-slide-up stagger-1">
            <IntegratedDashboardStats onStatClick={handleStatClick} />
          </section>

          {/* Cash Flow Chart — main financial visual */}
          <section className="animate-slide-up stagger-2">
            <CashFlowChart />
          </section>

          {/* Two Column Layout for Notifications & Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-slide-up stagger-3">
            <section>
              <CompactNotificationsPanel />
            </section>
            <section>
              <FinancialMetricsCard />
            </section>
          </div>
          
          {/* ERP Dashboard - Full Width */}
          <section className="animate-slide-up stagger-4">
            <ERPDashboard />
          </section>
        </div>
      </PageShell>
    </AutoSaveProvider>
  );
}
