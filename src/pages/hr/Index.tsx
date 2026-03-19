import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { 
  LayoutDashboard, Users, Clock, Plus, FileSpreadsheet, 
  Upload, UserPlus, Wallet, ShieldCheck, TrendingUp,
  Calendar, BarChart3, Briefcase
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import EnhancedEmployeeList from "@/components/hr/EnhancedEmployeeList";
import EmployeeForm from "@/components/hr/EmployeeForm";
import { AttendanceManagement } from "@/components/hr/AttendanceManagement";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

export default function HRPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const { data: employees = [], isLoading } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      const { data, error } = await supabase.from("employees").select("*");
      if (error) throw error;
      return data || [];
    },
  });

  // Stats
  const totalEmployees = employees.length;
  const totalSalaries = employees.reduce((s, e) => s + (e.salary || 0), 0);
  const totalGosi = employees.reduce((s, e) => s + (e.employee_gosi_contribution || 0) + (e.company_gosi_contribution || 0), 0);
  const now = new Date();
  const newThisMonth = employees.filter(e => {
    const d = new Date(e.created_at);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const activeCount = employees.filter(e => e.is_active).length;
  const saudiCount = employees.filter(e => e.nationality === 'سعودي' || e.employee_type === 'saudi').length;
  const nonSaudiCount = totalEmployees - saudiCount;
  const saudiPercentage = totalEmployees > 0 ? Math.round((saudiCount / totalEmployees) * 100) : 0;

  // Department breakdown
  const deptMap = employees.reduce((acc, e) => {
    const d = e.department || 'غير محدد';
    acc[d] = (acc[d] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const departments = Object.entries(deptMap).sort((a, b) => b[1] - a[1]);

  const fmt = (n: number) => n.toLocaleString('ar-SA');

  const handleExport = async () => {
    try {
      const { data, error } = await supabase.from("employees").select("*");
      if (error) throw error;
      if (!data?.length) { toast({ title: "لا توجد بيانات", variant: "destructive" }); return; }
      const headers = ['الاسم', 'المنصب', 'القسم', 'الجنسية', 'الراتب', 'تاريخ الالتحاق', 'البريد', 'الهاتف'];
      const rows = data.map(e => [e.name, e.position, e.department, e.nationality, e.salary, e.joining_date, e.email, e.phone].join(','));
      const csv = '\uFEFF' + [headers.join(','), ...rows].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `employees_${format(new Date(), 'yyyy-MM-dd')}.csv`;
      a.click(); URL.revokeObjectURL(url);
      toast({ title: "تم التصدير بنجاح" });
    } catch { toast({ title: "خطأ في التصدير", variant: "destructive" }); }
  };

  return (
    <div className="page-container" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Briefcase className="h-7 w-7 text-primary" />
            إدارة الموارد البشرية
          </h1>
          <p className="text-muted-foreground mt-1">
            {format(new Date(), 'EEEE، d MMMM yyyy', { locale: ar })}
            {' · '}{totalEmployees} موظف مسجل
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" /> إضافة موظف
          </Button>
          <Button variant="outline" onClick={handleExport} className="gap-2">
            <FileSpreadsheet className="h-4 w-4" /> تصدير
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 mb-6 h-12">
          <TabsTrigger value="dashboard" className="gap-2 text-sm">
            <LayoutDashboard className="h-4 w-4" /> لوحة التحكم
          </TabsTrigger>
          <TabsTrigger value="employees" className="gap-2 text-sm">
            <Users className="h-4 w-4" /> الموظفون
          </TabsTrigger>
          <TabsTrigger value="attendance" className="gap-2 text-sm">
            <Clock className="h-4 w-4" /> الحضور والانصراف
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-0 shadow-sm bg-gradient-to-br from-primary/5 to-primary/10">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">إجمالي الموظفين</p>
                    <p className="text-3xl font-bold text-foreground">{totalEmployees}</p>
                    <p className="text-xs text-muted-foreground">{activeCount} نشط</p>
                  </div>
                  <div className="p-3 rounded-xl bg-primary/10">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-gradient-to-br from-info/5 to-info/10">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">التحاق هذا الشهر</p>
                    <p className="text-3xl font-bold text-foreground">{newThisMonth}</p>
                    <p className="text-xs text-muted-foreground">
                      {newThisMonth > 0 ? 'موظفون جدد' : 'لا يوجد جديد'}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-info/10">
                    <UserPlus className="h-5 w-5 text-info" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-gradient-to-br from-success/5 to-success/10">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">إجمالي الرواتب</p>
                    <p className="text-3xl font-bold text-foreground">{fmt(totalSalaries)}</p>
                    <p className="text-xs text-muted-foreground">ريال شهرياً</p>
                  </div>
                  <div className="p-3 rounded-xl bg-success/10">
                    <Wallet className="h-5 w-5 text-success" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-gradient-to-br from-warning/5 to-warning/10">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">التأمينات الاجتماعية</p>
                    <p className="text-3xl font-bold text-foreground">{fmt(totalGosi)}</p>
                    <p className="text-xs text-muted-foreground">اشتراكات GOSI</p>
                  </div>
                  <div className="p-3 rounded-xl bg-warning/10">
                    <ShieldCheck className="h-5 w-5 text-warning" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Second Row: Department & Saudization */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Saudization */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" /> نسبة التوطين (نطاقات)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">سعوديون</span>
                    <span className="text-sm font-bold">{saudiCount} ({saudiPercentage}%)</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${saudiPercentage}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">غير سعوديين</span>
                    <span className="text-sm font-bold">{nonSaudiCount} ({100 - saudiPercentage}%)</span>
                  </div>
                  <div className="mt-4 p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground">
                    {saudiPercentage >= 40 
                      ? '✅ النسبة متوافقة مع متطلبات نطاقات (النطاق الأخضر)'
                      : '⚠️ يُنصح بزيادة نسبة التوطين للامتثال لمتطلبات نطاقات'}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Department Breakdown */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-primary" /> توزيع الأقسام
                </CardTitle>
              </CardHeader>
              <CardContent>
                {departments.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">لا توجد بيانات</p>
                ) : (
                  <div className="space-y-3">
                    {departments.slice(0, 6).map(([dept, count]) => (
                      <div key={dept} className="flex items-center justify-between">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <span className="text-sm truncate">{dept}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-24 bg-muted rounded-full h-2 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-primary/60"
                              style={{ width: `${(count / totalEmployees) * 100}%` }}
                            />
                          </div>
                          <Badge variant="secondary" className="text-xs min-w-[40px] justify-center">
                            {count}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-foreground">
                  {totalEmployees > 0 ? fmt(Math.round(totalSalaries / totalEmployees)) : 0}
                </p>
                <p className="text-xs text-muted-foreground mt-1">متوسط الراتب (ريال)</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-foreground">{departments.length}</p>
                <p className="text-xs text-muted-foreground mt-1">أقسام</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-foreground">{fmt(totalSalaries + totalGosi)}</p>
                <p className="text-xs text-muted-foreground mt-1">التكلفة الإجمالية</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-foreground">{saudiPercentage}%</p>
                <p className="text-xs text-muted-foreground mt-1">نسبة السعودة</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Employees Tab */}
        <TabsContent value="employees">
          <EnhancedEmployeeList />
        </TabsContent>

        {/* Attendance Tab */}
        <TabsContent value="attendance">
          <AttendanceManagement />
        </TabsContent>
      </Tabs>

      {/* Add Employee Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>إضافة موظف جديد</DialogTitle>
            <DialogDescription>قم بإدخال بيانات الموظف الجديد</DialogDescription>
          </DialogHeader>
          <EmployeeForm onSuccess={() => setIsAddDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
