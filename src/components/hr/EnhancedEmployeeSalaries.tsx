import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Employee } from "@/types/hr";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatSalary } from "@/utils/formatters";
import { format } from "date-fns";
import { Download, Eye } from "lucide-react";

interface EnhancedEmployeeSalariesProps {
  employeeId?: string;
  employee?: Employee;
}

interface SalaryRecord {
  id: string;
  payment_date: string;
  base_salary: number;
  housing_allowance: number;
  transportation_allowance: number;
  allowances: any[];
  deductions: any[];
  gosi_subscription: number;
  tax_amount: number;
  total_salary: number;
  net_salary: number;
  status: string;
  payslip_url?: string;
}

export function EnhancedEmployeeSalaries({ employeeId, employee }: EnhancedEmployeeSalariesProps) {
  const { data: salaries, isLoading } = useQuery({
    queryKey: ["enhanced-employee-salaries", employeeId],
    queryFn: async () => {
      if (!employeeId) return [];
      
      const { data, error } = await supabase
        .from("salary_records")
        .select("*")
        .eq("employee_id", employeeId)
        .order("payment_date", { ascending: false });
        
      if (error) throw error;
      return data || [];
    },
    enabled: !!employeeId,
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">مدفوع</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">قيد الانتظار</Badge>;
      case 'processing':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">قيد المعالجة</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">ملغي</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const calculateTotalAllowances = (allowances: any) => {
    if (!allowances || (typeof allowances === 'string' && allowances === '[]')) return 0;
    try {
      const allowancesArray = typeof allowances === 'string' ? JSON.parse(allowances) : allowances;
      if (!Array.isArray(allowancesArray)) return 0;
      return allowancesArray.reduce((sum, allowance) => sum + (allowance.amount || 0), 0);
    } catch {
      return 0;
    }
  };

  const calculateTotalDeductions = (deductions: any) => {
    if (!deductions || (typeof deductions === 'string' && deductions === '[]')) return 0;
    try {
      const deductionsArray = typeof deductions === 'string' ? JSON.parse(deductions) : deductions;
      if (!Array.isArray(deductionsArray)) return 0;
      return deductionsArray.reduce((sum, deduction) => sum + (deduction.amount || 0), 0);
    } catch {
      return 0;
    }
  };

  const handleDownloadPayslip = (payslipUrl: string) => {
    if (payslipUrl) {
      window.open(payslipUrl, '_blank');
    }
  };

  const AllowancesBreakdown = ({ allowances }: { allowances: any }) => {
    if (!allowances) return <span>-</span>;
    
    try {
      const allowancesArray = typeof allowances === 'string' ? JSON.parse(allowances) : allowances;
      if (!Array.isArray(allowancesArray) || allowancesArray.length === 0) return <span>-</span>;
      
      return (
        <div className="space-y-1">
          {allowancesArray.map((allowance: any, index: number) => (
            <div key={index} className="text-xs">
              <span className="font-medium">{allowance.name}:</span> {formatSalary(allowance.amount)}
            </div>
          ))}
        </div>
      );
    } catch {
      return <span>-</span>;
    }
  };

  const DeductionsBreakdown = ({ deductions }: { deductions: any }) => {
    if (!deductions) return <span>-</span>;
    
    try {
      const deductionsArray = typeof deductions === 'string' ? JSON.parse(deductions) : deductions;
      if (!Array.isArray(deductionsArray) || deductionsArray.length === 0) return <span>-</span>;
      
      return (
        <div className="space-y-1">
          {deductionsArray.map((deduction: any, index: number) => (
            <div key={index} className="text-xs">
              <span className="font-medium">{deduction.name}:</span> {formatSalary(deduction.amount)}
            </div>
          ))}
        </div>
      );
    } catch {
      return <span>-</span>;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>سجل الرواتب المحاسبي</CardTitle>
      </CardHeader>
      <CardContent>
        {!isLoading && salaries && salaries.length > 0 ? (
          <div className="space-y-4">
            {/* ملخص الراتب الحالي */}
            {salaries[0] && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">آخر راتب ({format(new Date(salaries[0].payment_date), "MMMM yyyy")})</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">الراتب الأساسي:</span>
                    <div className="font-medium">{formatSalary(salaries[0].base_salary)}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">إجمالي البدلات:</span>
                    <div className="font-medium text-green-600">
                      +{formatSalary(
                        (salaries[0].housing_allowance || 0) + 
                        (salaries[0].transportation_allowance || 0) + 
                        calculateTotalAllowances(salaries[0].allowances)
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">إجمالي الاستقطاعات:</span>
                    <div className="font-medium text-red-600">
                      -{formatSalary(
                        (salaries[0].gosi_subscription || 0) + 
                        (salaries[0].tax_amount || 0) + 
                        calculateTotalDeductions(salaries[0].deductions)
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">الصافي:</span>
                    <div className="font-bold text-lg">{formatSalary(salaries[0].net_salary || salaries[0].total_salary)}</div>
                  </div>
                </div>
              </div>
            )}

            {/* جدول تفاصيل الرواتب */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>التاريخ</TableHead>
                  <TableHead>الراتب الأساسي</TableHead>
                  <TableHead>بدل السكن</TableHead>
                  <TableHead>بدل المواصلات</TableHead>
                  <TableHead>بدلات أخرى</TableHead>
                  <TableHead>التأمينات</TableHead>
                  <TableHead>استقطاعات أخرى</TableHead>
                  <TableHead>الضرائب</TableHead>
                  <TableHead>الإجمالي</TableHead>
                  <TableHead>الصافي</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salaries.map((salary: any) => (
                  <TableRow key={salary.id}>
                    <TableCell>{format(new Date(salary.payment_date), "yyyy/MM/dd")}</TableCell>
                    <TableCell>{formatSalary(salary.base_salary)}</TableCell>
                    <TableCell>{formatSalary(salary.housing_allowance)}</TableCell>
                    <TableCell>{formatSalary(salary.transportation_allowance)}</TableCell>
                    <TableCell>
                      <AllowancesBreakdown allowances={salary.allowances} />
                    </TableCell>
                    <TableCell className="text-red-600">
                      -{formatSalary(salary.gosi_subscription || 0)}
                    </TableCell>
                    <TableCell className="text-red-600">
                      <DeductionsBreakdown deductions={salary.deductions} />
                    </TableCell>
                    <TableCell className="text-red-600">
                      -{formatSalary(salary.tax_amount || 0)}
                    </TableCell>
                    <TableCell className="font-semibold">{formatSalary(salary.total_salary)}</TableCell>
                    <TableCell className="font-bold text-green-600">
                      {formatSalary(salary.net_salary || salary.total_salary)}
                    </TableCell>
                    <TableCell>{getStatusBadge(salary.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {salary.payslip_url && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDownloadPayslip(salary.payslip_url!)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* إحصائيات سنوية */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">الإحصائيات السنوية</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-blue-700">إجمالي الرواتب المدفوعة:</span>
                  <div className="font-bold text-blue-900">
                    {formatSalary(
                      salaries
                        .filter(s => s.status === 'paid')
                        .reduce((sum, s) => sum + s.total_salary, 0)
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-blue-700">إجمالي التأمينات المدفوعة:</span>
                  <div className="font-bold text-blue-900">
                    {formatSalary(
                      salaries
                        .filter(s => s.status === 'paid')
                        .reduce((sum, s) => sum + (s.gosi_subscription || 0), 0)
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-blue-700">عدد الرواتب المدفوعة:</span>
                  <div className="font-bold text-blue-900">
                    {salaries.filter(s => s.status === 'paid').length} راتب
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">لا توجد سجلات رواتب لهذا الموظف</p>
            <p className="text-sm text-muted-foreground mt-2">
              سيتم عرض تفاصيل الرواتب هنا بمجرد إضافة سجلات جديدة
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}