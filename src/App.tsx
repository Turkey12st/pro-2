
import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './components/ThemeProvider';
import { Toaster } from './components/ui/toaster';

// Main pages
import DashboardPage from './pages/dashboard/Index';
import HRPage from './pages/hr/Index';
import CompanyPage from './pages/company/Index';
import AccountingPage from './pages/accounting/Index';
import PartnersPage from './pages/partners/Index';
import ProjectsPage from './pages/projects/Index';
import ClientsPage from './pages/clients/Index';
import DocumentsPage from './pages/documents/Index';
import ZakatPage from './pages/zakat/Index';
import NotFoundPage from './pages/NotFound';
import HomePage from './pages/Index';
import SettingsPage from './pages/settings/Index';
import FinancialPage from './pages/financial/Index';
import CapitalPage from './pages/capital/Index';
import CalendarPage from './pages/calendar/Index';
import PayrollPage from './pages/payroll/Index';

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/hr" element={<HRPage />} />
            <Route path="/company" element={<CompanyPage />} />
            <Route path="/accounting" element={<AccountingPage />} />
            <Route path="/partners" element={<PartnersPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/clients" element={<ClientsPage />} />
            <Route path="/documents" element={<DocumentsPage />} />
            <Route path="/zakat" element={<ZakatPage />} />
            <Route path="/financial" element={<FinancialPage />} />
            <Route path="/capital" element={<CapitalPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/payroll" element={<PayrollPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
          <Toaster />
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
