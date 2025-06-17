
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  DollarSign, 
  Building, 
  Briefcase, 
  TrendingUp, 
  Target,
  Award,
  AlertCircle
} from 'lucide-react';
import { useDataIntegration } from '@/hooks/useDataIntegration';

export function IntegratedDashboardStats() {
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

  return (
    <div className="space-y-6">
      {/* المؤشرات الأساسية */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الموظفين</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalEmployees}</div>
            <p className="text-xs text-muted-foreground">موظف نشط</p>
            <Progress value={75} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
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
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
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
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المشاريع النشطة</CardTitle>
            <Briefcase className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeProjects}</div>
            <p className="text-xs text-muted-foreground">من إجمالي {data.totalProjects}</p>
            <Progress value={(activeProjects / Math.max(data.totalProjects, 1)) * 100} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* مؤشرات الأداء المتقدمة */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              مؤشر الأداء العام
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-center">{avgPerformance.toFixed(1)}%</div>
            <Progress value={avgPerformance} className="mt-2" />
            <div className="mt-2 flex justify-between items-center">
              <span className="text-sm text-muted-foreground">الهدف: 85%</span>
              <Badge variant={avgPerformance >= 85 ? 'default' : 'secondary'}>
                {avgPerformance >= 85 ? 'ممتاز' : avgPerformance >= 70 ? 'جيد' : 'يحتاج تحسين'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-green-600" />
              معدل نجاح المشاريع
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-center">{projectSuccessRate.toFixed(1)}%</div>
            <Progress value={projectSuccessRate} className="mt-2" />
            <div className="mt-2 text-sm text-muted-foreground text-center">
              {completedProjects} مكتمل من {data.totalProjects} مشروع
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              السيولة المتاحة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-center">{availableCapital.toLocaleString()}</div>
            <p className="text-sm text-muted-foreground text-center">ريال متاح</p>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-xs">
                <span>رأس المال:</span>
                <span>{data.totalCapital.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>الرواتب:</span>
                <span className="text-red-600">-{data.totalSalaries.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>المشاريع:</span>
                <span className="text-red-600">-{totalProjectsCost.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* تنبيهات النظام */}
      {(avgPerformance < 70 || availableCapital < 0 || projectSuccessRate < 50) && (
        <Card className="border-l-4 border-l-red-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              تنبيهات مهمة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {avgPerformance < 70 && (
                <div className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">معدل الأداء العام منخفض - يحتاج تحسين</span>
                </div>
              )}
              {availableCapital < 0 && (
                <div className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">تجاوز في استخدام رأس المال</span>
                </div>
              )}
              {projectSuccessRate < 50 && (
                <div className="flex items-center gap-2 text-amber-600">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">معدل نجاح المشاريع منخفض</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
