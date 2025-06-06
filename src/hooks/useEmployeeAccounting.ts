
import { useState, useEffect } from 'react';
import { EmployeeAccountingService } from '@/services/employeeAccountingService';
import { useToast } from '@/hooks/use-toast';

export function useEmployeeAccounting() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchAllEmployeesAccounting = async () => {
    try {
      setLoading(true);
      const data = await EmployeeAccountingService.getAllEmployeesAccounting();
      setEmployees(data || []);
    } catch (error) {
      console.error('Error fetching employees accounting:', error);
      toast({
        title: 'خطأ في جلب البيانات',
        description: 'حدث خطأ أثناء جلب البيانات المحاسبية للموظفين',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const addIncentive = async (incentiveData: {
    employee_id: string;
    incentive_type: string;
    amount: number;
    awarded_for: string;
    created_by: string;
  }) => {
    try {
      await EmployeeAccountingService.addEmployeeIncentive(incentiveData);
      toast({
        title: 'تم إضافة الحافز',
        description: 'تم إضافة الحافز بنجاح للموظف',
      });
      await fetchAllEmployeesAccounting();
    } catch (error) {
      toast({
        title: 'خطأ في إضافة الحافز',
        description: 'حدث خطأ أثناء إضافة الحافز',
        variant: 'destructive',
      });
    }
  };

  const assignToProject = async (assignmentData: {
    project_id: string;
    employee_id: string;
    role_in_project: string;
    hourly_rate?: number;
  }) => {
    try {
      await EmployeeAccountingService.assignEmployeeToProject(assignmentData);
      toast({
        title: 'تم التخصيص',
        description: 'تم تخصيص الموظف للمشروع بنجاح',
      });
      await fetchAllEmployeesAccounting();
    } catch (error) {
      toast({
        title: 'خطأ في التخصيص',
        description: 'حدث خطأ أثناء تخصيص الموظف للمشروع',
        variant: 'destructive',
      });
    }
  };

  const updateEmployeeKPI = async (employeeId: string) => {
    try {
      await EmployeeAccountingService.updateEmployeeKPI(employeeId);
      toast({
        title: 'تم التحديث',
        description: 'تم تحديث مؤشرات الأداء بنجاح',
      });
      await fetchAllEmployeesAccounting();
    } catch (error) {
      toast({
        title: 'خطأ في التحديث',
        description: 'حدث خطأ أثناء تحديث مؤشرات الأداء',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchAllEmployeesAccounting();
  }, []);

  return {
    employees,
    loading,
    fetchAllEmployeesAccounting,
    addIncentive,
    assignToProject,
    updateEmployeeKPI,
  };
}
