import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useRealtimeSync } from '@/hooks/useRealtimeSync';
import {
  Users,
  DollarSign,
  FileText,
  TrendingUp,
  ArrowLeftRight,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

interface CrossModuleKPIs {
  totalEmployees: number;
  activeEmployees: number;
  totalMonthlySalaries: number;
  pendingPayrolls: number;
  approvedPayrolls: number;
  totalJournalEntries: number;
  recentSyncCount: number;
  syncHealth: 'good' | 'warning' | 'error';
}

export function IntegratedKPIWidgets() {
  const navigate = useNavigate();
  const [kpis, setKpis] = useState<CrossModuleKPIs>({
    totalEmployees: 0,
    activeEmployees: 0,
    totalMonthlySalaries: 0,
    pendingPayrolls: 0,
    approvedPayrolls: 0,
    totalJournalEntries: 0,
    recentSyncCount: 0,
    syncHealth: 'good',
  });
  const [loading, setLoading] = useState(true);

  // تفعيل المزامنة الفورية
  useRealtimeSync({
    tables: ['employees', 'employee_salaries', 'journal_entries', 'data_sync_log'],
    onSync: () => fetchKPIs(),
  });

  const fetchKPIs = async () => {
    try {
      const [employeesRes, salariesRes, journalRes, syncRes] = await Promise.all([
        supabase.from('employees').select('id, is_active, salary', { count: 'exact' }),
        supabase.from('employee_salaries').select('id, status, gross_pay, net_pay', { count: 'exact' }),
        supabase.from('journal_entries').select('id', { count: 'exact' }),
        supabase
          .from('data_sync_log')
          .select('id, status')
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
      ]);

      const employees = employeesRes.data || [];
      const salaries = salariesRes.data || [];
      const syncLogs = syncRes.data || [];

      const activeEmps = employees.filter((e: any) => e.is_active);
      const totalMonthlySalaries = activeEmps.reduce((s: number, e: any) => s + (e.salary || 0), 0);
      const pending = salaries.filter((s: any) => s.status === 'draft').length;
      const approved = salaries.filter((s: any) => s.status === 'approved').length;
      const failedSyncs = syncLogs.filter((l: any) => l.status === 'failed').length;

      setKpis({
        totalEmployees: employees.length,
        activeEmployees: activeEmps.length,
        totalMonthlySalaries,
        pendingPayrolls: pending,
        approvedPayrolls: approved,
        totalJournalEntries: journalRes.count || 0,
        recentSyncCount: syncLogs.length,
        syncHealth: failedSyncs > 5 ? 'error' : failedSyncs > 0 ? 'warning' : 'good',
      });
    } catch (error) {
      console.error('خطأ في جلب المؤشرات:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKPIs();
  }, []);

  if (loading) {
    return (
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-40 bg-muted rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">المؤشرات المترابطة (HR → Payroll → Finance)</h2>
        <div className="flex items-center gap-2">
          <Badge
            variant={kpis.syncHealth === 'good' ? 'default' : kpis.syncHealth === 'warning' ? 'secondary' : 'destructive'}
            className="text-xs"
          >
            {kpis.syncHealth === 'good' ? (
              <><CheckCircle2 className="h-3 w-3 mr-1" /> مزامنة سليمة</>
            ) : kpis.syncHealth === 'warning' ? (
              <><AlertTriangle className="h-3 w-3 mr-1" /> تحذيرات</>
            ) : (
              <><AlertTriangle className="h-3 w-3 mr-1" /> مشاكل مزامنة</>
            )}
          </Badge>
          <Button variant="ghost" size="sm" onClick={fetchKPIs}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {/* HR → عدد الموظفين */}
        <Card
          className="cursor-pointer hover:shadow-md transition-shadow border-r-4 border-r-primary"
          onClick={() => navigate('/hr')}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              الموظفون النشطون
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{kpis.activeEmployees}</div>
            <p className="text-xs text-muted-foreground mt-1">
              من أصل {kpis.totalEmployees} موظف
            </p>
            <Progress
              value={(kpis.activeEmployees / Math.max(kpis.totalEmployees, 1)) * 100}
              className="mt-2 h-1.5"
            />
          </CardContent>
        </Card>

        {/* Payroll → إجمالي الرواتب */}
        <Card
          className="cursor-pointer hover:shadow-md transition-shadow border-r-4 border-r-orange-500"
          onClick={() => navigate('/hr')}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              الرواتب الشهرية
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {kpis.totalMonthlySalaries.toLocaleString()}
              <span className="text-sm font-normal text-muted-foreground mr-1">ريال</span>
            </div>
            <div className="flex gap-2 mt-2">
              <Badge variant="secondary" className="text-xs">
                مسودة: {kpis.pendingPayrolls}
              </Badge>
              <Badge variant="default" className="text-xs">
                معتمد: {kpis.approvedPayrolls}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Finance → القيود المحاسبية */}
        <Card
          className="cursor-pointer hover:shadow-md transition-shadow border-r-4 border-r-green-500"
          onClick={() => navigate('/accounting')}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <FileText className="h-4 w-4" />
              القيود المحاسبية
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{kpis.totalJournalEntries}</div>
            <p className="text-xs text-muted-foreground mt-1">
              قيد محاسبي مسجّل
            </p>
          </CardContent>
        </Card>

        {/* Sync Health → حالة الترابط */}
        <Card className="border-r-4 border-r-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <ArrowLeftRight className="h-4 w-4" />
              ترابط البيانات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{kpis.recentSyncCount}</div>
            <p className="text-xs text-muted-foreground mt-1">عملية مزامنة (24 ساعة)</p>
            <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3" />
              HR → Payroll → Finance
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
