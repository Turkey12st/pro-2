
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  BarChart3,
  PieChart,
  Activity,
  AlertCircle,
  Zap,
  Star,
  Users2,
  Calendar,
  Clock
} from 'lucide-react';
import { useDataIntegration } from '@/hooks/useDataIntegration';

export function ERPDashboard() {
  const { data, loading } = useDataIntegration();

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-48 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  // حساب مؤشرات محددة للتبويبات
  const avgPerformance = data.employees.reduce((sum, emp) => {
    const perf = emp.employee_performance?.[0]?.performance_score || 0;
    return sum + perf;
  }, 0) / (data.employees.length || 1);

  const totalProjectsCost = data.projects.reduce((sum, project) => 
    sum + (project.budget || 0), 0);

  const activeProjects = data.projects.filter(p => p.status === 'in_progress').length;
  const completedProjects = data.projects.filter(p => p.status === 'completed').length;

  const totalEmployeeCosts = data.employees.reduce((sum, emp) => {
    const accounts = emp.employee_accounts || [];
    return sum + accounts.reduce((accSum: number, acc: any) => accSum + (acc.balance || 0), 0);
  }, 0);

  return (
    <div className="space-y-6">
      {/* التبويبات التفصيلية مع تصميم محسن */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 bg-gradient-to-r from-blue-50 to-purple-50 p-1 rounded-xl">
          <TabsTrigger value="overview" className="data-[state=active]:bg-white data-[state=active]:shadow-md">
            نظرة عامة
          </TabsTrigger>
          <TabsTrigger value="hr" className="data-[state=active]:bg-white data-[state=active]:shadow-md">
            الموارد البشرية
          </TabsTrigger>
          <TabsTrigger value="projects" className="data-[state=active]:bg-white data-[state=active]:shadow-md">
            المشاريع
          </TabsTrigger>
          <TabsTrigger value="financial" className="data-[state=active]:bg-white data-[state=active]:shadow-md">
            المالية
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-white data-[state=active]:shadow-md">
            التحليلات
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* معدل الأداء المختصر */}
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-indigo-700">
                  <div className="p-2 bg-indigo-500 rounded-lg">
                    <Activity className="h-5 w-5 text-white" />
                  </div>
                  ملخص الأداء العام
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-indigo-700 mb-2">{avgPerformance.toFixed(1)}%</div>
                <Progress value={avgPerformance} className="mb-3 bg-indigo-200" />
                <div className="flex justify-between text-sm">
                  <span className="text-indigo-600">الهدف: 85%</span>
                  <Badge variant={avgPerformance >= 85 ? 'default' : 'secondary'} className="text-xs">
                    {avgPerformance >= 85 ? 'ممتاز' : 'جيد'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* إحصائيات سريعة */}
            <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <div className="p-2 bg-green-500 rounded-lg">
                    <BarChart3 className="h-5 w-5 text-white" />
                  </div>
                  إحصائيات سريعة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">المشاريع المكتملة</span>
                  <span className="font-bold text-green-700">{completedProjects}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">معدل الحضور</span>
                  <span className="font-bold text-blue-700">92%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">رضا العملاء</span>
                  <span className="font-bold text-purple-700">88%</span>
                </div>
              </CardContent>
            </Card>

            {/* التكاليف الملخصة */}
            <Card className="bg-gradient-to-br from-purple-50 to-pink-100 border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-700">
                  <div className="p-2 bg-purple-500 rounded-lg">
                    <PieChart className="h-5 w-5 text-white" />
                  </div>
                  ملخص التكاليف
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">الرواتب الشهرية</span>
                  <span className="font-medium text-red-600">{data.totalSalaries.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">تكاليف المشاريع</span>
                  <span className="font-medium text-amber-600">{totalProjectsCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="font-bold text-gray-700">الصافي المتاح</span>
                  <span className="font-bold text-blue-600">
                    {(data.totalCapital - data.totalSalaries - totalProjectsCost).toLocaleString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="hr" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users2 className="h-5 w-5 text-blue-600" />
                  توزيع الموظفين حسب الأقسام
                </CardTitle>
              </CardHeader>
              <CardContent>
                {Array.from(new Set(data.employees.map(emp => emp.department))).map(dept => {
                  const deptEmployees = data.employees.filter(emp => emp.department === dept);
                  const percentage = (deptEmployees.length / data.totalEmployees) * 100;
                  
                  return (
                    <div key={dept} className="mb-4">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">{dept}</span>
                        <span className="text-sm text-gray-600">{deptEmployees.length} موظف</span>
                      </div>
                      <Progress value={percentage} className="h-3 bg-gray-200" />
                      <div className="text-xs text-gray-500 mt-1">{percentage.toFixed(1)}%</div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-600" />
                  أفضل الموظفين أداءً
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.employees
                    .sort((a, b) => {
                      const perfA = a.employee_performance?.[0]?.performance_score || 0;
                      const perfB = b.employee_performance?.[0]?.performance_score || 0;
                      return perfB - perfA;
                    })
                    .slice(0, 5)
                    .map(emp => {
                      const performance = emp.employee_performance?.[0];
                      return (
                        <div key={emp.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-800">{emp.name}</p>
                            <p className="text-xs text-gray-500">{emp.position}</p>
                          </div>
                          <Badge variant={
                            (performance?.performance_score || 0) >= 80 ? 'default' :
                            (performance?.performance_score || 0) >= 60 ? 'secondary' : 'destructive'
                          }>
                            {performance?.performance_score || 0}%
                          </Badge>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="projects" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {data.projects.slice(0, 6).map(project => (
              <Card key={project.id} className="shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span className="truncate">{project.title}</span>
                    <Badge variant={
                      project.status === 'completed' ? 'default' :
                      project.status === 'in_progress' ? 'secondary' : 'outline'
                    } className="ml-2">
                      {project.status === 'completed' ? 'مكتمل' :
                       project.status === 'in_progress' ? 'جاري' : 'مخطط'}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">التقدم</span>
                      <span className="font-medium">{project.progress || 0}%</span>
                    </div>
                    <Progress value={project.progress || 0} className="h-2" />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">الميزانية</span>
                      <span className="font-medium text-green-600">
                        {(project.budget || 0).toLocaleString()} ريال
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">الفريق</span>
                      <span className="font-medium text-blue-600">
                        {project.project_employee_assignments?.length || 0} موظف
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="financial" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  الوضع المالي التفصيلي
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="font-medium">إجمالي رأس المال</span>
                    <span className="font-bold text-green-700">
                      {data.totalCapital.toLocaleString()} ريال
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                    <span className="font-medium">الرواتب الشهرية</span>
                    <span className="font-bold text-red-600">
                      -{data.totalSalaries.toLocaleString()} ريال
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-amber-50 rounded-lg">
                    <span className="font-medium">تكاليف المشاريع</span>
                    <span className="font-bold text-amber-600">
                      -{totalProjectsCost.toLocaleString()} ريال
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border-2 border-blue-200">
                    <span className="font-bold text-lg">الصافي المتاح</span>
                    <span className="font-bold text-blue-700 text-lg">
                      {(data.totalCapital - data.totalSalaries - totalProjectsCost).toLocaleString()} ريال
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  آخر المعاملات المالية
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.financials.slice(0, 5).map(entry => (
                    <div key={entry.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-800">{entry.description}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(entry.entry_date).toLocaleDateString('ar-SA')}
                        </p>
                      </div>
                      <Badge variant={entry.status === 'posted' ? 'default' : 'secondary'}>
                        {entry.status === 'posted' ? 'مرحل' : 'مسودة'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-600" />
                  تحليل الإنتاجية المتقدم
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">معدل إنجاز المهام</span>
                    <span className="font-bold text-green-600">85%</span>
                  </div>
                  <Progress value={85} className="bg-green-100" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">معدل الحضور الشهري</span>
                    <span className="font-bold text-blue-600">92%</span>
                  </div>
                  <Progress value={92} className="bg-blue-100" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">رضا العملاء</span>
                    <span className="font-bold text-purple-600">88%</span>
                  </div>
                  <Progress value={88} className="bg-purple-100" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">كفاءة استخدام الموارد</span>
                    <span className="font-bold text-indigo-600">78%</span>
                  </div>
                  <Progress value={78} className="bg-indigo-100" />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-600" />
                  تنبيهات وتوصيات النظام
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800">انتباه مطلوب</p>
                      <p className="text-xs text-yellow-700">3 مشاريع تتطلب مراجعة عاجلة</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <Calendar className="h-4 w-4 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-800">تذكير</p>
                      <p className="text-xs text-blue-700">تقييم أداء شهري مستحق خلال أسبوع</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <Star className="h-4 w-4 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-green-800">إنجاز ممتاز</p>
                      <p className="text-xs text-green-700">اكتمال 2 مشاريع كبيرة هذا الأسبوع</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <TrendingUp className="h-4 w-4 text-purple-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-purple-800">فرصة تحسين</p>
                      <p className="text-xs text-purple-700">يمكن تحسين كفاءة الموارد بنسبة 12%</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
