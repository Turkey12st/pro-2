
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AdvancedDataIntegrationService } from '@/services/advancedDataIntegration';

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
      console.log('جاري جلب البيانات المتكاملة...');

      // استخدام الخدمة المتقدمة لجلب البيانات
      const dashboardMetrics = await AdvancedDataIntegrationService.getDashboardMetrics();

      console.log('تم جلب البيانات:', dashboardMetrics);

      setData({
        employees: dashboardMetrics.employees,
        partners: dashboardMetrics.partners,
        projects: dashboardMetrics.projects,
        financials: dashboardMetrics.financials,
        totalEmployees: dashboardMetrics.summary.totalEmployees,
        totalSalaries: dashboardMetrics.employees.reduce((sum, emp) => sum + (emp.salary || 0), 0),
        totalCapital: dashboardMetrics.summary.totalCapital,
        totalProjects: dashboardMetrics.summary.totalProjects
      });

      setHasInitialized(true);
      console.log('تم تحديث البيانات بنجاح');

    } catch (error) {
      console.error('خطأ في جلب البيانات المتكاملة:', error);
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
      console.log('جاري ضمان ترابط البيانات...');
      
      await AdvancedDataIntegrationService.ensureComprehensiveDataIntegrity();
      await fetchIntegratedData();
      
      toast({
        title: 'تم تحديث ترابط البيانات',
        description: 'تم ضمان ترابط البيانات عبر جميع أقسام النظام',
      });
    } catch (error) {
      console.error('خطأ في تحديث الترابط:', error);
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
