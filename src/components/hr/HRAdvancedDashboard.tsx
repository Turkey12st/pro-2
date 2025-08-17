import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useEmployees } from "@/hooks/useEmployees";
import { HRPermissionGate } from "./HRPermissionGate";
import {
  Users,
  TrendingUp,
  DollarSign,
  Calendar,
  Award,
  AlertTriangle,
  Clock,
  Building,
  UserCheck,
  UserX
} from 'lucide-react';

const HRAdvancedDashboard = () => {
  const { employees, isLoading } = useEmployees();

  // Calculate advanced HR metrics
  const metrics = React.useMemo(() => {
    if (!employees.length) return null;

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Employee distribution by department
    const departmentDistribution = employees.reduce((acc, emp) => {
      const dept = emp.department || 'غير محدد';
      acc[dept] = (acc[dept] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Salary analysis
    const salaries = employees.map(emp => emp.salary || 0);
    const totalSalaries = salaries.reduce((sum, salary) => sum + salary, 0);
    const avgSalary = totalSalaries / employees.length;
    const medianSalary = [...salaries].sort((a, b) => a - b)[Math.floor(salaries.length / 2)];

    // Employee tenure analysis
    const tenureAnalysis = employees.map(emp => {
      const joinDate = new Date(emp.joining_date || '');
      const yearsOfService = (now.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
      return Math.max(0, yearsOfService);
    });
    const avgTenure = tenureAnalysis.length > 0 ? tenureAnalysis.reduce((sum, tenure) => sum + tenure, 0) / employees.length : 0;

    // New hires this month
    const newHires = employees.filter(emp => {
      const joinDate = new Date(emp.joining_date || '');
      return joinDate.getMonth() === currentMonth && joinDate.getFullYear() === currentYear;
    }).length;

    // Performance distribution
    const performanceScores = employees
      .map(emp => emp.integrated_performance?.score || 0)
      .filter(score => score > 0);
    
    const avgPerformance = performanceScores.length > 0 
      ? performanceScores.reduce((sum, score) => sum + score, 0) / performanceScores.length 
      : 0;

    // Employee type distribution
    const typeDistribution = employees.reduce((acc, emp) => {
      const type = emp.employee_type || 'saudi';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Cost analysis
    const totalCosts = employees.reduce((sum, emp) => {
      return sum + (emp.financial_summary?.total_cost || emp.salary || 0);
    }, 0);

    return {
      totalEmployees: employees.length,
      departmentDistribution,
      totalSalaries,
      avgSalary,
      medianSalary,
      avgTenure,
      newHires,
      avgPerformance,
      typeDistribution,
      totalCosts,
    };
  }, [employees]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!metrics) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">لا توجد بيانات موظفين لعرض الإحصائيات</p>
        </CardContent>
      </Card>
    );
  }

  const topDepartments = Object.entries(metrics.departmentDistribution)
    .sort(([,a], [,b]) => Number(b) - Number(a))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Key Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">إجمالي الموظفين</p>
                <p className="text-3xl font-bold">{metrics.totalEmployees}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  +{metrics.newHires} هذا الشهر
                </p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <HRPermissionGate action="view" resource="salaries">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">متوسط الراتب</p>
                  <p className="text-2xl font-bold">{metrics.avgSalary.toLocaleString()} ر.س</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    الوسيط: {metrics.medianSalary.toLocaleString()} ر.س
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </HRPermissionGate>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">متوسط سنوات الخدمة</p>
                <p className="text-2xl font-bold">{metrics.avgTenure.toFixed(1)} سنة</p>
                <p className="text-xs text-muted-foreground mt-1">
                  الاستقرار الوظيفي
                </p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">متوسط الأداء</p>
                <p className="text-2xl font-bold">{metrics.avgPerformance.toFixed(1)}%</p>
                <Progress value={metrics.avgPerformance} className="mt-2" />
              </div>
              <Award className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Department & Type Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              توزيع الموظفين حسب القسم
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topDepartments.map(([dept, count]) => (
                <div key={dept} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{dept}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{String(count)} موظف</span>
                    <Progress 
                      value={(Number(count) / metrics.totalEmployees) * 100} 
                      className="w-20 h-2"
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              توزيع الموظفين حسب النوع
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(metrics.typeDistribution).map(([type, count]) => {
                const typeLabels = {
                  saudi: { label: "سعودي", color: "bg-green-500" },
                  non_saudi: { label: "غير سعودي", color: "bg-blue-500" },
                  contract: { label: "متعاقد", color: "bg-yellow-500" },
                };
                const typeInfo = typeLabels[type as keyof typeof typeLabels] || 
                                { label: type, color: "bg-gray-500" };
                
                return (
                  <div key={type} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${typeInfo.color}`}></div>
                      <span className="text-sm font-medium">{typeInfo.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{String(count)}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {((Number(count) / metrics.totalEmployees) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cost Analysis */}
      <HRPermissionGate action="view" resource="salaries">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              تحليل التكاليف
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">إجمالي الرواتب</p>
                <p className="text-2xl font-bold text-primary">
                  {metrics.totalSalaries.toLocaleString()} ر.س
                </p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">إجمالي التكاليف</p>
                <p className="text-2xl font-bold text-green-600">
                  {metrics.totalCosts.toLocaleString()} ر.س
                </p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">التكلفة لكل موظف</p>
                <p className="text-2xl font-bold text-blue-600">
                  {(metrics.totalCosts / metrics.totalEmployees).toLocaleString()} ر.س
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </HRPermissionGate>
    </div>
  );
};

export default HRAdvancedDashboard;