
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  DollarSign, 
  Building, 
  Briefcase, 
  TrendingUp, 
  Target,
  Award,
  AlertCircle,
  ChevronRight,
  Activity,
  PieChart,
  BarChart3,
  TrendingDown,
  Zap,
  Shield
} from 'lucide-react';
import { useDataIntegration } from '@/hooks/useDataIntegration';

interface IntegratedDashboardStatsProps {
  onStatClick?: (type: string) => void;
}

export function IntegratedDashboardStats({ onStatClick }: IntegratedDashboardStatsProps) {
  const { data, loading } = useDataIntegration();

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-32 bg-gray-200 rounded animate-pulse"></div>
        ))}
      </div>
    );
  }

  // حساب مؤشرات الأداء المتقدمة
  const avgPerformance = data.employees.reduce((sum, emp) => {
    const perf = emp.employee_performance?.[0]?.performance_score || 0;
    return sum + perf;
  }, 0) / (data.employees.length || 1);

  const activeProjects = data.projects.filter(p => p.status === 'in_progress').length;
  const completedProjects = data.projects.filter(p => p.status === 'completed').length;
  const projectSuccessRate = data.projects.length > 0 ? 
    (completedProjects / data.projects.length) * 100 : 0;

  const totalProjectsCost = data.projects.reduce((sum, project) => 
    sum + (project.budget || 0), 0);

  const availableCapital = data.totalCapital - data.totalSalaries - totalProjectsCost;
  const capitalUtilization = data.totalCapital > 0 ? 
    ((data.totalSalaries + totalProjectsCost) / data.totalCapital) * 100 : 0;

  // مؤشرات الأداء العالمية
  const employeeProductivity = avgPerformance * 1.2; // معامل الإنتاجية
  const costEfficiencyRatio = data.totalCapital > 0 ? 
    ((data.totalCapital - (data.totalSalaries + totalProjectsCost)) / data.totalCapital) * 100 : 0;
  const projectROI = totalProjectsCost > 0 ? 
    ((completedProjects * 50000 - totalProjectsCost) / totalProjectsCost) * 100 : 0; // ROI مفترض
  const liquidityRatio = data.totalCapital > 0 ? 
    (availableCapital / (data.totalSalaries * 3)) * 100 : 0; // نسبة السيولة لـ 3 أشهر

  return (
    <div className="space-y-6">
      {/* المؤشرات الأساسية - صف واحد فقط */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow cursor-pointer group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الموظفين</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalEmployees}</div>
            <p className="text-xs text-muted-foreground">موظف نشط</p>
            <Progress value={75} className="mt-2" />
            <Button 
              variant="ghost" 
              size="sm" 
              className="mt-2 w-full h-6 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => onStatClick?.('employees')}
            >
              <ChevronRight className="h-3 w-3 mr-1" />
              عرض الموظفين
            </Button>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow cursor-pointer group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الرواتب</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalSalaries.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">ريال شهرياً</p>
            <div className="mt-2 text-xs">
              <span className="text-green-600">+2.5%</span> من الشهر الماضي
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="mt-2 w-full h-6 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => onStatClick?.('employees')}
            >
              <ChevronRight className="h-3 w-3 mr-1" />
              إدارة الرواتب
            </Button>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow cursor-pointer group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">رأس المال</CardTitle>
            <Building className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalCapital.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">ريال إجمالي</p>
            <Progress value={capitalUtilization} className="mt-2" />
            <div className="mt-1 text-xs text-muted-foreground">
              استخدام: {capitalUtilization.toFixed(1)}%
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="mt-2 w-full h-6 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => onStatClick?.('financial')}
            >
              <ChevronRight className="h-3 w-3 mr-1" />
              التقارير المالية
            </Button>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500 hover:shadow-lg transition-shadow cursor-pointer group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المشاريع النشطة</CardTitle>
            <Briefcase className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeProjects}</div>
            <p className="text-xs text-muted-foreground">من إجمالي {data.totalProjects}</p>
            <Progress value={(activeProjects / Math.max(data.totalProjects, 1)) * 100} className="mt-2" />
            <Button 
              variant="ghost" 
              size="sm" 
              className="mt-2 w-full h-6 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => onStatClick?.('projects')}
            >
              <ChevronRight className="h-3 w-3 mr-1" />
              إدارة المشاريع
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* مؤشرات الأداء المتقدمة - مع تفاصيل داخلية */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-0 hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <Target className="h-5 w-5" />
              مؤشر الأداء العام (KPI)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-700 mb-2">{avgPerformance.toFixed(1)}%</div>
                <Progress value={avgPerformance} className="mb-3" />
                <Badge variant={avgPerformance >= 85 ? 'default' : avgPerformance >= 70 ? 'secondary' : 'destructive'}>
                  {avgPerformance >= 85 ? 'ممتاز' : avgPerformance >= 70 ? 'جيد' : 'يحتاج تحسين'}
                </Badge>
              </div>
              
              {/* مؤشرات فرعية */}
              <div className="space-y-3 pt-3 border-t">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Zap className="h-3 w-3 text-blue-600" />
                    <span>الإنتاجية</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-blue-700">{employeeProductivity.toFixed(1)}%</span>
                    <p className="text-xs text-muted-foreground">معامل الكفاءة</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Activity className="h-3 w-3 text-green-600" />
                    <span>معدل الحضور</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-green-700">92%</span>
                    <p className="text-xs text-muted-foreground">متوسط شهري</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-3 w-3 text-purple-600" />
                    <span>رضا الموظفين</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-purple-700">88%</span>
                    <p className="text-xs text-muted-foreground">آخر استطلاع</p>
                  </div>
                </div>
              </div>
              
              <div className="text-xs text-muted-foreground bg-white/50 p-2 rounded">
                <strong>الفائدة:</strong> يساعد في تحديد نقاط القوة والضعف، ووضع خطط التطوير المهني
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-0 hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <Award className="h-5 w-5" />
              معدل نجاح المشاريع (PSR)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-green-700 mb-2">{projectSuccessRate.toFixed(1)}%</div>
                <Progress value={projectSuccessRate} className="mb-3" />
                <div className="text-sm text-muted-foreground">
                  {completedProjects} مكتمل من {data.totalProjects} مشروع
                </div>
              </div>
              
              {/* مؤشرات فرعية */}
              <div className="space-y-3 pt-3 border-t">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-3 w-3 text-green-600" />
                    <span>ROI المشاريع</span>
                  </div>
                  <div className="text-right">
                    <span className={`font-bold ${projectROI >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                      {projectROI.toFixed(1)}%
                    </span>
                    <p className="text-xs text-muted-foreground">عائد الاستثمار</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Shield className="h-3 w-3 text-blue-600" />
                    <span>مؤشر المخاطر</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-blue-700">منخفض</span>
                    <p className="text-xs text-muted-foreground">تقييم المخاطر</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <PieChart className="h-3 w-3 text-purple-600" />
                    <span>كفاءة التكلفة</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-purple-700">{costEfficiencyRatio.toFixed(1)}%</span>
                    <p className="text-xs text-muted-foreground">نسبة التوفير</p>
                  </div>
                </div>
              </div>
              
              <div className="text-xs text-muted-foreground bg-white/50 p-2 rounded">
                <strong>الفائدة:</strong> يقيس فعالية إدارة المشاريع ويساعد في تحسين عمليات التخطيط والتنفيذ
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-100 border-0 hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-700">
              <TrendingUp className="h-5 w-5" />
              السيولة المتاحة (Liquidity)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-700 mb-2">{availableCapital.toLocaleString()}</div>
                <p className="text-sm text-muted-foreground mb-3">ريال متاح</p>
                <Progress value={Math.min(liquidityRatio, 100)} className="mb-2" />
                <Badge variant={liquidityRatio >= 100 ? 'default' : liquidityRatio >= 50 ? 'secondary' : 'destructive'}>
                  {liquidityRatio >= 100 ? 'سيولة ممتازة' : liquidityRatio >= 50 ? 'سيولة جيدة' : 'سيولة منخفضة'}
                </Badge>
              </div>
              
              {/* مؤشرات فرعية */}
              <div className="space-y-3 pt-3 border-t">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-3 w-3 text-green-600" />
                    <span>نسبة السيولة</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-green-700">{liquidityRatio.toFixed(1)}%</span>
                    <p className="text-xs text-muted-foreground">للـ 3 أشهر القادمة</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-3 w-3 text-blue-600" />
                    <span>معدل الإنفاق</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-blue-700">{((data.totalSalaries + totalProjectsCost) / data.totalCapital * 100).toFixed(1)}%</span>
                    <p className="text-xs text-muted-foreground">من رأس المال</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    {availableCapital >= 0 ? 
                      <TrendingUp className="h-3 w-3 text-green-600" /> : 
                      <TrendingDown className="h-3 w-3 text-red-600" />
                    }
                    <span>الوضع المالي</span>
                  </div>
                  <div className="text-right">
                    <span className={`font-bold ${availableCapital >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                      {availableCapital >= 0 ? 'مستقر' : 'يحتاج مراجعة'}
                    </span>
                    <p className="text-xs text-muted-foreground">التقييم الحالي</p>
                  </div>
                </div>
              </div>
              
              <div className="text-xs text-muted-foreground bg-white/50 p-2 rounded">
                <strong>الفائدة:</strong> يساعد في التخطيط المالي واتخاذ قرارات الاستثمار والتوسع
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* تنبيهات النظام */}
      {(avgPerformance < 70 || availableCapital < 0 || projectSuccessRate < 50) && (
        <Card className="border-l-4 border-l-red-500 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-5 w-5" />
              تنبيهات مهمة تتطلب انتباه فوري
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {avgPerformance < 70 && (
                <div className="flex items-center gap-2 p-3 bg-white rounded-lg border border-red-200">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <div>
                    <p className="font-medium text-red-700">أداء منخفض</p>
                    <p className="text-xs text-red-600">يحتاج تحسين عاجل</p>
                  </div>
                </div>
              )}
              {availableCapital < 0 && (
                <div className="flex items-center gap-2 p-3 bg-white rounded-lg border border-red-200">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <div>
                    <p className="font-medium text-red-700">تجاوز رأس المال</p>
                    <p className="text-xs text-red-600">مراجعة مالية مطلوبة</p>
                  </div>
                </div>
              )}
              {projectSuccessRate < 50 && (
                <div className="flex items-center gap-2 p-3 bg-white rounded-lg border border-amber-200">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <div>
                    <p className="font-medium text-amber-700">معدل نجاح منخفض</p>
                    <p className="text-xs text-amber-600">مراجعة إدارة المشاريع</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
