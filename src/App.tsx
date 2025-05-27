
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import NotFound from "./pages/NotFound";
import CapitalManagementPage from "./pages/capital/Index";
import CalendarPage from "./pages/calendar/Index";
import FinancialPage from "./pages/financial/Index";
import ProjectDetails from "./pages/projects/ProjectDetails";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPage />} />
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
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
