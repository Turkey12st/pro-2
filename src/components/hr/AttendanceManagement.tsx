
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { usePermissions } from '@/hooks/usePermissions';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Plus, Edit, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

interface AttendanceRecord {
  id: string;
  employee_id: string;
  employee_name: string;
  date: string;
  check_in: string | null;
  check_out: string | null;
  status: 'present' | 'absent' | 'late' | 'early_leave' | 'sick_leave' | 'vacation';
  late_minutes: number;
  overtime_minutes: number;
  notes: string;
  approved_by: string | null;
  created_at: string;
}

interface AttendanceManagementProps {
  employeeId?: string;
}

export function AttendanceManagement({ employeeId }: AttendanceManagementProps) {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().substring(0, 7));
  
  const { hasPermission, userRole } = usePermissions();
  const { toast } = useToast();

  const [newRecord, setNewRecord] = useState({
    employee_id: employeeId || '',
    date: new Date().toISOString().split('T')[0],
    check_in: '',
    check_out: '',
    status: 'present' as const,
    late_minutes: 0,
    overtime_minutes: 0,
    notes: ''
  });

  useEffect(() => {
    loadAttendanceRecords();
  }, [selectedMonth, employeeId]);

  const loadAttendanceRecords = async () => {
    try {
      setIsLoading(true);
      console.log('Loading attendance records...');
      
      // استخدام raw SQL للتجنب مشاكل TypeScript
      const { data, error } = await supabase.rpc('get_attendance_with_employees', {
        start_date: `${selectedMonth}-01`,
        end_date: `${selectedMonth}-31`,
        emp_id: employeeId || null
      });

      if (error) {
        console.error('Error loading attendance:', error);
        // في حالة عدم وجود الدالة، نستخدم استعلام بسيط
        const { data: attendanceData, error: directError } = await supabase
          .from('attendance_records')
          .select('*')
          .gte('date', `${selectedMonth}-01`)
          .lt('date', `${selectedMonth}-32`)
          .order('date', { ascending: false });

        if (directError) throw directError;

        // جلب أسماء الموظفين بشكل منفصل
        const employeeIds = attendanceData?.map(record => record.employee_id) || [];
        const { data: employees } = await supabase
          .from('employees')
          .select('id, name')
          .in('id', employeeIds);

        const employeeMap = new Map(employees?.map(emp => [emp.id, emp.name]) || []);

        const formattedRecords = attendanceData?.map(record => ({
          ...record,
          employee_name: employeeMap.get(record.employee_id) || 'غير معروف'
        })) || [];

        setRecords(formattedRecords);
      } else {
        setRecords(data || []);
      }
    } catch (error) {
      console.error('Error loading attendance records:', error);
      toast({
        title: 'خطأ في تحميل البيانات',
        description: 'حدث خطأ أثناء تحميل سجلات الحضور',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddRecord = async () => {
    if (!hasPermission('add_attendance')) {
      toast({
        title: 'غير مسموح',
        description: 'ليس لديك صلاحية لإضافة سجلات الحضور',
        variant: 'destructive'
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('المستخدم غير مسجل الدخول');

      // حساب التأخير والعمل الإضافي تلقائياً
      const workStartTime = '08:00';
      const workEndTime = '17:00';
      let lateMinutes = 0;
      let overtimeMinutes = 0;

      if (newRecord.check_in) {
        const checkInTime = new Date(`2000-01-01T${newRecord.check_in}`);
        const startTime = new Date(`2000-01-01T${workStartTime}`);
        if (checkInTime > startTime) {
          lateMinutes = Math.floor((checkInTime.getTime() - startTime.getTime()) / (1000 * 60));
        }
      }

      if (newRecord.check_out) {
        const checkOutTime = new Date(`2000-01-01T${newRecord.check_out}`);
        const endTime = new Date(`2000-01-01T${workEndTime}`);
        if (checkOutTime > endTime) {
          overtimeMinutes = Math.floor((checkOutTime.getTime() - endTime.getTime()) / (1000 * 60));
        }
      }

      const recordData = {
        employee_id: newRecord.employee_id,
        date: newRecord.date,
        check_in: newRecord.check_in || null,
        check_out: newRecord.check_out || null,
        status: newRecord.status,
        late_minutes: lateMinutes,
        overtime_minutes: overtimeMinutes,
        notes: newRecord.notes,
        created_by: user.id
      };

      const { error } = await supabase
        .from('attendance_records')
        .insert([recordData]);

      if (error) throw error;

      // تطبيق اللوائح التلقائية
      await applyAttendanceRules(recordData);

      toast({
        title: 'تم إضافة السجل بنجاح',
        description: 'تم حفظ سجل الحضور'
      });

      setIsDialogOpen(false);
      setNewRecord({
        employee_id: employeeId || '',
        date: new Date().toISOString().split('T')[0],
        check_in: '',
        check_out: '',
        status: 'present',
        late_minutes: 0,
        overtime_minutes: 0,
        notes: ''
      });
      
      loadAttendanceRecords();
    } catch (error) {
      console.error('Error adding attendance record:', error);
      toast({
        title: 'خطأ في الحفظ',
        description: 'حدث خطأ أثناء حفظ سجل الحضور',
        variant: 'destructive'
      });
    }
  };

  const applyAttendanceRules = async (record: any) => {
    try {
      console.log('Applying attendance rules for record:', record);
      
      // في هذا المثال البسيط، سنطبق قواعد أساسية
      if (record.late_minutes >= 30) {
        // إضافة خصم للتأخير
        await supabase
          .from('salary_deductions')
          .insert([{
            employee_id: record.employee_id,
            amount: 50,
            reason: `خصم تأخير - ${record.late_minutes} دقيقة`,
            date: record.date,
            auto_generated: true,
            status: 'pending'
          }]);
      }

      if (record.status === 'absent') {
        // إرسال إشعار للغياب
        await supabase
          .from('alert_logs')
          .insert([{
            alert_type: 'absence_notification',
            reference_type: 'attendance',
            reference_id: record.employee_id,
            message: 'غياب موظف يتطلب المتابعة',
            status: 'pending'
          }]);
      }
    } catch (error) {
      console.error('Error applying attendance rules:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'absent':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'late':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'early_leave':
        return <AlertCircle className="h-5 w-5 text-orange-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusText = (status: string) => {
    const statusMap = {
      present: 'حاضر',
      absent: 'غائب',
      late: 'متأخر',
      early_leave: 'خروج مبكر',
      sick_leave: 'إجازة مرضية',
      vacation: 'إجازة'
    };
    return statusMap[status as keyof typeof statusMap] || status;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>إدارة الحضور والانصراف</CardTitle>
          <div className="flex items-center gap-4">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="اختر الشهر" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => {
                  const date = new Date();
                  date.setMonth(date.getMonth() - i);
                  const value = date.toISOString().substring(0, 7);
                  const label = format(date, 'MMMM yyyy', { locale: ar });
                  return (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            
            {hasPermission('add_attendance') && (
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                إضافة سجل
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">جاري التحميل...</div>
          ) : records.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>التاريخ</TableHead>
                  {!employeeId && <TableHead>اسم الموظف</TableHead>}
                  <TableHead>وقت الحضور</TableHead>
                  <TableHead>وقت الانصراف</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>التأخير</TableHead>
                  <TableHead>العمل الإضافي</TableHead>
                  <TableHead>ملاحظات</TableHead>
                  {hasPermission('edit_attendance') && <TableHead>الإجراءات</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      {format(new Date(record.date), 'yyyy/MM/dd')}
                    </TableCell>
                    {!employeeId && (
                      <TableCell>{record.employee_name}</TableCell>
                    )}
                    <TableCell>{record.check_in || '-'}</TableCell>
                    <TableCell>{record.check_out || '-'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(record.status)}
                        <span>{getStatusText(record.status)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {record.late_minutes > 0 ? `${record.late_minutes} دقيقة` : '-'}
                    </TableCell>
                    <TableCell>
                      {record.overtime_minutes > 0 ? `${record.overtime_minutes} دقيقة` : '-'}
                    </TableCell>
                    <TableCell>{record.notes || '-'}</TableCell>
                    {hasPermission('edit_attendance') && (
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedRecord(record);
                            setIsDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    )}
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {selectedRecord ? 'تعديل سجل الحضور' : 'إضافة سجل حضور جديد'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="date">التاريخ</Label>
              <Input
                id="date"
                type="date"
                value={newRecord.date}
                onChange={(e) => setNewRecord(prev => ({ ...prev, date: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="checkIn">وقت الحضور</Label>
                <Input
                  id="checkIn"
                  type="time"
                  value={newRecord.check_in}
                  onChange={(e) => setNewRecord(prev => ({ ...prev, check_in: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="checkOut">وقت الانصراف</Label>
                <Input
                  id="checkOut"
                  type="time"
                  value={newRecord.check_out}
                  onChange={(e) => setNewRecord(prev => ({ ...prev, check_out: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">الحالة</Label>
              <Select
                value={newRecord.status}
                onValueChange={(value) => setNewRecord(prev => ({ ...prev, status: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="present">حاضر</SelectItem>
                  <SelectItem value="absent">غائب</SelectItem>
                  <SelectItem value="late">متأخر</SelectItem>
                  <SelectItem value="early_leave">خروج مبكر</SelectItem>
                  <SelectItem value="sick_leave">إجازة مرضية</SelectItem>
                  <SelectItem value="vacation">إجازة</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">ملاحظات</Label>
              <Input
                id="notes"
                value={newRecord.notes}
                onChange={(e) => setNewRecord(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="ملاحظات إضافية"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleAddRecord}>
              {selectedRecord ? 'تحديث' : 'حفظ'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
