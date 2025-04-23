
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { formatSalary } from "@/utils/formatters";
import { format } from "date-fns";

interface EmployeeBenefitsProps {
  employeeId?: string;
}

export function EmployeeBenefits({ employeeId }: EmployeeBenefitsProps) {
  // يمكن استبدال هذا لاحقًا باستعلام من قاعدة البيانات
  const benefits = [
    {
      id: "1",
      date: "2025-04-10",
      type: "مكافأة إنتاج",
      amount: 1000,
      description: "مكافأة تحقيق الأهداف الشهرية",
      approved_by: "المدير التنفيذي"
    },
    {
      id: "2",
      date: "2025-03-01",
      type: "بدل طبيعة عمل",
      amount: 500,
      description: "بدل مشروع خاص",
      approved_by: "مدير الموارد البشرية"
    },
    {
      id: "3",
      date: "2025-01-15",
      type: "مكافأة سنوية",
      amount: 3000,
      description: "مكافأة نهاية العام",
      approved_by: "المدير التنفيذي"
    }
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>الاستحقاقات والمكافآت</CardTitle>
      </CardHeader>
      <CardContent>
        {benefits.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>التاريخ</TableHead>
                <TableHead>النوع</TableHead>
                <TableHead>المبلغ</TableHead>
                <TableHead>الوصف</TableHead>
                <TableHead>معتمد من</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {benefits.map((benefit) => (
                <TableRow key={benefit.id}>
                  <TableCell>{format(new Date(benefit.date), "yyyy/MM/dd")}</TableCell>
                  <TableCell>{benefit.type}</TableCell>
                  <TableCell>{formatSalary(benefit.amount)}</TableCell>
                  <TableCell>{benefit.description}</TableCell>
                  <TableCell>{benefit.approved_by}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">لا توجد سجلات استحقاقات لهذا الموظف</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
