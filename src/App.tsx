import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@/lib/queryClient";
import { GlobalErrorBoundary } from "@/components/shared/GlobalErrorBoundary";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

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
import LoginPage from "./pages/auth/Login";
import UnauthorizedPage from "./pages/Unauthorized";

function App() {
  return (
    <GlobalErrorBoundary>
      <QueryClientProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Navigate to="/main" replace />} />
              <Route path="/main" element={<MainPage />} />
              <Route path="/auth" element={<LoginPage />} />
              <Route path="/unauthorized" element={<UnauthorizedPage />} />
              
              {/* Protected routes */}
              <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
              <Route path="/accounting" element={<ProtectedRoute><AccountingPage /></ProtectedRoute>} />
              <Route path="/financial" element={<ProtectedRoute><FinancialPage /></ProtectedRoute>} />
              <Route path="/capital" element={<ProtectedRoute><CapitalManagementPage /></ProtectedRoute>} />
              <Route path="/hr" element={<ProtectedRoute><HRPage /></ProtectedRoute>} />
              <Route path="/hr/employee/:id" element={<ProtectedRoute><EmployeeProfile /></ProtectedRoute>} />
              <Route path="/documents" element={<ProtectedRoute><DocumentsPage /></ProtectedRoute>} />
              <Route path="/projects" element={<ProtectedRoute><ProjectsPage /></ProtectedRoute>} />
              <Route path="/projects/:id" element={<ProtectedRoute><ProjectDetails /></ProtectedRoute>} />
              <Route path="/clients" element={<ProtectedRoute><ClientsPage /></ProtectedRoute>} />
              <Route path="/company" element={<ProtectedRoute><CompanyPage /></ProtectedRoute>} />
              <Route path="/partners" element={<ProtectedRoute><PartnersPage /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
              <Route path="/calendar" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
              
              {/* Admin only routes */}
              <Route path="/admin" element={
                <ProtectedRoute requiredRoles={['admin']}>
                  <AdminPage />
                </ProtectedRoute>
              } />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </GlobalErrorBoundary>
  );
}

export default App;
