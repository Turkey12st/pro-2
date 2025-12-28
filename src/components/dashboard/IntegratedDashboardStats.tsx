import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Users, DollarSign, Building, Briefcase, TrendingUp, Target, Award, AlertCircle, ChevronRight, ChevronDown, ChevronUp, Clock, CalendarIcon } from 'lucide-react';
import { useDataIntegration } from '@/hooks/useDataIntegration';
import { useUserPermissions } from '@/hooks/useUserPermissions';
import { getCurrentDates } from '@/utils/dateHelpers';
import { formatNumberEnglish, formatCurrencyEnglish, formatPercentageEnglish } from '@/utils/numberFormatter';

interface IntegratedDashboardStatsProps {
  onStatClick?: (type: string) => void;
}

export function IntegratedDashboardStats({
  onStatClick
}: IntegratedDashboardStatsProps) {
  const { data, loading } = useDataIntegration();
  const { permissions } = useUserPermissions();
  const [expandedPerformance, setExpandedPerformance] = useState(false);
  const [expandedProjectSuccess, setExpandedProjectSuccess] = useState(false);
  const [expandedLiquidity, setExpandedLiquidity] = useState(false);

  const { gregorian, hijri, time } = getCurrentDates();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="dashboard-grid">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-muted rounded-xl animate-pulse"></div>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-40 bg-muted rounded-xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  // حساب مؤشرات الأداء
  const avgPerformance = data.employees.reduce((sum, emp) => {
    const perf = emp.employee_performance?.[0]?.performance_score || 0;
    return sum + perf;
  }, 0) / (data.employees.length || 1);
  
  const activeProjects = data.projects.filter(p => p.status === 'in_progress').length;
  const completedProjects = data.projects.filter(p => p.status === 'completed').length;
  const projectSuccessRate = data.projects.length > 0 ? completedProjects / data.projects.length * 100 : 0;
  const totalProjectsCost = data.projects.reduce((sum, project) => sum + (project.budget || 0), 0);
  const availableCapital = data.totalCapital - data.totalSalaries - totalProjectsCost;

  const mainStats = [
    {
      title: "إجمالي الموظفين",
      value: formatNumberEnglish(data.totalEmployees),
      suffix: "موظف نشط",
      icon: Users,
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
      action: "employees",
      actionLabel: "إدارة الموظفين"
    },
    {
      title: "إجمالي الرواتب",
      value: formatCurrencyEnglish(data.totalSalaries),
      suffix: "شهرياً",
      icon: DollarSign,
      iconBg: "bg-success/10",
      iconColor: "text-success",
      action: "employees",
      actionLabel: "إدارة الرواتب"
    },
    {
      title: "رأس المال",
      value: formatCurrencyEnglish(data.totalCapital),
      suffix: "إجمالي",
      icon: Building,
      iconBg: "bg-info/10",
      iconColor: "text-info",
      action: "financial",
      actionLabel: "التقارير المالية"
    },
    {
      title: "المشاريع النشطة",
      value: formatNumberEnglish(activeProjects),
      suffix: `من إجمالي ${formatNumberEnglish(data.totalProjects)}`,
      icon: Briefcase,
      iconBg: "bg-warning/10",
      iconColor: "text-warning",
      action: "projects",
      actionLabel: "إدارة المشاريع"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header with date */}
      <div className="section-card">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarIcon className="h-4 w-4" />
              <span className="font-medium">{gregorian}</span>
            </div>
            <span className="text-muted-foreground/50">|</span>
            <span className="text-sm text-muted-foreground">{hijri}</span>
          </div>
          <div className="flex items-center gap-4">
            {permissions.isMainAccount && (
              <Badge className="bg-primary/10 text-primary border-primary/20">
                الحساب الرئيسي
              </Badge>
            )}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{time}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Stats */}
      <div className="dashboard-grid">
        {mainStats.map((stat, index) => (
          <Card key={index} className="stat-card group">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="stat-label">{stat.title}</p>
                  <div className="stat-value" dir="ltr">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">{stat.suffix}</p>
                </div>
                <div className={`p-3 rounded-xl ${stat.iconBg} transition-transform group-hover:scale-110`}>
                  <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full mt-3 h-8 text-xs opacity-0 group-hover:opacity-100 transition-all" 
                onClick={() => onStatClick?.(stat.action)}
              >
                <ChevronRight className="h-3 w-3 ml-1" />
                {stat.actionLabel}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Advanced Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Performance */}
        <Card className="section-card overflow-hidden">
          <CardHeader 
            className="pb-3 cursor-pointer hover:bg-muted/30 transition-colors" 
            onClick={() => setExpandedPerformance(!expandedPerformance)}
          >
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-lg ${avgPerformance >= 85 ? 'bg-success/10' : avgPerformance >= 70 ? 'bg-warning/10' : 'bg-destructive/10'}`}>
                  <Target className={`h-4 w-4 ${avgPerformance >= 85 ? 'text-success' : avgPerformance >= 70 ? 'text-warning' : 'text-destructive'}`} />
                </div>
                <span className="text-sm font-semibold">مؤشر الأداء العام</span>
              </div>
              {expandedPerformance ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className={`text-3xl font-bold mb-2 ${avgPerformance >= 85 ? 'text-success' : avgPerformance >= 70 ? 'text-warning' : 'text-destructive'}`} dir="ltr">
                {formatPercentageEnglish(avgPerformance)}
              </div>
              <Progress value={avgPerformance} className="mb-3 h-2" />
              <Badge variant={avgPerformance >= 85 ? 'default' : avgPerformance >= 70 ? 'secondary' : 'destructive'}>
                {avgPerformance >= 85 ? 'ممتاز' : avgPerformance >= 70 ? 'جيد' : 'يحتاج تحسين'}
              </Badge>
            </div>
            
            {expandedPerformance && (
              <div className="mt-4 pt-4 border-t border-border space-y-3 animate-in">
                {[
                  { label: 'معدل الحضور', value: 92 },
                  { label: 'إنجاز المهام', value: 85 },
                  { label: 'رضا العملاء', value: 88 }
                ].map((item, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">{item.label}</span>
                      <span className="font-medium" dir="ltr">{formatPercentageEnglish(item.value)}</span>
                    </div>
                    <Progress value={item.value} className="h-1.5" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Project Success */}
        <Card className="section-card overflow-hidden">
          <CardHeader 
            className="pb-3 cursor-pointer hover:bg-muted/30 transition-colors" 
            onClick={() => setExpandedProjectSuccess(!expandedProjectSuccess)}
          >
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-info/10">
                  <Award className="h-4 w-4 text-info" />
                </div>
                <span className="text-sm font-semibold">معدل نجاح المشاريع</span>
              </div>
              {expandedProjectSuccess ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground mb-2" dir="ltr">
                {formatPercentageEnglish(projectSuccessRate)}
              </div>
              <Progress value={projectSuccessRate} className="mb-3 h-2" />
              <p className="text-sm text-muted-foreground">
                {completedProjects} مكتمل من {formatNumberEnglish(data.totalProjects)}
              </p>
            </div>

            {expandedProjectSuccess && (
              <div className="mt-4 pt-4 border-t border-border space-y-2 animate-in">
                {[
                  { label: 'مشاريع نشطة', value: formatNumberEnglish(activeProjects) },
                  { label: 'مشاريع مكتملة', value: formatNumberEnglish(completedProjects) },
                  { label: 'مشاريع متأخرة', value: data.projects.filter(p => p.status === 'on_hold').length }
                ].map((item, i) => (
                  <div key={i} className="flex justify-between text-sm p-2 rounded-lg bg-muted/30">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="font-medium">{item.value}</span>
                  </div>
                ))}
                <div className="flex justify-between text-sm p-2 rounded-lg bg-primary/5 mt-2">
                  <span className="text-muted-foreground">إجمالي الميزانية</span>
                  <span className="font-medium text-primary">{formatCurrencyEnglish(totalProjectsCost)}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Liquidity */}
        <Card className="section-card overflow-hidden">
          <CardHeader 
            className="pb-3 cursor-pointer hover:bg-muted/30 transition-colors" 
            onClick={() => setExpandedLiquidity(!expandedLiquidity)}
          >
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-lg ${availableCapital >= 0 ? 'bg-success/10' : 'bg-destructive/10'}`}>
                  <TrendingUp className={`h-4 w-4 ${availableCapital >= 0 ? 'text-success' : 'text-destructive'}`} />
                </div>
                <span className="text-sm font-semibold">السيولة المتاحة</span>
              </div>
              {expandedLiquidity ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className={`text-2xl font-bold mb-2 ${availableCapital >= 0 ? 'text-success' : 'text-destructive'}`} dir="ltr">
                {formatCurrencyEnglish(availableCapital)}
              </div>
              <p className="text-sm text-muted-foreground mb-2">ريال متاح</p>
              <Badge variant={availableCapital >= 0 ? 'default' : 'destructive'}>
                {availableCapital >= 0 ? 'مستقر' : 'يحتاج مراجعة'}
              </Badge>
            </div>

            {expandedLiquidity && (
              <div className="mt-4 pt-4 border-t border-border space-y-2 animate-in">
                <div className="flex justify-between text-sm p-2 rounded-lg bg-muted/30">
                  <span className="text-muted-foreground">رأس المال الإجمالي</span>
                  <span className="font-medium">{formatCurrencyEnglish(data.totalCapital)}</span>
                </div>
                <div className="flex justify-between text-sm p-2 rounded-lg bg-destructive/5">
                  <span className="text-muted-foreground">الرواتب الشهرية</span>
                  <span className="font-medium text-destructive">-{formatCurrencyEnglish(data.totalSalaries)}</span>
                </div>
                <div className="flex justify-between text-sm p-2 rounded-lg bg-destructive/5">
                  <span className="text-muted-foreground">تكاليف المشاريع</span>
                  <span className="font-medium text-destructive">-{formatCurrencyEnglish(totalProjectsCost)}</span>
                </div>
                <div className={`flex justify-between text-sm p-2 rounded-lg font-medium ${availableCapital >= 0 ? 'bg-success/10' : 'bg-destructive/10'}`}>
                  <span>الصافي المتبقي</span>
                  <span className={availableCapital >= 0 ? 'text-success' : 'text-destructive'}>
                    {formatCurrencyEnglish(availableCapital)} ريال
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {permissions.isMainAccount && (avgPerformance < 70 || availableCapital < 0 || projectSuccessRate < 50) && (
        <Card className="border-l-4 border-l-destructive bg-destructive/5">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-destructive text-sm">
              <AlertCircle className="h-4 w-4" />
              تنبيهات مهمة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {avgPerformance < 70 && (
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <div className="w-2 h-2 bg-destructive rounded-full"></div>
                  أداء الموظفين يحتاج تحسين عاجل
                </div>
              )}
              {availableCapital < 0 && (
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <div className="w-2 h-2 bg-destructive rounded-full"></div>
                  تجاوز في رأس المال - مراجعة مالية مطلوبة
                </div>
              )}
              {projectSuccessRate < 50 && (
                <div className="flex items-center gap-2 text-sm text-warning">
                  <div className="w-2 h-2 bg-warning rounded-full"></div>
                  معدل نجاح المشاريع منخفض
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
