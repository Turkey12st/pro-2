
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useEmployeeData() {
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

  return {
    employeesData,
    isLoading,
    error,
    totalEmployees,
    totalSalaries,
    totalGosi,
    newEmployeesCount,
    isDialogOpen,
    setIsDialogOpen,
    activeTab,
    setActiveTab,
    handleExportToExcel
  };
}
