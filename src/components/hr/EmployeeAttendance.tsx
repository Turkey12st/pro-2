
import React, { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { CheckCircle, XCircle, AlertCircle, Clock, Upload, Plus, FileSpreadsheet } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface EmployeeAttendanceProps {
  employeeId?: string;
}

export function EmployeeAttendance({ employeeId }: EmployeeAttendanceProps) {
  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toISOString().substring(0, 7) // YYYY-MM format
  );
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isManualEntryOpen, setIsManualEntryOpen] = useState(false);
  const [manualEntry, setManualEntry] = useState({
    date: new Date().toISOString().split('T')[0],
    check_in: '',
    check_out: '',
    notes: ''
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const { data: attendanceData = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["employee-attendance", employeeId ?? "all", selectedMonth],
    queryFn: async () => {
      const [year, month] = selectedMonth.split("-").map(Number);
      const nextMonthStart = new Date(Date.UTC(year, month, 1)).toISOString().slice(0, 10);

      let query = supabase
        .from("attendance_records")
        .select("id,date,check_in,check_out,status,late_minutes,overtime_minutes,notes")
        .gte("date", `${selectedMonth}-01`)
        .lt("date", nextMonthStart)
        .order("date", { ascending: false });

      if (employeeId) query = query.eq("employee_id", employeeId);

      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'absent':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'late':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'early-leave':
      case 'early_leave':
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
      case 'early_leave':
        return "خروج مبكر";
      default:
        return status;
    }
  };

  const months = Array.from({ length: 12 }, (_, index) => {
    const date = new Date();
    date.setMonth(date.getMonth() - index);
    return {
      value: format(date, "yyyy-MM"),
      label: format(date, "MMMM yyyy", { locale: ar }),
    };
  });

  const filteredData = attendanceData;

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !employeeId) return;

    try {
      // رفع الملف لقاعدة البيانات
      const { data, error } = await supabase
        .from('attendance_files')
        .insert({
          employee_id: employeeId,
          file_name: file.name,
          file_url: 'temp-url', // في الواقع سيتم رفع الملف للتخزين
          processed: false
        });

      if (error) throw error;

      toast({
        title: "تم رفع الملف بنجاح",
        description: "سيتم معالجة بيانات الحضور والانصراف قريباً"
      });

      setIsUploadDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "خطأ في رفع الملف",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleManualEntry = async () => {
    if (!employeeId || !manualEntry.date) return;

    try {
      const { data, error } = await supabase
        .from('attendance_records')
        .insert({
          employee_id: employeeId,
          date: manualEntry.date,
          check_in: manualEntry.check_in || null,
          check_out: manualEntry.check_out || null,
          notes: manualEntry.notes,
          status: 'present'
        });

      if (error) throw error;

      toast({
        title: "تم إضافة سجل الحضور",
        description: "تم حفظ البيانات بنجاح"
      });

      setIsManualEntryOpen(false);
      setManualEntry({
        date: new Date().toISOString().split('T')[0],
        check_in: '',
        check_out: '',
        notes: ''
      });
      await refetch();
    } catch (error: any) {
      toast({
        title: "خطأ في إضافة السجل",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 space-y-0 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>سجل الحضور والانصراف</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">بيانات فعلية من سجل الحضور للشهر المحدد</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-full min-w-[155px] sm:w-[180px]">
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
          
          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                <Upload className="h-4 w-4 me-2" />
                رفع ملف إكسل
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>رفع ملف الحضور والانصراف</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <FileSpreadsheet className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-sm text-gray-600 mb-4">
                    اختر ملف إكسل يحتوي على بيانات الحضور والانصراف
                  </p>
                  <Button 
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                  >
                    اختيار ملف
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isManualEntryOpen} onOpenChange={setIsManualEntryOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                <Plus className="h-4 w-4 me-2" />
                إدخال يدوي
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>إدخال بيانات الحضور يدوياً</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">التاريخ</label>
                  <Input
                    type="date"
                    value={manualEntry.date}
                    onChange={(e) => setManualEntry({...manualEntry, date: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">وقت الحضور</label>
                  <Input
                    type="time"
                    value={manualEntry.check_in}
                    onChange={(e) => setManualEntry({...manualEntry, check_in: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">وقت الانصراف</label>
                  <Input
                    type="time"
                    value={manualEntry.check_out}
                    onChange={(e) => setManualEntry({...manualEntry, check_out: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">ملاحظات</label>
                  <Input
                    value={manualEntry.notes}
                    onChange={(e) => setManualEntry({...manualEntry, notes: e.target.value})}
                    placeholder="ملاحظات اختيارية"
                  />
                </div>
                <Button onClick={handleManualEntry} className="w-full">
                  حفظ البيانات
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3 py-4"><div className="h-10 animate-pulse rounded-lg bg-muted" /><div className="h-10 animate-pulse rounded-lg bg-muted" /><div className="h-10 animate-pulse rounded-lg bg-muted" /></div>
        ) : isError ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center"><AlertCircle className="h-7 w-7 text-destructive" /><p className="text-sm text-muted-foreground">تعذر تحميل سجلات الحضور. تحقق من الصلاحيات ثم أعد المحاولة.</p><Button variant="outline" onClick={() => void refetch()}>إعادة المحاولة</Button></div>
        ) : filteredData.length > 0 ? (
          <div className="table-scroll"><Table className="responsive-table">
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
          </Table></div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">لا توجد سجلات حضور لهذا الشهر</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
