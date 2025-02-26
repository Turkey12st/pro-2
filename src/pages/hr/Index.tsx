
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AppLayout from "@/components/AppLayout";
import { Users2, Plus, FileText, Download, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import EmployeeList from "@/components/hr/EmployeeList";
import EmployeeForm from "@/components/hr/EmployeeForm";
import { EmployeeCostCalculator } from "@/components/hr/EmployeeCalculator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const queryClient = new QueryClient();

function formatNumber(num: number) {
  return new Intl.NumberFormat('ar-SA').format(num);
}

export default function HRPage() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("list");

  const { data: employeesData, isLoading, error } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employees")
        .select("*");
      
      if (error) {
        console.error("Error fetching employees:", error);
        toast({
          title: "خطأ في جلب البيانات",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
      return data;
    },
  });

  // حساب إجمالي الرواتب والتأمينات
  const totalEmployees = employeesData?.length || 0;
  const totalSalaries = employeesData?.reduce((sum, emp) => 
    sum + (emp.salary || 0), 0) || 0;
  const totalGosi = employeesData?.reduce((sum, emp) => 
    sum + (emp.employee_gosi_contribution || 0) + (emp.company_gosi_contribution || 0), 0) || 0;

  // حساب الموظفين الجدد هذا الشهر
  const currentMonth = new Date().getMonth();
  const newEmployeesCount = employeesData?.filter(emp => {
    const employeeMonth = new Date(emp.created_at).getMonth();
    return employeeMonth === currentMonth;
  }).length || 0;

  if (error) {
    toast({
      title: "خطأ في تحميل البيانات",
      description: "حدث خطأ أثناء محاولة تحميل بيانات الموظفين",
      variant: "destructive",
    });
  }

  const handleExportToExcel = async () => {
    try {
      const { data, error } = await supabase
        .from("employees")
        .select("*");
      
      if (error) throw error;

      // تحويل البيانات إلى صيغة CSV
      const csvContent = "data:text/csv;charset=utf-8," + 
        Object.keys(data[0]).join(",") + "\n" +
        data.map(row => Object.values(row).join(",")).join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "employees.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "تم التصدير بنجاح",
        description: "تم تصدير بيانات الموظفين بنجاح",
      });
    } catch (error) {
      console.error("Error exporting data:", error);
      toast({
        title: "خطأ في التصدير",
        description: "حدث خطأ أثناء محاولة تصدير البيانات",
        variant: "destructive",
      });
    }
  };

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-6 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold">الموارد البشرية</h1>
            <p className="text-muted-foreground">
              إدارة الموظفين، الرواتب، والتكاليف
            </p>
          </div>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2 flex-1 sm:flex-none">
                  <Plus className="h-4 w-4" />
                  إضافة موظف
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>إضافة موظف جديد</DialogTitle>
                  <DialogDescription>
                    قم بإدخال معلومات الموظف الجديد. جميع الحقول مطلوبة.
                  </DialogDescription>
                </DialogHeader>
                <EmployeeForm onSuccess={() => setIsDialogOpen(false)} />
              </DialogContent>
            </Dialog>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-2 flex-1 sm:flex-none"
              onClick={handleExportToExcel}
            >
              <FileText className="h-4 w-4" />
              تصدير إلى Excel
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-2 flex-1 sm:flex-none"
            >
              <Download className="h-4 w-4" />
              استيراد من Excel
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي الموظفين</CardTitle>
              <Users2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalEmployees}</div>
              <p className="text-xs text-muted-foreground">
                +{newEmployeesCount} موظف جديد هذا الشهر
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي الرواتب</CardTitle>
              <Calculator className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(totalSalaries)} ريال</div>
              <p className="text-xs text-muted-foreground">
                تم تحديث التكاليف آخر مرة اليوم
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">التأمينات الاجتماعية</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(totalGosi)} ريال</div>
              <p className="text-xs text-muted-foreground">
                مستحقات التأمينات الشهرية
              </p>
            </CardContent>
          </Card>
        </div>

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
      </div>
    </AppLayout>
  );
}
