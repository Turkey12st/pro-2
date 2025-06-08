
import React from "react";
import { Routes, Route } from "react-router-dom";
import { AppNavigation } from "@/components/AppNavigation";

// استيراد الصفحات
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
  // مستخدم وهمي للوصول للنظام أثناء الإصلاحات
  const mockUser = {
    id: 'temp-user',
    email: 'admin@company.com',
    user_metadata: {
      full_name: 'مسؤول النظام'
    }
  };

  // معالج وهمي لتسجيل الخروج
  const handleSignOut = () => {
    console.log('تسجيل الخروج معطل مؤقتاً');
  };

  // التخطيط الرئيسي للتطبيق بدون حماية
  return (
    <div className="min-h-screen bg-gray-50">
      <AppNavigation user={mockUser} onSignOut={handleSignOut} />
      <main className="lg:pl-72">
        <div className="min-h-screen">
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
        </div>
      </main>
    </div>
  );
}
