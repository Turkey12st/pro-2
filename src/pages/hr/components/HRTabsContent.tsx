
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users2, Calculator } from "lucide-react";
import { EmployeeCostCalculator } from "@/components/hr/EmployeeCalculator";
import EnhancedEmployeeList from "@/components/hr/EnhancedEmployeeList";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

interface HRTabsContentProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
}

const queryClient = new QueryClient();

export function HRTabsContent({
  activeTab,
  setActiveTab
}: HRTabsContentProps) {
  return (
    <div className="section-card">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 p-1 bg-muted/50">
          <TabsTrigger 
            value="list" 
            className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <Users2 className="h-4 w-4" />
            قائمة الموظفين
          </TabsTrigger>
          <TabsTrigger 
            value="calculator" 
            className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <Calculator className="h-4 w-4" />
            حاسبة التكاليف
          </TabsTrigger>
        </TabsList>
        <TabsContent value="list" className="space-y-4 animate-in">
          <QueryClientProvider client={queryClient}>
            <EnhancedEmployeeList />
          </QueryClientProvider>
        </TabsContent>
        <TabsContent value="calculator" className="animate-in">
          <EmployeeCostCalculator />
        </TabsContent>
      </Tabs>
    </div>
  );
}
