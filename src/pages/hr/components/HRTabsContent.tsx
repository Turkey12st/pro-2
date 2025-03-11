
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users2, Calculator } from "lucide-react";
import { EmployeeCostCalculator } from "@/components/hr/EmployeeCalculator";
import EmployeeList from "@/components/hr/EmployeeList";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

interface HRTabsContentProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
}

export function HRTabsContent({
  activeTab,
  setActiveTab
}: HRTabsContentProps) {
  const queryClient = new QueryClient();

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="list" className="flex-1">
          <Users2 className="h-4 w-4 mr-2" />
          قائمة الموظفين
        </TabsTrigger>
        <TabsTrigger value="calculator" className="flex-1">
          <Calculator className="h-4 w-4 mr-2" />
          حاسبة التكاليف
        </TabsTrigger>
      </TabsList>
      <TabsContent value="list" className="space-y-4">
        <QueryClientProvider client={queryClient}>
          <EmployeeList />
        </QueryClientProvider>
      </TabsContent>
      <TabsContent value="calculator">
        <EmployeeCostCalculator />
      </TabsContent>
    </Tabs>
  );
}
