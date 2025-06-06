
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Employee {
  id: string;
  name: string;
  position: string;
  department: string;
  contract_type: string;
  employment_number?: string;
  photo_url?: string;
  identity_number: string;
  nationality: string;
  birth_date: string;
  joining_date: string;
  email: string;
  phone: string;
  branch?: string;
  salary: number;
  base_salary?: number;
  housing_allowance?: number;
  transportation_allowance?: number;
  employee_gosi_contribution?: number;
  company_gosi_contribution?: number;
  created_at: string;
}

export function useEmployeeData(employeeId: string) {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (employeeId) {
      fetchEmployee();
    }
  }, [employeeId]);

  const fetchEmployee = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("employees")
        .select("*")
        .eq("id", employeeId)
        .single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          setError('لم يتم العثور على بيانات الموظف');
        } else {
          throw fetchError;
        }
        return;
      }

      if (data) {
        setEmployee({
          id: data.id,
          name: data.name,
          position: data.position,
          department: data.department,
          contract_type: data.contract_type,
          employment_number: data.employment_number,
          photo_url: data.photo_url,
          identity_number: data.identity_number,
          nationality: data.nationality,
          birth_date: data.birth_date,
          joining_date: data.joining_date,
          email: data.email,
          phone: data.phone,
          branch: data.branch,
          salary: data.salary || 0,
          base_salary: data.base_salary || 0,
          housing_allowance: data.housing_allowance || 0,
          transportation_allowance: data.transportation_allowance || 0,
          employee_gosi_contribution: data.employee_gosi_contribution || 0,
          company_gosi_contribution: data.company_gosi_contribution || 0,
          created_at: data.created_at
        });
      }
    } catch (err) {
      console.error("Error fetching employee:", err);
      const errorMessage = err instanceof Error ? err.message : 'حدث خطأ غير متوقع';
      setError(errorMessage);
      toast({
        title: "خطأ في تحميل البيانات",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    employee,
    loading,
    error
  };
}
