
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Employee } from "@/types/hr";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatSalary } from "@/utils/formatters";
import { format } from "date-fns";

interface EmployeeSalariesProps {
  employeeId?: string;
  employee?: Employee;
}

export function EmployeeSalaries({ employeeId, employee }: EmployeeSalariesProps) {
  const { data: salaries, isLoading } = useQuery({
    queryKey: ["employee-salaries", employeeId],
    queryFn: async () => {
      if (!employeeId) return [];
      
      // طلب سجلات الرواتب الخاصة بالموظف من قاعدة البيانات
      // هذا مجرد مثال ويمكن تعديله حسب هيكل قاعدة البيانات الخاصة بك
      const { data, error } = await supabase
        .from("salary_records")
        .select("*")
        .eq("employee_id", employeeId)
        .order("payment_date", { ascending: false });
        
      if (error) throw error;
      return data || [];
    },
    // في حالة عدم وجود جدول للرواتب بعد، يتم استخدام بيانات افتراضية 
    // يمكن إزالة هذا الجزء عند إنشاء جدول الرواتب الحقيقي
    enabled: !!employeeId,
    placeholderData: employee ? () => {
      if (!employee) return [];
      
      const currentDate = new Date();
      const lastMonth = new Date(currentDate);
      lastMonth.setMonth(currentDate.getMonth() - 1);
      
      const twoMonthsAgo = new Date(currentDate);
      twoMonthsAgo.setMonth(currentDate.getMonth() - 2);
      
      return [
        {
          id: "1",
          employee_id: employeeId!,
          base_salary: employee.baseSalary,
          housing_allowance: employee.housingAllowance,
          transportation_allowance: employee.transportationAllowance,
          allowances: employee.otherAllowances as any,
          other_allowances: employee.otherAllowances as any,
          deductions: [{name: "التأمينات الاجتماعية", amount: employee.employeeGosiContribution || 0}] as any,
          gosi_subscription: employee.gosiSubscription || 0,
          total_salary: employee.salary,
          net_salary: employee.salary - (employee.employeeGosiContribution || 0),
          tax_amount: 0,
          payslip_url: null,
          payment_date: currentDate.toISOString(),
          status: "pending",
          created_at: currentDate.toISOString(),
        },
        {
          id: "2",
          employee_id: employeeId!,
          base_salary: employee.baseSalary,
          housing_allowance: employee.housingAllowance,
          transportation_allowance: employee.transportationAllowance,
          allowances: employee.otherAllowances as any,
          other_allowances: employee.otherAllowances as any,
          deductions: [{name: "التأمينات الاجتماعية", amount: employee.employeeGosiContribution || 0}] as any,
          gosi_subscription: employee.gosiSubscription || 0,
          total_salary: employee.salary,
          net_salary: employee.salary - (employee.employeeGosiContribution || 0),
          tax_amount: 0,
          payslip_url: null,
          payment_date: lastMonth.toISOString(),
          status: "paid",
          created_at: lastMonth.toISOString(),
        },
        {
          id: "3",
          employee_id: employeeId!,
          base_salary: employee.baseSalary,
          housing_allowance: employee.housingAllowance,
          transportation_allowance: employee.transportationAllowance,
          allowances: employee.otherAllowances as any,
          other_allowances: employee.otherAllowances as any,
          deductions: [{name: "التأمينات الاجتماعية", amount: employee.employeeGosiContribution || 0}] as any,
          gosi_subscription: employee.gosiSubscription || 0,
          total_salary: employee.salary,
          net_salary: employee.salary - (employee.employeeGosiContribution || 0),
          tax_amount: 0,
          payslip_url: null,
          payment_date: twoMonthsAgo.toISOString(),
          status: "paid",
          created_at: twoMonthsAgo.toISOString(),
        },
      ];
    } : undefined
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">مدفوع</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">قيد الانتظار</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">ملغي</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>سجل الرواتب</CardTitle>
      </CardHeader>
      <CardContent>
        {!isLoading && salaries && salaries.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>تاريخ الدفع</TableHead>
                <TableHead>الراتب الأساسي</TableHead>
                <TableHead>بدل السكن</TableHead>
                <TableHead>بدل المواصلات</TableHead>
                <TableHead>الاستقطاعات</TableHead>
                <TableHead>الإجمالي</TableHead>
                <TableHead>الحالة</TableHead>
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
                    {salary.deductions?.length > 0 ? 
                      formatSalary(salary.deductions.reduce((sum: number, deduction: any) => sum + deduction.amount, 0)) : 
                      formatSalary(0)
                    }
                  </TableCell>
                  <TableCell className="font-semibold">{formatSalary(salary.total_salary)}</TableCell>
                  <TableCell>{getStatusBadge(salary.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">لا توجد سجلات رواتب لهذا الموظف</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
