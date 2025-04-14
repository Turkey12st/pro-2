
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainPage from "./pages/MainPage";
import DashboardPage from "./pages/dashboard/Index";
import AccountingPage from "./pages/accounting/Index";
import HRPage from "./pages/hr/Index";
import DocumentsPage from "./pages/documents/Index";
import ProjectsPage from "./pages/projects/Index";
import ClientsPage from "./pages/clients/Index";
import CompanyPage from "./pages/company/Index";
import PartnersPage from "./pages/partners/Index";
import SettingsPage from "./pages/settings/Index";
import NotFound from "./pages/NotFound";
import ZakatPage from "./pages/zakat/Index";
import CapitalManagementPage from "./pages/capital/Index";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/accounting" element={<AccountingPage />} />
        <Route path="/capital" element={<CapitalManagementPage />} />
        <Route path="/hr" element={<HRPage />} />
        <Route path="/documents" element={<DocumentsPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/clients" element={<ClientsPage />} />
        <Route path="/company" element={<CompanyPage />} />
        <Route path="/partners" element={<PartnersPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/zakat" element={<ZakatPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
