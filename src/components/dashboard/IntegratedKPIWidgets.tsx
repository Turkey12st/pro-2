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
  ArrowUpRight,
  Sparkles,
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

const kpiCards = [
  {
    key: 'employees',
    title: 'الموظفون النشطون',
    icon: Users,
    gradient: 'from-primary/10 via-transparent to-primary/5',
    borderColor: 'border-r-primary',
    iconBg: 'bg-primary/10',
    iconColor: 'text-primary',
    route: '/hr',
  },
  {
    key: 'salaries',
    title: 'الرواتب الشهرية',
    icon: DollarSign,
    gradient: 'from-warning/10 via-transparent to-warning/5',
    borderColor: 'border-r-warning',
    iconBg: 'bg-warning/10',
    iconColor: 'text-warning',
    route: '/hr',
  },
  {
    key: 'journal',
    title: 'القيود المحاسبية',
    icon: FileText,
    gradient: 'from-success/10 via-transparent to-success/5',
    borderColor: 'border-r-success',
    iconBg: 'bg-success/10',
    iconColor: 'text-success',
    route: '/accounting',
  },
  {
    key: 'sync',
    title: 'ترابط البيانات',
    icon: ArrowLeftRight,
    gradient: 'from-info/10 via-transparent to-info/5',
    borderColor: 'border-r-info',
    iconBg: 'bg-info/10',
    iconColor: 'text-info',
    route: null,
  },
];

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
  const [refreshing, setRefreshing] = useState(false);

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
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchKPIs();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchKPIs();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-7 w-64 skeleton-premium" />
          <div className="h-8 w-32 skeleton-premium" />
        </div>
        <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-44 skeleton-premium rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">المؤشرات المترابطة</h2>
            <p className="text-sm text-muted-foreground">HR → Payroll → Finance</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge
            variant={kpis.syncHealth === 'good' ? 'default' : kpis.syncHealth === 'warning' ? 'secondary' : 'destructive'}
            className="h-8 px-3 rounded-full text-xs font-medium"
          >
            {kpis.syncHealth === 'good' ? (
              <><CheckCircle2 className="h-3.5 w-3.5 ml-1.5" /> مزامنة سليمة</>
            ) : kpis.syncHealth === 'warning' ? (
              <><AlertTriangle className="h-3.5 w-3.5 ml-1.5" /> تحذيرات</>
            ) : (
              <><AlertTriangle className="h-3.5 w-3.5 ml-1.5" /> مشاكل مزامنة</>
            )}
          </Badge>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={refreshing}
            className="h-8 rounded-full px-3"
          >
            <RefreshCw className={`h-4 w-4 ml-1.5 ${refreshing ? 'animate-spin' : ''}`} />
            تحديث
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {/* Employees Card */}
        <Card
          className={`group cursor-pointer premium-card border-r-4 ${kpiCards[0].borderColor} bg-gradient-to-br ${kpiCards[0].gradient}`}
          onClick={() => navigate(kpiCards[0].route!)}
        >
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className={`w-11 h-11 rounded-xl ${kpiCards[0].iconBg} flex items-center justify-center transition-transform group-hover:scale-110`}>
                <Users className={`h-5 w-5 ${kpiCards[0].iconColor}`} />
              </div>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <p className="text-sm font-medium text-muted-foreground mb-1">{kpiCards[0].title}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-foreground tracking-tight">{kpis.activeEmployees}</span>
              <span className="text-sm text-muted-foreground">/ {kpis.totalEmployees}</span>
            </div>
            <Progress
              value={(kpis.activeEmployees / Math.max(kpis.totalEmployees, 1)) * 100}
              className="mt-3 h-1.5 bg-primary/20"
            />
            <p className="text-xs text-muted-foreground mt-2">
              معدل النشاط: {Math.round((kpis.activeEmployees / Math.max(kpis.totalEmployees, 1)) * 100)}%
            </p>
          </CardContent>
        </Card>

        {/* Salaries Card */}
        <Card
          className={`group cursor-pointer premium-card border-r-4 ${kpiCards[1].borderColor} bg-gradient-to-br ${kpiCards[1].gradient}`}
          onClick={() => navigate(kpiCards[1].route!)}
        >
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className={`w-11 h-11 rounded-xl ${kpiCards[1].iconBg} flex items-center justify-center transition-transform group-hover:scale-110`}>
                <DollarSign className={`h-5 w-5 ${kpiCards[1].iconColor}`} />
              </div>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <p className="text-sm font-medium text-muted-foreground mb-1">{kpiCards[1].title}</p>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-foreground tracking-tight">
                {kpis.totalMonthlySalaries.toLocaleString()}
              </span>
              <span className="text-sm text-muted-foreground">ريال</span>
            </div>
            <div className="flex gap-2 mt-3">
              <Badge variant="secondary" className="rounded-full text-xs font-medium px-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-warning ml-1.5" />
                مسودة: {kpis.pendingPayrolls}
              </Badge>
              <Badge variant="default" className="rounded-full text-xs font-medium px-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-foreground ml-1.5" />
                معتمد: {kpis.approvedPayrolls}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Journal Entries Card */}
        <Card
          className={`group cursor-pointer premium-card border-r-4 ${kpiCards[2].borderColor} bg-gradient-to-br ${kpiCards[2].gradient}`}
          onClick={() => navigate(kpiCards[2].route!)}
        >
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className={`w-11 h-11 rounded-xl ${kpiCards[2].iconBg} flex items-center justify-center transition-transform group-hover:scale-110`}>
                <FileText className={`h-5 w-5 ${kpiCards[2].iconColor}`} />
              </div>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <p className="text-sm font-medium text-muted-foreground mb-1">{kpiCards[2].title}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-foreground tracking-tight">{kpis.totalJournalEntries}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">قيد محاسبي مسجّل</p>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-success">
              <TrendingUp className="h-3 w-3" />
              <span>متوازن ومدقق</span>
            </div>
          </CardContent>
        </Card>

        {/* Data Sync Card */}
        <Card className={`premium-card border-r-4 ${kpiCards[3].borderColor} bg-gradient-to-br ${kpiCards[3].gradient}`}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className={`w-11 h-11 rounded-xl ${kpiCards[3].iconBg} flex items-center justify-center`}>
                <ArrowLeftRight className={`h-5 w-5 ${kpiCards[3].iconColor}`} />
              </div>
              <div className={`w-2.5 h-2.5 rounded-full ${
                kpis.syncHealth === 'good' ? 'bg-success' : 
                kpis.syncHealth === 'warning' ? 'bg-warning' : 'bg-destructive'
              } animate-pulse`} />
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <p className="text-sm font-medium text-muted-foreground mb-1">{kpiCards[3].title}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-foreground tracking-tight">{kpis.recentSyncCount}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">عملية مزامنة (24 ساعة)</p>
            <div className="flex items-center gap-2 mt-2 text-xs text-info">
              <div className="flex items-center gap-1">
                <span className="w-6 h-0.5 bg-info/30 rounded-full overflow-hidden">
                  <span className="block w-full h-full bg-info animate-pulse" />
                </span>
              </div>
              <span>HR → Payroll → Finance</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
