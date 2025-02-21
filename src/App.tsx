
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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/accounting" element={<AccountingPage />} />
          <Route path="/hr" element={<HRPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/clients" element={<ClientsPage />} />
          <Route path="/partners" element={<PartnersPage />} />
          <Route path="/financial" element={<FinancialPage />} />
          <Route path="/zakat" element={<ZakatPage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
