
import React, { useState } from 'react';
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
  Zap
} from 'lucide-react';
import { useDataIntegration } from '@/hooks/useDataIntegration';

interface IntegratedDashboardStatsProps {
  onStatClick?: (type: string) => void;
}

export function IntegratedDashboardStats({ onStatClick }: IntegratedDashboardStatsProps) {
  const { data, loading } = useDataIntegration();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-40 bg-gray-200 rounded animate-pulse"></div>
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
  const projectSuccessRate = data.projects.length > 0 ? 
    (completedProjects / data.projects.length) * 100 : 0;

  const totalProjectsCost = data.projects.reduce((sum, project) => 
    sum + (project.budget || 0), 0);

  const availableCapital = data.totalCapital - data.totalSalaries - totalProjectsCost;

  return (
    <div className="space-y-6">
      {/* المؤشرات الأساسية - تصميم احترافي أنيق */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 border-0 shadow-md hover:shadow-lg transition-all duration-300 group cursor-pointer">
          <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 rounded-full -translate-y-8 translate-x-8"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">إجمالي الموظفين</CardTitle>
            <div className="p-2 bg-blue-500 rounded-lg">
              <Users className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900 mb-1">{data.totalEmployees}</div>
            <p className="text-xs text-blue-600">موظف نشط</p>
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full mt-2 h-7 text-xs bg-white/50 hover:bg-white/80 text-blue-700 opacity-0 group-hover:opacity-100 transition-all"
              onClick={() => onStatClick?.('employees')}
            >
              <ChevronRight className="h-3 w-3 mr-1" />
              إدارة الموظفين
            </Button>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-green-50 to-emerald-100 border-0 shadow-md hover:shadow-lg transition-all duration-300 group cursor-pointer">
          <div className="absolute top-0 right-0 w-16 h-16 bg-green-500/10 rounded-full -translate-y-8 translate-x-8"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">إجمالي الرواتب</CardTitle>
            <div className="p-2 bg-green-500 rounded-lg">
              <DollarSign className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900 mb-1">{data.totalSalaries.toLocaleString()}</div>
            <p className="text-xs text-green-600">ريال شهرياً</p>
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full mt-2 h-7 text-xs bg-white/50 hover:bg-white/80 text-green-700 opacity-0 group-hover:opacity-100 transition-all"
              onClick={() => onStatClick?.('employees')}
            >
              <ChevronRight className="h-3 w-3 mr-1" />
              إدارة الرواتب
            </Button>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-purple-50 to-violet-100 border-0 shadow-md hover:shadow-lg transition-all duration-300 group cursor-pointer">
          <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/10 rounded-full -translate-y-8 translate-x-8"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-800">رأس المال</CardTitle>
            <div className="p-2 bg-purple-500 rounded-lg">
              <Building className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900 mb-1">{data.totalCapital.toLocaleString()}</div>
            <p className="text-xs text-purple-600">ريال إجمالي</p>
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full mt-2 h-7 text-xs bg-white/50 hover:bg-white/80 text-purple-700 opacity-0 group-hover:opacity-100 transition-all"
              onClick={() => onStatClick?.('financial')}
            >
              <ChevronRight className="h-3 w-3 mr-1" />
              التقارير المالية
            </Button>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-amber-50 to-orange-100 border-0 shadow-md hover:shadow-lg transition-all duration-300 group cursor-pointer">
          <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/10 rounded-full -translate-y-8 translate-x-8"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-800">المشاريع النشطة</CardTitle>
            <div className="p-2 bg-amber-500 rounded-lg">
              <Briefcase className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-900 mb-1">{activeProjects}</div>
            <p className="text-xs text-amber-600">من إجمالي {data.totalProjects}</p>
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full mt-2 h-7 text-xs bg-white/50 hover:bg-white/80 text-amber-700 opacity-0 group-hover:opacity-100 transition-all"
              onClick={() => onStatClick?.('projects')}
            >
              <ChevronRight className="h-3 w-3 mr-1" />
              إدارة المشاريع
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* المؤشرات المتقدمة - تصميم مبسط وأنيق */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* مؤشر الأداء العام */}
        <Card className="bg-gradient-to-br from-indigo-50 to-blue-50 border-0 shadow-md hover:shadow-lg transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-indigo-800">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
                <Target className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-bold">مؤشر الأداء العام</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-700 mb-2">{avgPerformance.toFixed(1)}%</div>
              <Progress value={avgPerformance} className="mb-2 bg-indigo-100 h-2" />
              <Badge variant={avgPerformance >= 85 ? 'default' : avgPerformance >= 70 ? 'secondary' : 'destructive'} 
                     className="text-xs">
                {avgPerformance >= 85 ? 'ممتاز' : avgPerformance >= 70 ? 'جيد' : 'يحتاج تحسين'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* معدل نجاح المشاريع */}
        <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-0 shadow-md hover:shadow-lg transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-green-800">
              <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg">
                <Award className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-bold">معدل نجاح المشاريع</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-700 mb-2">{projectSuccessRate.toFixed(1)}%</div>
              <Progress value={projectSuccessRate} className="mb-2 bg-green-100 h-2" />
              <div className="text-xs text-green-600 font-medium">
                {completedProjects} مكتمل من {data.totalProjects}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* السيولة المتاحة */}
        <Card className="bg-gradient-to-br from-rose-50 to-pink-50 border-0 shadow-md hover:shadow-lg transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-purple-800">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-bold">السيولة المتاحة</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-700 mb-2">{availableCapital.toLocaleString()}</div>
              <p className="text-xs text-purple-600 mb-2 font-medium">ريال متاح</p>
              <Badge variant={availableCapital >= 0 ? 'default' : 'destructive'}
                     className="text-xs">
                {availableCapital >= 0 ? 'مستقر' : 'يحتاج مراجعة'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* تنبيهات النظام - مبسطة وأنيقة */}
      {(avgPerformance < 70 || availableCapital < 0 || projectSuccessRate < 50) && (
        <Card className="border-l-4 border-l-red-500 bg-gradient-to-r from-red-50 to-orange-50 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800 text-sm">
              <AlertCircle className="h-4 w-4" />
              تنبيهات مهمة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {avgPerformance < 70 && (
                <div className="flex items-center gap-2 text-sm text-red-700">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  أداء الموظفين يحتاج تحسين عاجل
                </div>
              )}
              {availableCapital < 0 && (
                <div className="flex items-center gap-2 text-sm text-red-700">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  تجاوز في رأس المال - مراجعة مالية مطلوبة
                </div>
              )}
              {projectSuccessRate < 50 && (
                <div className="flex items-center gap-2 text-sm text-amber-700">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  معدل نجاح المشاريع منخفض - مراجعة إدارية مطلوبة
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
