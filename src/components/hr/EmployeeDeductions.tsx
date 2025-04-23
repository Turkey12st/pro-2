
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { formatSalary } from "@/utils/formatters";
import { format } from "date-fns";

interface EmployeeDeductionsProps {
  employeeId?: string;
}

export function EmployeeDeductions({ employeeId }: EmployeeDeductionsProps) {
  // يمكن استبدال هذا لاحقًا باستعلام من قاعدة البيانات
  const deductions = [
    {
      id: "1",
      date: "2025-04-01",
      reason: "يوم غياب بدون إذن",
      amount: 300,
      status: "مؤكد",
      approved_by: "مدير الموارد البشرية"
    },
    {
      id: "2",
      date: "2025-03-15",
      reason: "تأخر متكرر",
      amount: 150,
      status: "مؤكد",
      approved_by: "مدير القسم"
    },
    {
      id: "3",
      date: "2025-02-20",
      reason: "خصم التأمينات الاجتماعية",
      amount: 420,
      status: "مؤكد",
      approved_by: "النظام"
    }
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>سجل الخصومات</CardTitle>
      </CardHeader>
      <CardContent>
        {deductions.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>التاريخ</TableHead>
                <TableHead>السبب</TableHead>
                <TableHead>المبلغ</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>معتمد من</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deductions.map((deduction) => (
                <TableRow key={deduction.id}>
                  <TableCell>{format(new Date(deduction.date), "yyyy/MM/dd")}</TableCell>
                  <TableCell>{deduction.reason}</TableCell>
                  <TableCell>{formatSalary(deduction.amount)}</TableCell>
                  <TableCell>{deduction.status}</TableCell>
                  <TableCell>{deduction.approved_by}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">لا توجد سجلات خصومات لهذا الموظف</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
