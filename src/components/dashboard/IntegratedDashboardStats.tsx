
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
  RefreshCw,
  Activity,
  BarChart3,
  PieChart,
  Zap
} from 'lucide-react';
import { useDataIntegration } from '@/hooks/useDataIntegration';
import { usePermissions } from '@/hooks/usePermissions';

export function IntegratedDashboardStats() {
  const { data, loading, refreshDataIntegrity, isInitializing, lastSync } = useDataIntegration();
  const { hasPermission, isAdmin, userRole } = usePermissions();

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-32 bg-gray-200 rounded animate-pulse"></div>
        ))}
      </div>
    );
  }

  // حساب مؤشرات الأداء المتقدمة مع ضمان الترابط
  const avgPerformance = data.avgPerformance || 0;
  const activeProjects = data.activeProjects || 0;
  const completedProjects = data.completedProjects || 0;
  const projectSuccessRate = data.totalProjects > 0 ? 
    (completedProjects / data.totalProjects) * 100 : 0;

  const totalProjectsCost = data.projects.reduce((sum, project) => 
    sum + (project.budget || 0), 0);

  const availableCapital = data.availableCapital || 0;
  const capitalUtilization = data.totalCapital > 0 ? 
    ((data.totalSalaries + totalProjectsCost) / data.totalCapital) * 100 : 0;

  // تقييم صحة النظام
  const systemHealth = data.systemHealth || 'good';
  const getHealthColor = () => {
    switch (systemHealth) {
      case 'excellent': return 'text-green-600 bg-green-50 border-green-200';
      case 'good': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getHealthText = () => {
    switch (systemHealth) {
      case 'excellent': return 'ممتاز';
      case 'good': return 'جيد';
      case 'warning': return 'تحذير';
      case 'critical': return 'حرج';
      default: return 'غير محدد';
    }
  };

  return (
    <div className="space-y-6">
      {/* رأس الإحصائيات مع معلومات النظام */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-600" />
            مؤشرات الأداء المتكاملة
          </h3>
          <p className="text-sm text-muted-foreground">
            نظام ERP متكامل مع ترابط البيانات في الوقت الفعلي
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className={`${getHealthColor()} border`}>
            <Zap className="h-3 w-3 ml-1" />
            صحة النظام: {getHealthText()}
          </Badge>
          {lastSync && (
            <span className="text-xs text-muted-foreground">
              آخر تحديث: {lastSync.toLocaleTimeString('ar-SA')}
            </span>
          )}
          {(isAdmin() || hasPermission('view_analytics')) && (
            <Button
              variant="outline"
              size="sm"
              onClick={refreshDataIntegrity}
              disabled={isInitializing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isInitializing ? 'animate-spin' : ''}`} />
              {isInitializing ? 'جاري التحديث...' : 'تحديث البيانات'}
            </Button>
          )}
        </div>
      </div>

      {/* المؤشرات الأساسية */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الموظفين</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalEmployees}</div>
            <p className="text-xs text-muted-foreground">موظف نشط</p>
            <Progress value={Math.min((data.totalEmployees / 100) * 100, 100)} className="mt-2" />
            <div className="mt-2 text-xs">
              <span className="text-blue-600">معدل الأداء: {avgPerformance.toFixed(1)}%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الرواتب</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalSalaries.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">ريال شهرياً</p>
            <div className="mt-2 text-xs">
              <span className="text-green-600">متوسط الراتب: {(data.totalSalaries / Math.max(data.totalEmployees, 1)).toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 hover:shadow-md transition-shadow">
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

        <Card className="border-l-4 border-l-amber-500 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المشاريع النشطة</CardTitle>
            <Briefcase className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeProjects}</div>
            <p className="text-xs text-muted-foreground">من إجمالي {data.totalProjects}</p>
            <Progress value={(activeProjects / Math.max(data.totalProjects, 1)) * 100} className="mt-2" />
            <div className="mt-1 text-xs text-muted-foreground">
              مكتمل: {completedProjects}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* مؤشرات الأداء المتقدمة */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="hover:shadow-md transition-shadow">
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
              <Badge variant={avgPerformance >= 85 ? 'default' : avgPerformance >= 70 ? 'secondary' : 'destructive'}>
                {avgPerformance >= 85 ? 'ممتاز' : avgPerformance >= 70 ? 'جيد' : 'يحتاج تحسين'}
              </Badge>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              بناءً على {data.totalEmployees} موظف
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-green-600" />
              معدل نجاح المشاريع
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-center">{projectSuccessRate.toFixed(1)}%</div>
            <Progress value={projectSuccessRate} className="mt-2" />
            <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
              <div className="text-center">
                <div className="font-semibold text-green-600">{completedProjects}</div>
                <div className="text-xs text-muted-foreground">مكتمل</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-blue-600">{activeProjects}</div>
                <div className="text-xs text-muted-foreground">نشط</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
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
                <span className="text-green-600">{data.totalCapital.toLocaleString()}</span>
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
            <div className="mt-2">
              <Badge variant={availableCapital >= 0 ? 'default' : 'destructive'}>
                {availableCapital >= 0 ? 'سيولة جيدة' : 'نقص سيولة'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* تحليلات متقدمة للمصرح لهم */}
      {(isAdmin() || hasPermission('view_analytics')) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-indigo-600" />
                تحليل التوزيع
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">توزيع الرواتب</span>
                  <span className="text-sm font-medium">{((data.totalSalaries / data.totalCapital) * 100).toFixed(1)}%</span>
                </div>
                <Progress value={(data.totalSalaries / data.totalCapital) * 100} />
                
                <div className="flex justify-between items-center">
                  <span className="text-sm">تكاليف المشاريع</span>
                  <span className="text-sm font-medium">{((totalProjectsCost / data.totalCapital) * 100).toFixed(1)}%</span>
                </div>
                <Progress value={(totalProjectsCost / data.totalCapital) * 100} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-orange-600" />
                كفاءة الموارد
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">{((data.totalEmployees / data.totalProjects) || 0).toFixed(1)}</div>
                  <div className="text-xs text-muted-foreground">موظف/مشروع</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">{((data.totalSalaries / data.totalEmployees) || 0).toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">متوسط الراتب</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">{((totalProjectsCost / Math.max(data.totalProjects, 1)) || 0).toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">متوسط تكلفة مشروع</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600">{projectSuccessRate.toFixed(0)}%</div>
                  <div className="text-xs text-muted-foreground">معدل النجاح</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* تنبيهات النظام */}
      {(avgPerformance < 70 || availableCapital < 0 || projectSuccessRate < 50 || systemHealth === 'warning' || systemHealth === 'critical') && (
        <Card className="border-l-4 border-l-red-500 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              تنبيهات النظام
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {avgPerformance < 70 && (
                <div className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">معدل الأداء العام منخفض - يحتاج تحسين فوري</span>
                </div>
              )}
              {availableCapital < 0 && (
                <div className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">تجاوز في استخدام رأس المال - مراجعة عاجلة مطلوبة</span>
                </div>
              )}
              {projectSuccessRate < 50 && (
                <div className="flex items-center gap-2 text-amber-600">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">معدل نجاح المشاريع منخفض - تحسين العمليات مطلوب</span>
                </div>
              )}
              {(systemHealth === 'warning' || systemHealth === 'critical') && (
                <div className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">صحة النظام في حالة {getHealthText()} - تدخل فوري مطلوب</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* معلومات المستخدم والصلاحيات */}
      <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium">مستخدم نشط: {userRole === 'admin' ? 'الإدمن الرئيسي' : userRole}</span>
            </div>
            <div className="text-xs text-muted-foreground">
              عدد المستخدمين النشطين: {data.totalEmployees || 1}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
