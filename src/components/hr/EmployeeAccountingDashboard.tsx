
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Calculator, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Target,
  Award,
  PieChart,
  FileText
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { EmployeeAccountingService, EmployeeAccountingData } from '@/services/employeeAccountingService';

interface EmployeeAccountingDashboardProps {
  employeeId: string;
}

export function EmployeeAccountingDashboard({ employeeId }: EmployeeAccountingDashboardProps) {
  const [employeeData, setEmployeeData] = useState<EmployeeAccountingData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadEmployeeData();
  }, [employeeId]);

  const loadEmployeeData = async () => {
    try {
      setLoading(true);
      const data = await EmployeeAccountingService.getEmployeeAccountingData(employeeId);
      setEmployeeData(data);
    } catch (error) {
      console.error('Error loading employee data:', error);
      toast({
        title: 'خطأ في تحميل البيانات',
        description: 'حدث خطأ أثناء تحميل البيانات المحاسبية للموظف',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateKPI = async () => {
    try {
      await EmployeeAccountingService.updateEmployeeKPI(employeeId);
      await loadEmployeeData();
      toast({
        title: 'تم التحديث',
        description: 'تم تحديث مؤشرات الأداء بنجاح',
      });
    } catch (error) {
      toast({
        title: 'خطأ في التحديث',
        description: 'حدث خطأ أثناء تحديث مؤشرات الأداء',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!employeeData) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">لا توجد بيانات متاحة للموظف</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">{employeeData.name}</h2>
          <p className="text-muted-foreground">{employeeData.position} - {employeeData.department}</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={updateKPI} variant="outline">
            <Calculator className="h-4 w-4 mr-2" />
            تحديث مؤشرات الأداء
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">نقاط الأداء</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employeeData.performance.performance_score}%</div>
            <Progress value={employeeData.performance.performance_score} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">معدل إنجاز المهام</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employeeData.performance.task_completion_rate}%</div>
            <Progress value={employeeData.performance.task_completion_rate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">معدل الحضور</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employeeData.performance.attendance_rate}%</div>
            <Progress value={employeeData.performance.attendance_rate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الراتب الشهري</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employeeData.salary.toLocaleString()} ريال</div>
            <p className="text-xs text-muted-foreground mt-1">
              رقم الموظف: {employeeData.employment_number}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tabs */}
      <Tabs defaultValue="accounts" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="accounts">الحسابات المحاسبية</TabsTrigger>
          <TabsTrigger value="projects">المشاريع المخصصة</TabsTrigger>
          <TabsTrigger value="incentives">الحوافز والمكافآت</TabsTrigger>
          <TabsTrigger value="reports">التقارير المالية</TabsTrigger>
        </TabsList>

        <TabsContent value="accounts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                الحسابات المحاسبية
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {employeeData.accounts.map((account) => (
                  <div key={account.id} className="flex justify-between items-center p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{account.account_name}</h4>
                      <p className="text-sm text-muted-foreground">رقم الحساب: {account.account_number}</p>
                    </div>
                    <div className="text-left">
                      <Badge variant={account.account_type === 'expense' ? 'destructive' : 'secondary'}>
                        {account.account_type === 'expense' ? 'مصروف' : 
                         account.account_type === 'liability' ? 'التزام' : 'أصل'}
                      </Badge>
                      <p className="text-lg font-bold mt-1">{account.balance.toLocaleString()} ريال</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                المشاريع المخصصة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {employeeData.assignments.map((assignment) => (
                  <div key={assignment.id} className="flex justify-between items-center p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{assignment.project_title}</h4>
                      <p className="text-sm text-muted-foreground">{assignment.role_in_project}</p>
                    </div>
                    <div className="text-left">
                      <p className="text-sm">معدل الساعة: {assignment.hourly_rate} ريال</p>
                      <p className="text-sm">إجمالي الساعات: {assignment.total_hours}</p>
                      <p className="text-lg font-bold">التكلفة: {assignment.total_cost.toLocaleString()} ريال</p>
                    </div>
                  </div>
                ))}
                {employeeData.assignments.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    لا توجد مشاريع مخصصة حالياً
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="incentives" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                الحوافز والمكافآت
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {employeeData.incentives.map((incentive) => (
                  <div key={incentive.id} className="flex justify-between items-center p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">
                        {incentive.incentive_type === 'performance_bonus' ? 'مكافأة أداء' :
                         incentive.incentive_type === 'project_bonus' ? 'مكافأة مشروع' :
                         incentive.incentive_type === 'annual_bonus' ? 'مكافأة سنوية' : 
                         incentive.incentive_type}
                      </h4>
                      <p className="text-sm text-muted-foreground">{incentive.award_date}</p>
                    </div>
                    <div className="text-left">
                      <Badge variant={
                        incentive.status === 'paid' ? 'default' :
                        incentive.status === 'approved' ? 'secondary' : 'outline'
                      }>
                        {incentive.status === 'paid' ? 'مدفوع' :
                         incentive.status === 'approved' ? 'معتمد' :
                         incentive.status === 'pending' ? 'قيد المراجعة' : incentive.status}
                      </Badge>
                      <p className="text-lg font-bold mt-1">{incentive.amount.toLocaleString()} ريال</p>
                    </div>
                  </div>
                ))}
                {employeeData.incentives.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    لا توجد حوافز مسجلة
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                التقارير المالية
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">
                  اختر الفترة الزمنية لإنشاء التقرير المالي الشامل
                </p>
                <Button>
                  إنشاء تقرير مالي
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
