
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
      console.log('جاري جلب الموظفين...');
      
      const { data, error } = await supabase
        .from("employees")
        .select("*")
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("خطأ في جلب الموظفين:", error);
        // في حالة عدم وجود اتصال بقاعدة البيانات، استخدم بيانات وهمية
        setEmployees([]);
        toast({
          title: "تحذير",
          description: "لا يمكن الاتصال بقاعدة البيانات، يتم استخدام النمط التجريبي",
          variant: "destructive",
        });
        return;
      }
      
      console.log('تم جلب الموظفين بنجاح:', data?.length || 0);
      setEmployees(data || []);
    } catch (error) {
      console.error("خطأ غير متوقع:", error);
      setEmployees([]);
      toast({
        title: "نمط تجريبي",
        description: "يتم العمل في النمط التجريبي بدون قاعدة بيانات",
      });
    } finally {
      setLoading(false);
    }
  };

  const addEmployee = async (employeeData: Omit<SimpleEmployee, 'id'>) => {
    try {
      setLoading(true);
      console.log('جاري إضافة موظف جديد:', employeeData.name);
      
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
        // في النمط التجريبي، أضف الموظف محلياً
        const newEmployee = { ...finalData, id: Date.now().toString() };
        setEmployees(prev => [newEmployee, ...prev]);
        toast({
          title: "تمت الإضافة محلياً",
          description: "تم إضافة الموظف في النمط التجريبي",
        });
        return newEmployee;
      }
      
      toast({
        title: "تمت الإضافة بنجاح",
        description: "تم إضافة الموظف بنجاح",
      });
      
      await fetchEmployees();
      return data;
    } catch (error) {
      console.error("خطأ في إضافة الموظف:", error);
      // إضافة محلية في حالة الخطأ
      const newEmployee = { ...employeeData, id: Date.now().toString() };
      setEmployees(prev => [newEmployee, ...prev]);
      toast({
        title: "تمت الإضافة محلياً",
        description: "تم إضافة الموظف في النمط التجريبي",
      });
      return newEmployee;
    } finally {
      setLoading(false);
    }
  };

  return {
    employees,
    loading,
    fetchEmployees,
    addEmployee,
  };
};
