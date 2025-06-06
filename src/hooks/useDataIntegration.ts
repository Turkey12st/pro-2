
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
  avgPerformance: number;
  activeProjects: number;
  completedProjects: number;
  availableCapital: number;
  systemHealth: 'excellent' | 'good' | 'warning' | 'critical';
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
    totalProjects: 0,
    avgPerformance: 0,
    activeProjects: 0,
    completedProjects: 0,
    availableCapital: 0,
    systemHealth: 'good'
  });
  const [loading, setLoading] = useState(true);
  const [isInitializing, setIsInitializing] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const { toast } = useToast();

  const fetchIntegratedData = async () => {
    try {
      setLoading(true);
      console.log('جاري جلب البيانات المتكاملة مع ضمان الترابط...');

      // استخدام الخدمة المتقدمة لجلب البيانات مع ضمان الترابط
      const dashboardMetrics = await AdvancedDataIntegrationService.getDashboardMetrics();
      
      // حساب المؤشرات المتقدمة
      const totalSalaries = dashboardMetrics.employees.reduce((sum, emp) => sum + (emp.salary || 0), 0);
      const avgPerformance = dashboardMetrics.employees.reduce((sum, emp) => {
        const perf = emp.employee_performance?.[0]?.performance_score || 0;
        return sum + perf;
      }, 0) / (dashboardMetrics.employees.length || 1);

      const activeProjects = dashboardMetrics.projects.filter(p => p.status === 'in_progress').length;
      const completedProjects = dashboardMetrics.projects.filter(p => p.status === 'completed').length;
      
      const totalProjectsCost = dashboardMetrics.projects.reduce((sum, project) => 
        sum + (project.budget || 0), 0);
      
      const availableCapital = dashboardMetrics.summary.totalCapital - totalSalaries - totalProjectsCost;

      // تقييم صحة النظام
      let systemHealth: 'excellent' | 'good' | 'warning' | 'critical' = 'good';
      if (avgPerformance >= 85 && availableCapital > 0) systemHealth = 'excellent';
      else if (avgPerformance < 70 || availableCapital < 0) systemHealth = 'warning';
      else if (avgPerformance < 50 && availableCapital < -10000) systemHealth = 'critical';

      console.log('تم جلب البيانات مع الترابط:', {
        employees: dashboardMetrics.employees.length,
        projects: dashboardMetrics.projects.length,
        avgPerformance,
        systemHealth
      });

      setData({
        employees: dashboardMetrics.employees,
        partners: dashboardMetrics.partners,
        projects: dashboardMetrics.projects,
        financials: dashboardMetrics.financials,
        totalEmployees: dashboardMetrics.summary.totalEmployees,
        totalSalaries,
        totalCapital: dashboardMetrics.summary.totalCapital,
        totalProjects: dashboardMetrics.summary.totalProjects,
        avgPerformance,
        activeProjects,
        completedProjects,
        availableCapital,
        systemHealth
      });

      setHasInitialized(true);
      setLastSync(new Date());
      console.log('تم تحديث البيانات بنجاح مع ضمان الترابط');

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
      console.log('جاري ضمان ترابط البيانات الشامل...');
      
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

  // تحديث تلقائي كل 5 دقائق
  useEffect(() => {
    fetchIntegratedData();
    const interval = setInterval(fetchIntegratedData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return {
    data,
    loading,
    isInitializing,
    hasInitialized,
    lastSync,
    refresh: fetchIntegratedData,
    refreshDataIntegrity
  };
}
