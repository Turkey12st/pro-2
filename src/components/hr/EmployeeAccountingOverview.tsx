
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calculator, 
  TrendingUp, 
  Users, 
  DollarSign,
  Award,
  Briefcase,
  Target
} from 'lucide-react';
import { useEmployeeAccounting } from '@/hooks/useEmployeeAccounting';

export function EmployeeAccountingOverview() {
  const { employees, loading, updateEmployeeKPI } = useEmployeeAccounting();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="h-64 bg-gray-200 rounded animate-pulse"></div>
        ))}
      </div>
    );
  }

  const totalSalaries = employees.reduce((sum, emp) => sum + (emp.salary || 0), 0);
  const avgPerformance = employees.reduce((sum, emp) => {
    const perf = emp.employee_performance?.[0]?.performance_score || 0;
    return sum + perf;
  }, 0) / (employees.length || 1);

  const totalProjects = employees.reduce((sum, emp) => 
    sum + (emp.project_employee_assignments?.length || 0), 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الموظفين</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employees.length}</div>
            <p className="text-xs text-muted-foreground">
              موظف نشط في النظام
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الرواتب</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSalaries.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              ريال شهرياً
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">متوسط الأداء</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgPerformance.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              مؤشر الأداء العام
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المشاريع النشطة</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProjects}</div>
            <p className="text-xs text-muted-foreground">
              تخصيص نشط
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Employee Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {employees.map((employee) => {
          const performance = employee.employee_performance?.[0];
          const accounts = employee.employee_accounts || [];
          const assignments = employee.project_employee_assignments || [];
          const totalAccountBalance = accounts.reduce((sum: number, acc: any) => sum + (acc.balance || 0), 0);

          return (
            <Card key={employee.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{employee.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{employee.position}</p>
                    <p className="text-xs text-muted-foreground">{employee.department}</p>
                  </div>
                  <Badge variant="outline">
                    {employee.employment_number || 'غير محدد'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Performance Metrics */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">نقاط الأداء:</span>
                    <Badge variant={
                      (performance?.performance_score || 0) >= 80 ? 'default' :
                      (performance?.performance_score || 0) >= 60 ? 'secondary' : 'destructive'
                    }>
                      {performance?.performance_score || 0}%
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">معدل الحضور:</span>
                    <span className="text-sm font-medium">{performance?.attendance_rate || 100}%</span>
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">الراتب الشهري:</span>
                    <span className="text-sm font-bold">{employee.salary?.toLocaleString()} ريال</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">الحسابات ({accounts.length}):</span>
                    <span className="text-sm">{totalAccountBalance.toLocaleString()} ريال</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">المشاريع:</span>
                    <span className="text-sm">{assignments.length} مشروع</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => updateEmployeeKPI(employee.id)}
                  >
                    <Calculator className="h-3 w-3 mr-1" />
                    تحديث KPI
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1"
                  >
                    <TrendingUp className="h-3 w-3 mr-1" />
                    التفاصيل
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {employees.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">لا توجد بيانات موظفين لعرضها</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
