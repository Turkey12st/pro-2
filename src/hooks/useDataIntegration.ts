
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { DataIntegrationService } from '@/services/dataIntegrationService';

interface IntegratedData {
  employees: any[];
  partners: any[];
  projects: any[];
  financials: any[];
  totalEmployees: number;
  totalSalaries: number;
  totalCapital: number;
  totalProjects: number;
}

export function useDataIntegration() {
  const [data, setData] = useState<IntegratedData>({
    employees: [],
    partners: [],
    projects: [],
    financials: [],
    totalEmployees: 0,
    totalSalaries: 0,
    totalCapital: 0,
    totalProjects: 0
  });
  const [loading, setLoading] = useState(true);
  const [isInitializing, setIsInitializing] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const { toast } = useToast();

  const fetchIntegratedData = async () => {
    try {
      setLoading(true);

      // جلب بيانات الموظفين مع البيانات المحاسبية
      const { data: employees, error: empError } = await supabase
        .from('employees')
        .select(`
          *,
          employee_accounts (
            id,
            account_number,
            account_name,
            account_type,
            balance
          ),
          employee_performance (
            performance_score,
            attendance_rate,
            kpi_metrics
          ),
          project_employee_assignments (
            id,
            project_id,
            role_in_project,
            total_cost,
            projects (
              title,
              status
            )
          )
        `);

      if (empError) throw empError;

      // جلب بيانات الشركاء
      const { data: partners, error: partError } = await supabase
        .from('company_partners')
        .select('*');

      if (partError) throw partError;

      // جلب بيانات المشاريع
      const { data: projects, error: projError } = await supabase
        .from('projects')
        .select(`
          *,
          project_employee_assignments (
            employee_id,
            total_cost
          ),
          project_tasks (
            id,
            status
          )
        `);

      if (projError) throw projError;

      // جلب البيانات المالية
      const { data: financials, error: finError } = await supabase
        .from('journal_entries')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (finError) throw finError;

      // حساب الإجماليات
      const totalEmployees = employees?.length || 0;
      const totalSalaries = employees?.reduce((sum, emp) => sum + (emp.salary || 0), 0) || 0;
      const totalCapital = partners?.reduce((sum, partner) => sum + (partner.share_value || 0), 0) || 0;
      const totalProjects = projects?.length || 0;

      setData({
        employees: employees || [],
        partners: partners || [],
        projects: projects || [],
        financials: financials || [],
        totalEmployees,
        totalSalaries,
        totalCapital,
        totalProjects
      });

      setHasInitialized(true);

    } catch (error) {
      console.error('Error fetching integrated data:', error);
      toast({
        title: 'خطأ في جلب البيانات المتكاملة',
        description: 'حدث خطأ أثناء جلب البيانات من قاعدة البيانات',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshDataIntegrity = async () => {
    try {
      setIsInitializing(true);
      await DataIntegrationService.ensureDataIntegrity();
      await fetchIntegratedData();
      
      toast({
        title: 'تم تحديث ترابط البيانات',
        description: 'تم ضمان ترابط البيانات عبر جميع أقسام النظام',
      });
    } catch (error) {
      console.error('Error refreshing data integrity:', error);
      toast({
        title: 'خطأ في تحديث الترابط',
        description: 'حدث خطأ أثناء تحديث ترابط البيانات',
        variant: 'destructive',
      });
    } finally {
      setIsInitializing(false);
    }
  };

  useEffect(() => {
    fetchIntegratedData();
  }, []);

  return {
    data,
    loading,
    isInitializing,
    hasInitialized,
    refresh: fetchIntegratedData,
    refreshDataIntegrity
  };
}
