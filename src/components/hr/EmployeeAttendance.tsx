
import React, { useState, useRef } from "react";
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
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>سجل الحضور والانصراف</CardTitle>
        </div>
        <div className="flex items-center gap-2">
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
          
          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
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
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
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
