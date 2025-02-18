
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AccountingPage from "./pages/accounting/Index";
import HRPage from "./pages/hr/Index";
import ProjectsPage from "./pages/projects/Index";
import ClientsPage from "./pages/clients/Index";
import DashboardPage from "./pages/dashboard/Index";
import FinancialPage from "./pages/financial/Index";
import ZakatPage from "./pages/zakat/Index";
import LoginPage from "./pages/auth/Login";
import { PrivateRoute } from "./components/auth/PrivateRoute";

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
          {/* جعل صفحة تسجيل الدخول هي الصفحة الرئيسية */}
          <Route path="/" element={<Navigate to="/auth/login" replace />} />
          <Route path="/auth/login" element={<LoginPage />} />
          
          {/* الصفحات المحمية التي تتطلب تسجيل الدخول */}
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/accounting" element={<AccountingPage />} />
            <Route path="/hr" element={<HRPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/clients" element={<ClientsPage />} />
            <Route path="/financial" element={<FinancialPage />} />
            <Route path="/zakat" element={<ZakatPage />} />
          </Route>

          {/* صفحة 404 */}
          <Route path="*" element={<Navigate to="/auth/login" replace />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
