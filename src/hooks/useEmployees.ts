
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useEmployees = () => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = employees.filter(emp => 
        emp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.identity_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.nationality?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredEmployees(filtered);
    } else {
      setFilteredEmployees(employees);
    }
  }, [searchTerm, employees]);

  const fetchEmployees = async () => {
    try {
      setIsLoading(true);
      
      // جلب الموظفين مع البيانات المرتبطة
      const { data, error } = await supabase
        .from("employees")
        .select(`
          *,
          employee_accounts (
            id,
            account_number,
            account_name,
            balance
          ),
          employee_performance (
            performance_score,
            attendance_rate
          ),
          project_employee_assignments (
            id,
            project_id,
            role_in_project,
            projects (
              title,
              status
            )
          )
        `);
      
      if (error) throw error;
      
      // معالجة البيانات لضمان التكامل
      const processedEmployees = data?.map(emp => ({
        ...emp,
        // حساب الأداء المتكامل
        integrated_performance: {
          score: emp.employee_performance?.[0]?.performance_score || 0,
          attendance: emp.employee_performance?.[0]?.attendance_rate || 100,
          projects_count: emp.project_employee_assignments?.length || 0,
          accounts_count: emp.employee_accounts?.length || 0
        },
        // حساب التكاليف المحاسبية
        financial_summary: {
          salary: emp.salary || 0,
          gosi_total: (emp.employee_gosi_contribution || 0) + (emp.company_gosi_contribution || 0),
          total_cost: (emp.salary || 0) + (emp.company_gosi_contribution || 0) + (emp.medical_insurance_cost || 0)
        }
      })) || [];
      
      setEmployees(processedEmployees);
      setFilteredEmployees(processedEmployees);
      
    } catch (error) {
      console.error("Error fetching employees:", error);
      toast({
        title: "خطأ في جلب البيانات",
        description: "حدث خطأ أثناء محاولة جلب بيانات الموظفين المتكاملة.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addEmployee = async (employeeData: any) => {
    try {
      const { data, error } = await supabase
        .from("employees")
        .insert([{
          ...employeeData,
          // ضمان وجود البيانات المطلوبة للربط المحاسبي
          employment_number: employeeData.employment_number || `EMP${Date.now()}`,
          employee_type: employeeData.employee_type || 'saudi',
          base_salary: employeeData.base_salary || employeeData.salary || 0,
          housing_allowance: employeeData.housing_allowance || 0,
          transportation_allowance: employeeData.transportation_allowance || 0
        }])
        .select();
      
      if (error) throw error;
      
      toast({
        title: "تمت الإضافة بنجاح",
        description: "تم إنشاء الموظف والحسابات المحاسبية تلقائياً",
      });
      
      // إعادة جلب البيانات لضمان التحديث المتكامل
      await fetchEmployees();
      return data;
    } catch (error) {
      console.error("Error adding employee:", error);
      toast({
        title: "خطأ في إضافة الموظف",
        description: "حدث خطأ أثناء محاولة إضافة الموظف.",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateEmployee = async (id: string, employeeData: any) => {
    try {
      const { data, error } = await supabase
        .from("employees")
        .update(employeeData)
        .eq("id", id)
        .select();
      
      if (error) throw error;
      
      toast({
        title: "تم التحديث بنجاح",
        description: "تم تحديث بيانات الموظف والحسابات المرتبطة",
      });
      
      await fetchEmployees();
      return data;
    } catch (error) {
      console.error("Error updating employee:", error);
      toast({
        title: "خطأ في تحديث بيانات الموظف",
        description: "حدث خطأ أثناء محاولة تحديث بيانات الموظف.",
        variant: "destructive",
      });
      return null;
    }
  };

  const deleteEmployee = async (id: string) => {
    try {
      // حذف الموظف سيؤدي إلى حذف الحسابات المرتبطة تلقائياً بسبب CASCADE
      const { error } = await supabase
        .from("employees")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      
      toast({
        title: "تم الحذف بنجاح",
        description: "تم حذف الموظف وجميع الحسابات المرتبطة",
      });
      
      await fetchEmployees();
      return true;
    } catch (error) {
      console.error("Error deleting employee:", error);
      toast({
        title: "خطأ في حذف الموظف",
        description: "حدث خطأ أثناء محاولة حذف الموظف.",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    employees,
    filteredEmployees,
    isLoading,
    searchTerm,
    setSearchTerm,
    fetchEmployees,
    addEmployee,
    updateEmployee,
    deleteEmployee
  };
};
