import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEmployees } from "@/hooks/useEmployees";
import { HRPermissionGate } from "./HRPermissionGate";
import EnhancedEmployeeTable from "./EnhancedEmployeeTable";
import EmployeeExport from "./EmployeeExport";
import EmployeeImport from "./EmployeeImport";
import { Search, Filter, Plus, Download, Upload, Users, TrendingUp } from 'lucide-react';

const EnhancedEmployeeList = () => {
  const { 
    employees, 
    filteredEmployees, 
    isLoading, 
    searchTerm, 
    setSearchTerm 
  } = useEmployees();

  const [sortBy, setSortBy] = useState<string>('name');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [filterPosition, setFilterPosition] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Get unique departments and positions for filtering
  const departments = [...new Set(employees.map(emp => emp.department).filter(Boolean))];
  const positions = [...new Set(employees.map(emp => emp.position).filter(Boolean))];

  // Enhanced filtering logic
  const enhancedFilteredEmployees = React.useMemo(() => {
    let filtered = [...filteredEmployees];

    // Filter by department
    if (filterDepartment !== 'all') {
      filtered = filtered.filter(emp => emp.department === filterDepartment);
    }

    // Filter by position
    if (filterPosition !== 'all') {
      filtered = filtered.filter(emp => emp.position === filterPosition);
    }

    // Sort employees
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name?.localeCompare(b.name || '') || 0;
        case 'salary':
          return (b.salary || 0) - (a.salary || 0);
        case 'joining_date':
          return new Date(b.joining_date || '').getTime() - new Date(a.joining_date || '').getTime();
        case 'department':
          return a.department?.localeCompare(b.department || '') || 0;
        case 'performance':
          return (b.integrated_performance?.score || 0) - (a.integrated_performance?.score || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [filteredEmployees, filterDepartment, filterPosition, sortBy]);

  // Calculate statistics
  const stats = React.useMemo(() => {
    const totalEmployees = employees.length;
    const totalSalaries = employees.reduce((sum, emp) => sum + (emp.salary || 0), 0);
    const avgSalary = totalEmployees > 0 ? totalSalaries / totalEmployees : 0;
    const newThisMonth = employees.filter(emp => {
      const joinDate = new Date(emp.joining_date || '');
      const currentMonth = new Date();
      return joinDate.getMonth() === currentMonth.getMonth() && 
             joinDate.getFullYear() === currentMonth.getFullYear();
    }).length;

    return {
      totalEmployees,
      totalSalaries,
      avgSalary,
      newThisMonth
    };
  }, [employees]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-[200px]" />
        </CardHeader>
        <CardContent className="p-6">
          <div className="mb-4 flex justify-between items-center">
            <Skeleton className="h-10 w-[300px]" />
            <Skeleton className="h-10 w-[150px]" />
          </div>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">إجمالي الموظفين</p>
                <p className="text-2xl font-bold">{stats.totalEmployees}</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">متوسط الراتب</p>
                <p className="text-2xl font-bold">{stats.avgSalary.toLocaleString()} ر.س</p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">إجمالي الرواتب</p>
                <p className="text-2xl font-bold">{stats.totalSalaries.toLocaleString()} ر.س</p>
              </div>
              <TrendingUp className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">التحاق هذا الشهر</p>
                <p className="text-2xl font-bold">{stats.newThisMonth}</p>
                <Badge variant="secondary" className="mt-1">جديد</Badge>
              </div>
              <Plus className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Employee List Card */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              إدارة الموظفين المتقدمة
            </CardTitle>
            <HRPermissionGate action="create" resource="employees">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                إضافة موظف جديد
              </Button>
            </HRPermissionGate>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {/* Search and Filter Section */}
          <div className="space-y-4 mb-6">
            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="البحث في الموظفين (الاسم، البريد، المنصب، القسم، رقم الهوية)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                تصفية متقدمة
              </Button>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="space-y-2">
                  <Label>ترتيب حسب</Label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">الاسم</SelectItem>
                      <SelectItem value="salary">الراتب</SelectItem>
                      <SelectItem value="joining_date">تاريخ الالتحاق</SelectItem>
                      <SelectItem value="department">القسم</SelectItem>
                      <SelectItem value="performance">الأداء</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>القسم</Label>
                  <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع الأقسام</SelectItem>
                      {departments.map(dept => (
                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>المنصب</Label>
                  <Select value={filterPosition} onValueChange={setFilterPosition}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع المناصب</SelectItem>
                      {positions.map(pos => (
                        <SelectItem key={pos} value={pos}>{pos}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 flex flex-col justify-end">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setFilterDepartment('all');
                      setFilterPosition('all');
                      setSortBy('name');
                      setSearchTerm('');
                    }}
                  >
                    إعادة تعيين
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Import/Export Section */}
          <div className="flex flex-wrap gap-2 mb-6">
            <HRPermissionGate action="create" resource="employees">
              <EmployeeImport />
            </HRPermissionGate>
            
            <EmployeeExport 
              employees={employees} 
              filteredEmployees={enhancedFilteredEmployees} 
            />

            <HRPermissionGate action="view" resource="employees">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                تقرير مفصل
              </Button>
            </HRPermissionGate>
          </div>

          {/* Results Summary */}
          <div className="mb-4 text-sm text-muted-foreground">
            عرض {enhancedFilteredEmployees.length} من أصل {employees.length} موظف
            {searchTerm && ` • البحث عن: "${searchTerm}"`}
            {filterDepartment !== 'all' && ` • القسم: ${filterDepartment}`}
            {filterPosition !== 'all' && ` • المنصب: ${filterPosition}`}
          </div>

          {/* Employee Table */}
          {enhancedFilteredEmployees.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium text-muted-foreground">لا توجد نتائج</p>
              <p className="text-sm text-muted-foreground">
                {searchTerm || filterDepartment !== 'all' || filterPosition !== 'all'
                  ? "لم يتم العثور على موظفين يطابقون معايير البحث"
                  : "لا توجد بيانات موظفين للعرض"}
              </p>
            </div>
          ) : (
            <EnhancedEmployeeTable employees={enhancedFilteredEmployees} />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedEmployeeList;