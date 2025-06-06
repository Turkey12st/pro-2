
import React, { useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { AppNavigation } from "@/components/AppNavigation";
import { supabase } from "@/integrations/supabase/client";

// Import pages
import DashboardPage from "@/pages/dashboard/Index";
import HRPage from "@/pages/hr/Index";
import AccountingPage from "@/pages/accounting/Index";
import ProjectsPage from "@/pages/projects/Index";
import ClientsPage from "@/pages/clients/Index";
import PartnersPage from "@/pages/partners/Index";
import CapitalPage from "@/pages/capital/Index";
import DocumentsPage from "@/pages/documents/Index";
import FinancialPage from "@/pages/financial/Index";
import SettingsPage from "@/pages/settings/Index";
import CompanyPage from "@/pages/company/Index";
import CalendarPage from "@/pages/calendar/Index";
import ProjectDetails from "@/pages/projects/ProjectDetails";
import EmployeeProfile from "@/pages/hr/EmployeeProfile";
import AccountingIntegration from "@/pages/hr/AccountingIntegration";

export function AppLayout() {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
      }
    };

    checkAuth();

    // مراقبة تغيير حالة المصادقة
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate('/auth');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50">
      <AppNavigation />
      <main className="lg:pl-72">
        <Routes>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/hr" element={<HRPage />} />
          <Route path="/hr/employee/:id" element={<EmployeeProfile />} />
          <Route path="/hr/accounting-integration" element={<AccountingIntegration />} />
          <Route path="/accounting" element={<AccountingPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:id" element={<ProjectDetails />} />
          <Route path="/clients" element={<ClientsPage />} />
          <Route path="/partners" element={<PartnersPage />} />
          <Route path="/capital" element={<CapitalPage />} />
          <Route path="/documents" element={<DocumentsPage />} />
          <Route path="/financial" element={<FinancialPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/company" element={<CompanyPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
        </Routes>
      </main>
    </div>
  );
}
