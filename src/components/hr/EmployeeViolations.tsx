
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface EmployeeViolationsProps {
  employeeId?: string;
}

export function EmployeeViolations({ employeeId }: EmployeeViolationsProps) {
  // يمكن استبدال هذا لاحقًا باستعلام من قاعدة البيانات
  const violations = [
    {
      id: "1",
      date: "2025-03-20",
      type: "تأخر متكرر",
      description: "تأخر عن العمل لأكثر من 15 دقيقة لمدة 3 أيام متتالية",
      action: "إنذار شفهي",
      status: "مسجلة",
      reported_by: "المدير المباشر"
    },
    {
      id: "2",
      date: "2025-02-05",
      type: "إهمال واجبات",
      description: "عدم إكمال التقارير المطلوبة في الوقت المحدد",
      action: "إنذار كتابي",
      status: "مسجلة",
      reported_by: "مدير القسم"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'مسجلة':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">{status}</Badge>;
      case 'تحت المراجعة':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">{status}</Badge>;
      case 'معالجة':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">{status}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>المخالفات والإجراءات التأديبية</CardTitle>
      </CardHeader>
      <CardContent>
        {violations.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>التاريخ</TableHead>
                <TableHead>نوع المخالفة</TableHead>
                <TableHead>الوصف</TableHead>
                <TableHead>الإجراء المتخذ</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>مسجلة من قبل</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {violations.map((violation) => (
                <TableRow key={violation.id}>
                  <TableCell>{format(new Date(violation.date), "yyyy/MM/dd")}</TableCell>
                  <TableCell>{violation.type}</TableCell>
                  <TableCell>{violation.description}</TableCell>
                  <TableCell>{violation.action}</TableCell>
                  <TableCell>{getStatusBadge(violation.status)}</TableCell>
                  <TableCell>{violation.reported_by}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">لا توجد مخالفات مسجلة لهذا الموظف</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
