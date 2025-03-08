
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
      const { data, error } = await supabase
        .from("employees")
        .select("*");
      
      if (error) throw error;
      
      setEmployees(data || []);
      setFilteredEmployees(data || []);
    } catch (error) {
      console.error("Error fetching employees:", error);
      toast({
        title: "خطأ في جلب البيانات",
        description: "حدث خطأ أثناء محاولة جلب بيانات الموظفين.",
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
        .insert([employeeData])
        .select();
      
      if (error) throw error;
      
      toast({
        title: "تمت الإضافة بنجاح",
        description: "تمت إضافة الموظف بنجاح",
      });
      
      fetchEmployees();
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
        description: "تم تحديث بيانات الموظف بنجاح",
      });
      
      fetchEmployees();
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
      const { error } = await supabase
        .from("employees")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      
      toast({
        title: "تم الحذف بنجاح",
        description: "تم حذف الموظف بنجاح",
      });
      
      fetchEmployees();
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
