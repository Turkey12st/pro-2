
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AccountingPage from "./pages/accounting/Index";
import HRPage from "./pages/hr/Index";
import ProjectsPage from "./pages/projects/Index";
import ClientsPage from "./pages/clients/Index";
import PartnersPage from "./pages/partners/Index";
import DashboardPage from "./pages/dashboard/Index";
import FinancialPage from "./pages/financial/Index";
import ZakatPage from "./pages/zakat/Index";
import DocumentsPage from "./pages/documents/Index";
import AppLayout from "./components/AppLayout";
import SettingsPage from "./pages/settings/Index";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route 
              path="/dashboard" 
              element={
                <AppLayout>
                  <DashboardPage />
                </AppLayout>
              } 
            />
            <Route 
              path="/accounting" 
              element={
                <AppLayout>
                  <AccountingPage />
                </AppLayout>
              } 
            />
            <Route 
              path="/hr" 
              element={
                <AppLayout>
                  <HRPage />
                </AppLayout>
              } 
            />
            <Route 
              path="/projects" 
              element={
                <AppLayout>
                  <ProjectsPage />
                </AppLayout>
              } 
            />
            <Route 
              path="/clients" 
              element={
                <AppLayout>
                  <ClientsPage />
                </AppLayout>
              } 
            />
            <Route 
              path="/partners" 
              element={
                <AppLayout>
                  <PartnersPage />
                </AppLayout>
              } 
            />
            <Route 
              path="/financial" 
              element={
                <AppLayout>
                  <FinancialPage />
                </AppLayout>
              } 
            />
            <Route 
              path="/zakat" 
              element={
                <AppLayout>
                  <ZakatPage />
                </AppLayout>
              } 
            />
            <Route 
              path="documents" 
              element={
                <AppLayout>
                  <DocumentsPage />
                </AppLayout>
              } 
            />
            <Route 
              path="settings" 
              element={
                <AppLayout>
                  <SettingsPage />
                </AppLayout>
              } 
            />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
