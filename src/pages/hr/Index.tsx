import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { HRPageHeader } from "./components/HRPageHeader";
import { HRDashboardCards } from "./components/HRDashboardCards";
import { HRTabsContent } from "./components/HRTabsContent";
import { useEmployeeData } from "./hooks/useEmployeeData";

const queryClient = new QueryClient();

export default function HRPage() {
  const {
    totalEmployees,
    totalSalaries,
    totalGosi,
    newEmployeesCount,
    isDialogOpen,
    setIsDialogOpen,
    activeTab,
    setActiveTab,
    handleExportToExcel
  } = useEmployeeData();

  return (
    <div className="page-container">
      <HRPageHeader
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        handleExportToExcel={handleExportToExcel}
      />

      <HRDashboardCards
        totalEmployees={totalEmployees}
        newEmployeesCount={newEmployeesCount}
        totalSalaries={totalSalaries}
        totalGosi={totalGosi}
      />

      <HRTabsContent
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
    </div>
  );
}
