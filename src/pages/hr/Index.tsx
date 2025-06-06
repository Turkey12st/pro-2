import { AppLayout } from "@/components/AppLayout";
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
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-6 p-4 sm:p-6">
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
    </AppLayout>
  );
}
