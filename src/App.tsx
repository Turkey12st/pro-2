import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@/lib/queryClient";
import { GlobalErrorBoundary } from "@/components/shared/GlobalErrorBoundary";

// Pages
import MainPage from "./pages/MainPage";
import DashboardPage from "./pages/dashboard/Index";
import AccountingPage from "./pages/accounting/Index";
import HRPage from "./pages/hr/Index";
import EmployeeProfile from "./pages/hr/EmployeeProfile";
import DocumentsPage from "./pages/documents/Index";
import ProjectsPage from "./pages/projects/Index";
import ClientsPage from "./pages/clients/Index";
import CompanyPage from "./pages/company/Index";
import PartnersPage from "./pages/partners/Index";
import SettingsPage from "./pages/settings/Index";
import AdminPage from "./pages/admin/Index";
import NotFound from "./pages/NotFound";
import CapitalManagementPage from "./pages/capital/Index";
import CalendarPage from "./pages/calendar/Index";
import FinancialPage from "./pages/financial/Index";
import ProjectDetails from "./pages/projects/ProjectDetails";

function App() {
  return (
    <GlobalErrorBoundary>
      <QueryClientProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Default route redirects to Main page */}
              <Route path="/" element={<Navigate to="/main" replace />} />
              <Route path="/main" element={<MainPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/accounting" element={<AccountingPage />} />
              <Route path="/financial" element={<FinancialPage />} />
              <Route path="/capital" element={<CapitalManagementPage />} />
              <Route path="/hr" element={<HRPage />} />
              <Route path="/hr/employee/:id" element={<EmployeeProfile />} />
              <Route path="/documents" element={<DocumentsPage />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/projects/:id" element={<ProjectDetails />} />
              <Route path="/clients" element={<ClientsPage />} />
              <Route path="/company" element={<CompanyPage />} />
              <Route path="/partners" element={<PartnersPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </GlobalErrorBoundary>
  );
}

export default App;
