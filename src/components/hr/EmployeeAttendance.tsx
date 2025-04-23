
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { CheckCircle, XCircle, AlertCircle, Clock } from "lucide-react";

interface EmployeeAttendanceProps {
  employeeId?: string;
}

export function EmployeeAttendance({ employeeId }: EmployeeAttendanceProps) {
  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toISOString().substring(0, 7) // YYYY-MM format
  );
  
  // يمكن استبدال هذا لاحقًا باستعلام من قاعدة البيانات
  const attendanceData = [
    {
      date: "2025-04-01",
      check_in: "07:55:23",
      check_out: "17:03:12",
      status: "present",
      late_minutes: 0,
      overtime_minutes: 3,
      notes: ""
    },
    {
      date: "2025-04-02",
      check_in: "08:15:45",
      check_out: "17:00:00",
      status: "late",
      late_minutes: 15,
      overtime_minutes: 0,
      notes: "تأخر بسبب الازدحام المروري"
    },
    {
      date: "2025-04-03",
      check_in: "08:00:03",
      check_out: "17:30:22",
      status: "present",
      late_minutes: 0,
      overtime_minutes: 30,
      notes: "عمل إضافي لإكمال المهام"
    },
    {
      date: "2025-04-04",
      check_in: null,
      check_out: null,
      status: "absent",
      late_minutes: 0,
      overtime_minutes: 0,
      notes: "إجازة مرضية"
    },
    {
      date: "2025-04-05",
      check_in: "08:03:45",
      check_out: "16:45:12",
      status: "early-leave",
      late_minutes: 3,
      overtime_minutes: 0,
      notes: "خروج مبكر بإذن"
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'absent':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'late':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'early-leave':
        return <AlertCircle className="h-5 w-5 text-orange-600" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'present':
        return "حاضر";
      case 'absent':
        return "غائب";
      case 'late':
        return "متأخر";
      case 'early-leave':
        return "خروج مبكر";
      default:
        return status;
    }
  };

  const months = [
    { value: "2025-04", label: "أبريل 2025" },
    { value: "2025-03", label: "مارس 2025" },
    { value: "2025-02", label: "فبراير 2025" },
    { value: "2025-01", label: "يناير 2025" },
    { value: "2024-12", label: "ديسمبر 2024" }
  ];

  // تصفية البيانات حسب الشهر المحدد
  const filteredData = attendanceData.filter(record => 
    record.date.startsWith(selectedMonth)
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>سجل الحضور والانصراف</CardTitle>
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="اختر الشهر" />
          </SelectTrigger>
          <SelectContent>
            {months.map((month) => (
              <SelectItem key={month.value} value={month.value}>
                {month.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {filteredData.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>التاريخ</TableHead>
                <TableHead>وقت الحضور</TableHead>
                <TableHead>وقت الانصراف</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>التأخير (دقائق)</TableHead>
                <TableHead>العمل الإضافي (دقائق)</TableHead>
                <TableHead>ملاحظات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((record, index) => (
                <TableRow key={index}>
                  <TableCell>{format(new Date(record.date), "yyyy/MM/dd")}</TableCell>
                  <TableCell>{record.check_in || "-"}</TableCell>
                  <TableCell>{record.check_out || "-"}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(record.status)}
                      <span>{getStatusText(record.status)}</span>
                    </div>
                  </TableCell>
                  <TableCell>{record.late_minutes > 0 ? record.late_minutes : "-"}</TableCell>
                  <TableCell>{record.overtime_minutes > 0 ? record.overtime_minutes : "-"}</TableCell>
                  <TableCell>{record.notes || "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">لا توجد سجلات حضور لهذا الشهر</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
