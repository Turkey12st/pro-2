import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@/lib/queryClient";
import { GlobalErrorBoundary } from "@/components/shared/GlobalErrorBoundary";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import AppLayout from "@/components/AppLayout";

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
import ResetPasswordPage from "./pages/auth/ResetPassword";
import AccountPage from "./pages/account/Index";
import UnauthorizedPage from "./pages/Unauthorized";
import BankReconciliationPage from "./pages/bank-reconciliation/Index";

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
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/auth" element={<LoginPage />} />
              <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
              <Route path="/unauthorized" element={<UnauthorizedPage />} />
              
              {/* Protected routes with AppLayout */}
              <Route path="/main" element={<ProtectedRoute><AppLayout><MainPage /></AppLayout></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><AppLayout><DashboardPage /></AppLayout></ProtectedRoute>} />
              <Route path="/accounting" element={<ProtectedRoute><AppLayout><AccountingPage /></AppLayout></ProtectedRoute>} />
              <Route path="/financial" element={<ProtectedRoute><AppLayout><FinancialPage /></AppLayout></ProtectedRoute>} />
              <Route path="/bank-reconciliation" element={<ProtectedRoute><AppLayout><BankReconciliationPage /></AppLayout></ProtectedRoute>} />
              <Route path="/capital" element={<ProtectedRoute><AppLayout><CapitalManagementPage /></AppLayout></ProtectedRoute>} />
              <Route path="/hr" element={<ProtectedRoute><AppLayout><HRPage /></AppLayout></ProtectedRoute>} />
              <Route path="/hr/employee/:id" element={<ProtectedRoute><AppLayout><EmployeeProfile /></AppLayout></ProtectedRoute>} />
              <Route path="/documents" element={<ProtectedRoute><AppLayout><DocumentsPage /></AppLayout></ProtectedRoute>} />
              <Route path="/projects" element={<ProtectedRoute><AppLayout><ProjectsPage /></AppLayout></ProtectedRoute>} />
              <Route path="/projects/:id" element={<ProtectedRoute><AppLayout><ProjectDetails /></AppLayout></ProtectedRoute>} />
              <Route path="/clients" element={<ProtectedRoute><AppLayout><ClientsPage /></AppLayout></ProtectedRoute>} />
              <Route path="/company" element={<ProtectedRoute><AppLayout><CompanyPage /></AppLayout></ProtectedRoute>} />
              <Route path="/partners" element={<ProtectedRoute><AppLayout><PartnersPage /></AppLayout></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><AppLayout><SettingsPage /></AppLayout></ProtectedRoute>} />
              <Route path="/calendar" element={<ProtectedRoute><AppLayout><CalendarPage /></AppLayout></ProtectedRoute>} />
              <Route path="/account" element={<ProtectedRoute><AppLayout><AccountPage /></AppLayout></ProtectedRoute>} />
              
              {/* Admin only routes */}
              <Route path="/admin" element={
                <ProtectedRoute requiredRoles={['admin']}>
                  <AppLayout><AdminPage /></AppLayout>
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
