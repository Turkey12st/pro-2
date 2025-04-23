
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format, differenceInDays } from "date-fns";

interface EmployeeVacationsProps {
  employeeId?: string;
}

export function EmployeeVacations({ employeeId }: EmployeeVacationsProps) {
  // يمكن استبدال هذا لاحقًا باستعلام من قاعدة البيانات
  const vacations = [
    {
      id: "1",
      type: "سنوية",
      start_date: "2025-05-01",
      end_date: "2025-05-15",
      status: "موافق عليها",
      approved_by: "مدير الموارد البشرية",
      notes: "إجازة سنوية مستحقة"
    },
    {
      id: "2",
      type: "مرضية",
      start_date: "2025-02-10",
      end_date: "2025-02-14",
      status: "مكتملة",
      approved_by: "مدير القسم",
      notes: "تم تقديم تقرير طبي"
    },
    {
      id: "3",
      type: "اضطرارية",
      start_date: "2025-01-05",
      end_date: "2025-01-07",
      status: "مكتملة",
      approved_by: "مدير الموارد البشرية",
      notes: "لظروف عائلية"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'موافق عليها':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">{status}</Badge>;
      case 'مكتملة':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">{status}</Badge>;
      case 'مرفوضة':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">{status}</Badge>;
      case 'قيد المراجعة':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">{status}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const calculateDays = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return differenceInDays(end, start) + 1; // +1 لتضمين اليوم الأخير
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>سجل الإجازات</CardTitle>
      </CardHeader>
      <CardContent>
        {vacations.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>النوع</TableHead>
                <TableHead>تاريخ البداية</TableHead>
                <TableHead>تاريخ النهاية</TableHead>
                <TableHead>عدد الأيام</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>معتمد من</TableHead>
                <TableHead>ملاحظات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vacations.map((vacation) => (
                <TableRow key={vacation.id}>
                  <TableCell>{vacation.type}</TableCell>
                  <TableCell>{format(new Date(vacation.start_date), "yyyy/MM/dd")}</TableCell>
                  <TableCell>{format(new Date(vacation.end_date), "yyyy/MM/dd")}</TableCell>
                  <TableCell>{calculateDays(vacation.start_date, vacation.end_date)} يوم</TableCell>
                  <TableCell>{getStatusBadge(vacation.status)}</TableCell>
                  <TableCell>{vacation.approved_by}</TableCell>
                  <TableCell>{vacation.notes}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">لا توجد سجلات إجازات لهذا الموظف</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
