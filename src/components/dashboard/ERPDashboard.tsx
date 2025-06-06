
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  DollarSign, 
  Building, 
  Briefcase, 
  TrendingUp, 
  Target,
  BarChart3,
  PieChart,
  Activity,
  AlertCircle
} from 'lucide-react';
import { useDataIntegration } from '@/hooks/useDataIntegration';

export function ERPDashboard() {
  const { data, loading } = useDataIntegration();

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-48 bg-gray-200 rounded animate-pulse"></div>
        ))}
      </div>
    );
  }

  // حساب مؤشرات الأداء الرئيسية (KPIs)
  const avgPerformance = data.employees.reduce((sum, emp) => {
    const perf = emp.employee_performance?.[0]?.performance_score || 0;
    return sum + perf;
  }, 0) / (data.employees.length || 1);

  const totalProjectsCost = data.projects.reduce((sum, project) => 
    sum + (project.budget || 0), 0);

  const activeProjects = data.projects.filter(p => p.status === 'in_progress').length;
  const completedProjects = data.projects.filter(p => p.status === 'completed').length;
  const projectSuccessRate = data.projects.length > 0 ? 
    (completedProjects / data.projects.length) * 100 : 0;

  const totalEmployeeCosts = data.employees.reduce((sum, emp) => {
    const accounts = emp.employee_accounts || [];
    return sum + accounts.reduce((accSum: number, acc: any) => accSum + (acc.balance || 0), 0);
  }, 0);

  return (
    <div className="space-y-6">
      {/* مؤشرات الأداء الرئيسية */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الموظفين</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalEmployees}</div>
            <p className="text-xs text-muted-foreground">
              نشط في النظام
            </p>
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
            <p className="text-xs text-muted-foreground">
              ريال شهرياً
            </p>
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
            <p className="text-xs text-muted-foreground">
              ريال إجمالي
            </p>
            <Progress value={85} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المشاريع النشطة</CardTitle>
            <Briefcase className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeProjects}</div>
            <p className="text-xs text-muted-foreground">
              من إجمالي {data.totalProjects}
            </p>
            <Progress value={(activeProjects / data.totalProjects) * 100} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* التبويبات التفصيلية */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="hr">الموارد البشرية</TabsTrigger>
          <TabsTrigger value="projects">المشاريع</TabsTrigger>
          <TabsTrigger value="financial">المالية</TabsTrigger>
          <TabsTrigger value="analytics">التحليلات</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* معدل الأداء العام */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  معدل الأداء العام
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{avgPerformance.toFixed(1)}%</div>
                <Progress value={avgPerformance} className="mt-2" />
                <div className="mt-2 flex justify-between text-xs">
                  <span>الهدف: 85%</span>
                  <Badge variant={avgPerformance >= 85 ? 'default' : 'secondary'}>
                    {avgPerformance >= 85 ? 'ممتاز' : 'جيد'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* معدل نجاح المشاريع */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  معدل نجاح المشاريع
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{projectSuccessRate.toFixed(1)}%</div>
                <Progress value={projectSuccessRate} className="mt-2" />
                <div className="mt-2 text-xs text-muted-foreground">
                  {completedProjects} مكتمل من {data.totalProjects}
                </div>
              </CardContent>
            </Card>

            {/* التكاليف الإجمالية */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  التكاليف الإجمالية
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">رواتب الموظفين:</span>
                    <span className="font-medium">{data.totalSalaries.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">تكاليف المشاريع:</span>
                    <span className="font-medium">{totalProjectsCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">تكاليف أخرى:</span>
                    <span className="font-medium">{totalEmployeeCosts.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="hr" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>توزيع الموظفين حسب الأقسام</CardTitle>
              </CardHeader>
              <CardContent>
                {/* تجميع الموظفين حسب القسم */}
                {Array.from(new Set(data.employees.map(emp => emp.department))).map(dept => {
                  const deptEmployees = data.employees.filter(emp => emp.department === dept);
                  const percentage = (deptEmployees.length / data.totalEmployees) * 100;
                  
                  return (
                    <div key={dept} className="mb-3">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">{dept}</span>
                        <span className="text-sm">{deptEmployees.length} موظف</span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>مؤشرات الأداء للموظفين</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.employees.slice(0, 5).map(emp => {
                    const performance = emp.employee_performance?.[0];
                    return (
                      <div key={emp.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{emp.name}</p>
                          <p className="text-xs text-muted-foreground">{emp.position}</p>
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

        <TabsContent value="projects" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.projects.slice(0, 6).map(project => (
              <Card key={project.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{project.title}</CardTitle>
                  <Badge variant={
                    project.status === 'completed' ? 'default' :
                    project.status === 'in_progress' ? 'secondary' : 'outline'
                  }>
                    {project.status === 'completed' ? 'مكتمل' :
                     project.status === 'in_progress' ? 'قيد التنفيذ' : 'مخطط'}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">التقدم:</span>
                      <span className="font-medium">{project.progress || 0}%</span>
                    </div>
                    <Progress value={project.progress || 0} />
                    <div className="flex justify-between">
                      <span className="text-sm">الميزانية:</span>
                      <span className="font-medium">{(project.budget || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">الفريق:</span>
                      <span className="font-medium">
                        {project.project_employee_assignments?.length || 0} موظف
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="financial" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  الوضع المالي
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>إجمالي رأس المال</span>
                    <span className="font-bold text-green-600">
                      {data.totalCapital.toLocaleString()} ريال
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>الرواتب الشهرية</span>
                    <span className="font-bold text-red-600">
                      -{data.totalSalaries.toLocaleString()} ريال
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>تكاليف المشاريع</span>
                    <span className="font-bold text-amber-600">
                      -{totalProjectsCost.toLocaleString()} ريال
                    </span>
                  </div>
                  <hr />
                  <div className="flex justify-between items-center">
                    <span className="font-bold">الصافي</span>
                    <span className="font-bold text-blue-600">
                      {(data.totalCapital - data.totalSalaries - totalProjectsCost).toLocaleString()} ريال
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>آخر المعاملات المالية</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.financials.slice(0, 5).map(entry => (
                    <div key={entry.id} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{entry.description}</p>
                        <p className="text-xs text-muted-foreground">
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

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  تحليل الإنتاجية
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>معدل إنجاز المهام</span>
                    <span className="font-bold">85%</span>
                  </div>
                  <Progress value={85} />
                  
                  <div className="flex justify-between">
                    <span>معدل الحضور</span>
                    <span className="font-bold">92%</span>
                  </div>
                  <Progress value={92} />
                  
                  <div className="flex justify-between">
                    <span>رضا العملاء</span>
                    <span className="font-bold">88%</span>
                  </div>
                  <Progress value={88} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  تنبيهات النظام
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm">انتباه: 3 مشاريع تتطلب مراجعة</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-blue-50 rounded">
                    <AlertCircle className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">معلومات: تقييم أداء شهري مستحق</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-green-50 rounded">
                    <AlertCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">نجاح: اكتمال 2 مشاريع هذا الأسبوع</span>
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
