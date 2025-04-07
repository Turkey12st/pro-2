
import React, { useState, useEffect } from "react";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { 
  Table, TableBody, TableCaption, TableCell, 
  TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { format } from "date-fns";
import { 
  Download, FileText, Plus, AlertCircle, 
  CheckCircle2, FileInput, FileOutput
} from "lucide-react";
import { formatNumber } from "@/lib/utils";
import { PayrollSummary } from "./components/PayrollSummary";
import { Skeleton } from "@/components/ui/skeleton";

interface SalaryRecord {
  id: string;
  employee_id: string;
  payment_date: string;
  base_salary: number;
  housing_allowance: number;
  transportation_allowance: number;
  other_allowances: any[];
  deductions: any[];
  gosi_subscription: number;
  total_salary: number;
  status: string;
  created_at: string;
  employee_name?: string;
}

interface Employee {
  id: string;
  name: string;
  position: string;
  department: string;
  salary: number;
}

export default function PayrollPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("current");

  // Query to fetch salary records
  const { data: salaryRecords, isLoading: isLoadingSalaries } = useQuery({
    queryKey: ["salaries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("salary_records")
        .select("*")
        .order("payment_date", { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  // Query to fetch employees to join with salary records
  const { data: employees, isLoading: isLoadingEmployees } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employees")
        .select("id, name, position, department, salary");
      
      if (error) throw error;
      return data || [];
    }
  });

  // Join salary records with employee info
  const enrichedSalaryRecords = React.useMemo(() => {
    if (!salaryRecords || !employees) return [];
    
    const employeeMap = new Map();
    employees.forEach(emp => employeeMap.set(emp.id, emp));
    
    return salaryRecords.map(record => {
      const employee = employeeMap.get(record.employee_id);
      return {
        ...record,
        employee_name: employee?.name || 'موظف غير معروف'
      };
    });
  }, [salaryRecords, employees]);

  // Group salary records by payment date
  const salaryByPaymentDate = React.useMemo(() => {
    if (!enrichedSalaryRecords.length) return new Map();
    
    const grouped = new Map();
    
    enrichedSalaryRecords.forEach(record => {
      if (!grouped.has(record.payment_date)) {
        grouped.set(record.payment_date, []);
      }
      grouped.get(record.payment_date).push(record);
    });
    
    return grouped;
  }, [enrichedSalaryRecords]);

  // Get the current/latest salary batch
  const currentSalaryBatch = React.useMemo(() => {
    if (salaryByPaymentDate.size === 0) return null;
    
    const dates = Array.from(salaryByPaymentDate.keys()).sort((a, b) => 
      new Date(b).getTime() - new Date(a).getTime()
    );
    
    return {
      date: dates[0],
      records: salaryByPaymentDate.get(dates[0]) || []
    };
  }, [salaryByPaymentDate]);

  // Calculate payroll summary
  const calculatePayrollSummary = (records: SalaryRecord[]) => {
    if (!records || !records.length) return {
      totalEmployees: 0,
      totalBaseSalary: 0,
      totalAllowances: 0,
      totalDeductions: 0,
      totalGosi: 0,
      totalNetSalary: 0
    };
    
    return records.reduce((acc, record) => {
      const totalAllowances = (record.housing_allowance || 0) + 
                             (record.transportation_allowance || 0) + 
                             (Array.isArray(record.other_allowances) 
                                ? record.other_allowances.reduce((sum, a) => sum + (a.amount || 0), 0) 
                                : 0);
      
      const totalDeductions = Array.isArray(record.deductions) 
                            ? record.deductions.reduce((sum, d) => sum + (d.amount || 0), 0) 
                            : 0;
      
      return {
        totalEmployees: acc.totalEmployees + 1,
        totalBaseSalary: acc.totalBaseSalary + (record.base_salary || 0),
        totalAllowances: acc.totalAllowances + totalAllowances,
        totalDeductions: acc.totalDeductions + totalDeductions,
        totalGosi: acc.totalGosi + (record.gosi_subscription || 0),
        totalNetSalary: acc.totalNetSalary + (record.total_salary || 0)
      };
    }, {
      totalEmployees: 0,
      totalBaseSalary: 0,
      totalAllowances: 0,
      totalDeductions: 0,
      totalGosi: 0,
      totalNetSalary: 0
    });
  };

  const currentSummary = currentSalaryBatch 
    ? calculatePayrollSummary(currentSalaryBatch.records)
    : null;

  const handleGeneratePayroll = () => {
    toast({
      title: "جاري إنشاء كشف الرواتب",
      description: "سيتم إنشاء كشف الرواتب للشهر الحالي"
    });
  };

  const handleDownloadPayroll = () => {
    toast({
      title: "جاري تحميل كشف الرواتب",
      description: "سيتم تحميل كشف الرواتب بصيغة Excel"
    });
  };

  if (isLoadingSalaries || isLoadingEmployees) {
    return (
      <AppLayout>
        <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-[200px]" />
            <Skeleton className="h-10 w-[150px]" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          
          <div className="space-y-4">
            <Skeleton className="h-8 w-[300px]" />
            <Skeleton className="h-[300px]" />
          </div>
        </div>
      </AppLayout>
    );
  }

  const payrollPeriods = Array.from(salaryByPaymentDate.keys())
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold">كشف الرواتب</h1>
            <p className="text-muted-foreground">إدارة رواتب الموظفين ومسير الرواتب</p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={handleDownloadPayroll}>
              <Download className="mr-2 h-4 w-4" />
              تنزيل كشف الرواتب
            </Button>
            <Button onClick={handleGeneratePayroll}>
              <Plus className="mr-2 h-4 w-4" />
              إنشاء كشف رواتب جديد
            </Button>
          </div>
        </div>

        {/* Payroll Summary Cards */}
        {currentSummary && (
          <PayrollSummary 
            summary={currentSummary} 
            paymentDate={currentSalaryBatch?.date}
          />
        )}

        {/* Payroll Records */}
        <Card className="overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">سجلات الرواتب</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="current">
                  <FileText className="mr-2 h-4 w-4" />
                  كشف الرواتب الحالي
                </TabsTrigger>
                <TabsTrigger value="history">
                  <FileInput className="mr-2 h-4 w-4" />
                  سجل كشوفات الرواتب
                </TabsTrigger>
                <TabsTrigger value="reports">
                  <FileOutput className="mr-2 h-4 w-4" />
                  تقارير الرواتب
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="current">
                {currentSalaryBatch?.records?.length ? (
                  <Table>
                    <TableCaption>
                      كشف رواتب شهر {format(new Date(currentSalaryBatch.date), "MMMM yyyy")}
                    </TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[180px]">اسم الموظف</TableHead>
                        <TableHead>الراتب الأساسي</TableHead>
                        <TableHead>بدل السكن</TableHead>
                        <TableHead>بدل النقل</TableHead>
                        <TableHead>التأمينات</TableHead>
                        <TableHead>صافي الراتب</TableHead>
                        <TableHead>الحالة</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentSalaryBatch.records.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell className="font-medium">{record.employee_name}</TableCell>
                          <TableCell>{formatNumber(record.base_salary)}</TableCell>
                          <TableCell>{formatNumber(record.housing_allowance)}</TableCell>
                          <TableCell>{formatNumber(record.transportation_allowance)}</TableCell>
                          <TableCell>{formatNumber(record.gosi_subscription)}</TableCell>
                          <TableCell className="font-medium">{formatNumber(record.total_salary)}</TableCell>
                          <TableCell>
                            {record.status === 'paid' ? (
                              <div className="flex items-center gap-1 text-green-500">
                                <CheckCircle2 className="h-4 w-4" />
                                تم الدفع
                              </div>
                            ) : record.status === 'pending' ? (
                              <div className="flex items-center gap-1 text-amber-500">
                                <AlertCircle className="h-4 w-4" />
                                قيد الانتظار
                              </div>
                            ) : (
                              record.status
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">لم يتم إنشاء كشف الرواتب للشهر الحالي بعد</p>
                    <Button variant="outline" onClick={handleGeneratePayroll} className="mt-4">
                      <Plus className="mr-2 h-4 w-4" />
                      إنشاء كشف رواتب جديد
                    </Button>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="history">
                {payrollPeriods.length > 0 ? (
                  <div className="space-y-6">
                    {payrollPeriods.map((date) => {
                      const records = salaryByPaymentDate.get(date) || [];
                      const summary = calculatePayrollSummary(records);
                      
                      return (
                        <Card key={date}>
                          <CardHeader className="py-3">
                            <CardTitle className="text-sm flex justify-between">
                              <span>
                                كشف رواتب {format(new Date(date), "MMMM yyyy")}
                              </span>
                              <span className="text-muted-foreground text-xs">
                                {summary.totalEmployees} موظف | إجمالي الرواتب: {formatNumber(summary.totalNetSalary)}
                              </span>
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="py-2">
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="text-sm font-medium">تاريخ الدفع: {format(new Date(date), "yyyy/MM/dd")}</p>
                                <p className="text-sm text-muted-foreground">تم دفع رواتب {summary.totalEmployees} موظفين</p>
                              </div>
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm">
                                  عرض التفاصيل
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Download className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">لا توجد سجلات لكشوفات الرواتب</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="reports">
                <div className="text-center py-8">
                  <p className="text-muted-foreground">تقارير الرواتب قيد التطوير</p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
