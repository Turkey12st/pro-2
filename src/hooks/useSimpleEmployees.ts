
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface SimpleEmployee {
  id?: string;
  name: string;
  identity_number: string;
  birth_date: string;
  nationality: string;
  position: string;
  department: string;
  salary: number;
  joining_date: string;
  contract_type: string;
  email: string;
  phone: string;
  base_salary?: number;
  housing_allowance?: number;
  transportation_allowance?: number;
}

export const useSimpleEmployees = () => {
  const [employees, setEmployees] = useState<SimpleEmployee[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("employees")
        .select("*")
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("خطأ في جلب الموظفين:", error);
        toast({
          title: "خطأ في جلب البيانات",
          description: "حدث خطأ أثناء جلب بيانات الموظفين",
          variant: "destructive",
        });
        return;
      }
      
      setEmployees(data || []);
    } catch (error) {
      console.error("خطأ غير متوقع:", error);
      toast({
        title: "خطأ غير متوقع",
        description: "حدث خطأ غير متوقع أثناء جلب البيانات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addEmployee = async (employeeData: Omit<SimpleEmployee, 'id'>) => {
    try {
      setLoading(true);
      
      // التأكد من وجود البيانات المطلوبة
      const finalData = {
        name: employeeData.name,
        identity_number: employeeData.identity_number,
        birth_date: employeeData.birth_date,
        nationality: employeeData.nationality,
        position: employeeData.position,
        department: employeeData.department,
        salary: employeeData.salary,
        joining_date: employeeData.joining_date,
        contract_type: employeeData.contract_type,
        email: employeeData.email,
        phone: employeeData.phone,
        base_salary: employeeData.base_salary || employeeData.salary,
        housing_allowance: employeeData.housing_allowance || 0,
        transportation_allowance: employeeData.transportation_allowance || 0,
        created_by: 'demo-user-id' // معرف مؤقت
      };

      const { data, error } = await supabase
        .from("employees")
        .insert([finalData])
        .select()
        .single();
      
      if (error) {
        console.error("خطأ في إضافة الموظف:", error);
        toast({
          title: "خطأ في إضافة الموظف",
          description: error.message || "حدث خطأ أثناء إضافة الموظف",
          variant: "destructive",
        });
        return null;
      }
      
      toast({
        title: "تمت الإضافة بنجاح",
        description: "تم إضافة الموظف بنجاح",
      });
      
      // إعادة جلب البيانات
      await fetchEmployees();
      return data;
    } catch (error) {
      console.error("خطأ في إضافة الموظف:", error);
      toast({
        title: "خطأ في إضافة الموظف",
        description: "حدث خطأ أثناء إضافة الموظف",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateEmployee = async (id: string, employeeData: Partial<SimpleEmployee>) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("employees")
        .update(employeeData)
        .eq("id", id)
        .select()
        .single();
      
      if (error) {
        console.error("خطأ في تحديث الموظف:", error);
        toast({
          title: "خطأ في تحديث الموظف",
          description: error.message || "حدث خطأ أثناء تحديث الموظف",
          variant: "destructive",
        });
        return null;
      }
      
      toast({
        title: "تم التحديث بنجاح",
        description: "تم تحديث بيانات الموظف",
      });
      
      await fetchEmployees();
      return data;
    } catch (error) {
      console.error("خطأ في تحديث الموظف:", error);
      toast({
        title: "خطأ في التحديث",
        description: "حدث خطأ أثناء تحديث الموظف",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteEmployee = async (id: string) => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from("employees")
        .delete()
        .eq("id", id);
      
      if (error) {
        console.error("خطأ في حذف الموظف:", error);
        toast({
          title: "خطأ في حذف الموظف",
          description: error.message || "حدث خطأ أثناء حذف الموظف",
          variant: "destructive",
        });
        return false;
      }
      
      toast({
        title: "تم الحذف بنجاح",
        description: "تم حذف الموظف بنجاح",
      });
      
      await fetchEmployees();
      return true;
    } catch (error) {
      console.error("خطأ في حذف الموظف:", error);
      toast({
        title: "خطأ في الحذف",
        description: "حدث خطأ أثناء حذف الموظف",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    employees,
    loading,
    fetchEmployees,
    addEmployee,
    updateEmployee,
    deleteEmployee
  };
};
