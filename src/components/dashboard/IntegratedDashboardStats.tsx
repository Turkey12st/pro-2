
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
  ChevronDown,
  ChevronUp,
  Clock,
  BarChart3,
  PieChart,
  UserCheck,
  Calendar as CalendarIcon,
  Star,
  Activity
} from 'lucide-react';
import { useDataIntegration } from '@/hooks/useDataIntegration';

interface IntegratedDashboardStatsProps {
  onStatClick?: (type: string) => void;
}

export function IntegratedDashboardStats({ onStatClick }: IntegratedDashboardStatsProps) {
  const { data, loading } = useDataIntegration();
  const [expandedPerformance, setExpandedPerformance] = useState(false);
  const [expandedProjectSuccess, setExpandedProjectSuccess] = useState(false);
  const [expandedLiquidity, setExpandedLiquidity] = useState(false);

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

  // التاريخ الميلادي والهجري
  const currentDate = new Date();
  const gregorianDate = currentDate.toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // تاريخ هجري تقريبي (يمكن تحسينه باستخدام مكتبة متخصصة)
  const hijriDate = currentDate.toLocaleDateString('ar-SA-u-ca-islamic', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const currentTime = currentDate.toLocaleTimeString('ar-SA', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="space-y-6">
      {/* الهيدر المحسن مع التاريخ والوقت */}
      <div className="flex justify-between items-center bg-white border rounded-lg p-3 shadow-sm">
        <div className="flex flex-col gap-1 text-gray-600">
          <div className="flex items-center gap-2 text-sm">
            <CalendarIcon className="h-3 w-3" />
            <span>{gregorianDate}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>{hijriDate}</span>
          </div>
        </div>
        <div className="text-center flex-1">
          <h1 className="text-lg font-bold text-gray-800">لوحة التحكم المتكاملة</h1>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <Clock className="h-3 w-3" />
          <span className="text-sm">{currentTime}</span>
        </div>
      </div>

      {/* المؤشرات الأساسية */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300 group cursor-pointer bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">إجمالي الموظفين</CardTitle>
            <Users className="h-3 w-3 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 mb-1">{data.totalEmployees}</div>
            <p className="text-xs text-gray-500">موظف نشط</p>
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full mt-2 h-7 text-xs bg-gray-50 hover:bg-gray-100 text-gray-700 opacity-0 group-hover:opacity-100 transition-all"
              onClick={() => onStatClick?.('employees')}
            >
              <ChevronRight className="h-3 w-3 mr-1" />
              إدارة الموظفين
            </Button>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300 group cursor-pointer bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">إجمالي الرواتب</CardTitle>
            <DollarSign className="h-3 w-3 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 mb-1">{data.totalSalaries.toLocaleString()}</div>
            <p className="text-xs text-gray-500">ريال شهرياً</p>
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full mt-2 h-7 text-xs bg-gray-50 hover:bg-gray-100 text-gray-700 opacity-0 group-hover:opacity-100 transition-all"
              onClick={() => onStatClick?.('employees')}
            >
              <ChevronRight className="h-3 w-3 mr-1" />
              إدارة الرواتب
            </Button>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300 group cursor-pointer bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">رأس المال</CardTitle>
            <Building className="h-3 w-3 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 mb-1">{data.totalCapital.toLocaleString()}</div>
            <p className="text-xs text-gray-500">ريال إجمالي</p>
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full mt-2 h-7 text-xs bg-gray-50 hover:bg-gray-100 text-gray-700 opacity-0 group-hover:opacity-100 transition-all"
              onClick={() => onStatClick?.('financial')}
            >
              <ChevronRight className="h-3 w-3 mr-1" />
              التقارير المالية
            </Button>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300 group cursor-pointer bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">المشاريع النشطة</CardTitle>
            <Briefcase className="h-3 w-3 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 mb-1">{activeProjects}</div>
            <p className="text-xs text-gray-500">من إجمالي {data.totalProjects}</p>
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full mt-2 h-7 text-xs bg-gray-50 hover:bg-gray-100 text-gray-700 opacity-0 group-hover:opacity-100 transition-all"
              onClick={() => onStatClick?.('projects')}
            >
              <ChevronRight className="h-3 w-3 mr-1" />
              إدارة المشاريع
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* المؤشرات المتقدمة مع القوائم المنسدلة */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* مؤشر الأداء العام */}
        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300 bg-white">
          <CardHeader 
            className="pb-3 cursor-pointer" 
            onClick={() => setExpandedPerformance(!expandedPerformance)}
          >
            <CardTitle className="flex items-center justify-between text-gray-800">
              <div className="flex items-center gap-2">
                <Target className={`h-3 w-3 ${
                  avgPerformance >= 85 ? 'text-green-600' : 
                  avgPerformance >= 70 ? 'text-yellow-600' : 'text-red-600'
                }`} />
                <span className="text-sm font-bold">مؤشر الأداء العام</span>
              </div>
              {expandedPerformance ? 
                <ChevronUp className="h-3 w-3 text-gray-500" /> : 
                <ChevronDown className="h-3 w-3 text-gray-500" />
              }
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className={`text-3xl font-bold mb-2 ${
                avgPerformance >= 85 ? 'text-green-700' : 
                avgPerformance >= 70 ? 'text-yellow-700' : 'text-red-700'
              }`}>{avgPerformance.toFixed(1)}%</div>
              <Progress value={avgPerformance} className="mb-2 bg-gray-100 h-2" />
              <Badge variant={avgPerformance >= 85 ? 'default' : avgPerformance >= 70 ? 'secondary' : 'destructive'} 
                     className="text-xs">
                {avgPerformance >= 85 ? 'ممتاز' : avgPerformance >= 70 ? 'جيد' : 'يحتاج تحسين'}
              </Badge>
            </div>
            
            {expandedPerformance && (
              <div className="mt-4 pt-4 border-t space-y-3">
                <div className="text-sm text-gray-600">
                  <div className="flex justify-between mb-1">
                    <span>معدل الحضور</span>
                    <span className="font-medium">92%</span>
                  </div>
                  <Progress value={92} className="h-1 mb-3" />
                  
                  <div className="flex justify-between mb-1">
                    <span>إنجاز المهام</span>
                    <span className="font-medium">85%</span>
                  </div>
                  <Progress value={85} className="h-1 mb-3" />
                  
                  <div className="flex justify-between mb-1">
                    <span>رضا العملاء</span>
                    <span className="font-medium">88%</span>
                  </div>
                  <Progress value={88} className="h-1" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* معدل نجاح المشاريع */}
        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300 bg-white">
          <CardHeader 
            className="pb-3 cursor-pointer"
            onClick={() => setExpandedProjectSuccess(!expandedProjectSuccess)}
          >
            <CardTitle className="flex items-center justify-between text-gray-800">
              <div className="flex items-center gap-2">
                <Award className="h-3 w-3 text-gray-600" />
                <span className="text-sm font-bold">معدل نجاح المشاريع</span>
              </div>
              {expandedProjectSuccess ? 
                <ChevronUp className="h-3 w-3 text-gray-500" /> : 
                <ChevronDown className="h-3 w-3 text-gray-500" />
              }
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-700 mb-2">{projectSuccessRate.toFixed(1)}%</div>
              <Progress value={projectSuccessRate} className="mb-2 bg-gray-100 h-2" />
              <div className="text-xs text-gray-600 font-medium">
                {completedProjects} مكتمل من {data.totalProjects}
              </div>
            </div>

            {expandedProjectSuccess && (
              <div className="mt-4 pt-4 border-t space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">مشاريع نشطة</span>
                  <span className="font-medium text-gray-800">{activeProjects}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">مشاريع مكتملة</span>
                  <span className="font-medium text-gray-800">{completedProjects}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">مشاريع متأخرة</span>
                  <span className="font-medium text-gray-800">
                    {data.projects.filter(p => p.status === 'on_hold').length}
                  </span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t">
                  <span className="text-gray-600">إجمالي الميزانية</span>
                  <span className="font-medium text-gray-800">{totalProjectsCost.toLocaleString()} ريال</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* السيولة المتاحة */}
        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300 bg-white">
          <CardHeader 
            className="pb-3 cursor-pointer"
            onClick={() => setExpandedLiquidity(!expandedLiquidity)}
          >
            <CardTitle className="flex items-center justify-between text-gray-800">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-3 w-3 text-gray-600" />
                <span className="text-sm font-bold">السيولة المتاحة</span>
              </div>
              {expandedLiquidity ? 
                <ChevronUp className="h-3 w-3 text-gray-500" /> : 
                <ChevronDown className="h-3 w-3 text-gray-500" />
              }
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-700 mb-2">{availableCapital.toLocaleString()}</div>
              <p className="text-xs text-gray-600 mb-2 font-medium">ريال متاح</p>
              <Badge variant={availableCapital >= 0 ? 'default' : 'destructive'}
                     className="text-xs">
                {availableCapital >= 0 ? 'مستقر' : 'يحتاج مراجعة'}
              </Badge>
            </div>

            {expandedLiquidity && (
              <div className="mt-4 pt-4 border-t space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">رأس المال الإجمالي</span>
                  <span className="font-medium text-gray-800">{data.totalCapital.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">الرواتب الشهرية</span>
                  <span className="font-medium text-red-600">-{data.totalSalaries.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">تكاليف المشاريع</span>
                  <span className="font-medium text-red-600">-{totalProjectsCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t font-medium">
                  <span className="text-gray-700">الصافي المتبقي</span>
                  <span className={availableCapital >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {availableCapital.toLocaleString()} ريال
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* تنبيهات النظام */}
      {(avgPerformance < 70 || availableCapital < 0 || projectSuccessRate < 50) && (
        <Card className="border-l-4 border-l-red-500 bg-red-50 shadow-sm border border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800 text-sm">
              <AlertCircle className="h-3 w-3" />
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
