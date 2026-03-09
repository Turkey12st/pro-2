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
import { Building2, Clock } from "lucide-react";

export default function DashboardPage() {
  const navigate = useNavigate();
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

  const currentDate = new Date().toLocaleDateString('ar-SA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const currentTime = new Date().toLocaleTimeString('ar-SA', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <AutoSaveProvider>
      <div className="page-container">
        {/* Premium Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-6 border-b border-border/50">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl gradient-primary shadow-primary flex items-center justify-center animate-bounce-subtle">
              <Building2 className="h-7 w-7 text-primary-foreground" />
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">لوحة التحكم</h1>
              <div className="flex items-center gap-3 text-muted-foreground">
                <p className="text-sm">{currentDate}</p>
                <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                <div className="flex items-center gap-1 text-sm">
                  <Clock className="h-3.5 w-3.5" />
                  {currentTime}
                </div>
              </div>
            </div>
          </div>
          <QuickNavMenu />
        </div>

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
          
          {/* Two Column Layout for Notifications & Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-slide-up stagger-2">
            <section>
              <CompactNotificationsPanel />
            </section>
            <section>
              <FinancialMetricsCard />
            </section>
          </div>
          
          {/* ERP Dashboard - Full Width */}
          <section className="animate-slide-up stagger-3">
            <ERPDashboard />
          </section>
        </div>
      </div>
    </AutoSaveProvider>
  );
}
