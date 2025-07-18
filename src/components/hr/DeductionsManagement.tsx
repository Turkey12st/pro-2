
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { usePermissions } from '@/hooks/usePermissions';
import { supabase } from '@/integrations/supabase/client';
import { formatSalary } from '@/utils/formatters';
import { format } from 'date-fns';
import { Plus, Check, X, Minus } from 'lucide-react';

interface Deduction {
  id: string;
  employee_id: string;
  employee_name: string;
  amount: number;
  reason: string;
  date: string;
  status: string;
  auto_generated: boolean;
  created_at: string;
}

interface DeductionsManagementProps {
  employeeId?: string;
}

export function DeductionsManagement({ employeeId }: DeductionsManagementProps) {
  const [deductions, setDeductions] = useState<Deduction[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const { hasPermission } = usePermissions();
  const { toast } = useToast();

  const [newDeduction, setNewDeduction] = useState({
    employee_id: employeeId || '',
    amount: 0,
    reason: '',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadDeductions();
  }, [employeeId]);

  const loadDeductions = async () => {
    try {
      setIsLoading(true);
      
      let query = supabase
        .from('salary_deductions')
        .select('*')
        .order('created_at', { ascending: false });

      if (employeeId) {
        query = query.eq('employee_id', employeeId);
      }

      const { data, error } = await query;

      if (error) throw error;

      // جلب أسماء الموظفين
      if (data && data.length > 0) {
        const employeeIds = [...new Set(data.map(deduction => deduction.employee_id))];
        const { data: employees } = await supabase
          .from('employees')
          .select('id, name')
          .in('id', employeeIds);

        const employeeMap = new Map(employees?.map(emp => [emp.id, emp.name]) || []);

        const formattedDeductions = data.map(deduction => ({
          ...deduction,
          employee_name: employeeMap.get(deduction.employee_id) || 'غير معروف'
        }));

        setDeductions(formattedDeductions);
      } else {
        setDeductions([]);
      }
    } catch (error) {
      console.error('Error loading deductions:', error);
      toast({
        title: 'خطأ في تحميل البيانات',
        description: 'حدث خطأ أثناء تحميل سجلات الخصومات',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddDeduction = async () => {
    if (!hasPermission('manage_deductions')) {
      toast({
        title: 'غير مسموح',
        description: 'ليس لديك صلاحية لإضافة الخصومات',
        variant: 'destructive'
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('المستخدم غير مسجل الدخول');

      const { error } = await supabase
        .from('salary_deductions')
        .insert([{
          employee_id: newDeduction.employee_id,
          amount: newDeduction.amount,
          reason: newDeduction.reason,
          date: newDeduction.date,
          auto_generated: false,
          status: 'pending',
          created_by: user.id
        }]);

      if (error) throw error;

      toast({
        title: 'تم إضافة الخصم بنجاح',
        description: 'الخصم في انتظار الاعتماد'
      });

      setIsDialogOpen(false);
      setNewDeduction({
        employee_id: employeeId || '',
        amount: 0,
        reason: '',
        date: new Date().toISOString().split('T')[0]
      });
      
      loadDeductions();
    } catch (error) {
      console.error('Error adding deduction:', error);
      toast({
        title: 'خطأ في الحفظ',
        description: 'حدث خطأ أثناء حفظ الخصم',
        variant: 'destructive'
      });
    }
  };

  const updateDeductionStatus = async (deductionId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('salary_deductions')
        .update({ status })
        .eq('id', deductionId);

      if (error) throw error;

      toast({
        title: status === 'approved' ? 'تم اعتماد الخصم' : 'تم رفض الخصم',
        description: 'تم تحديث حالة الخصم بنجاح'
      });

      loadDeductions();
    } catch (error) {
      console.error('Error updating deduction status:', error);
      toast({
        title: 'خطأ في التحديث',
        description: 'حدث خطأ أثناء تحديث حالة الخصم',
        variant: 'destructive'
      });
    }
  };

  const getStatusBadge = (status: string, autoGenerated: boolean) => {
    const statusMap: Record<string, { text: string; class: string }> = {
      pending: { text: 'في الانتظار', class: 'bg-yellow-100 text-yellow-800' },
      approved: { text: 'معتمد', class: 'bg-green-100 text-green-800' },
      applied: { text: 'مطبق', class: 'bg-blue-100 text-blue-800' },
      rejected: { text: 'مرفوض', class: 'bg-red-100 text-red-800' }
    };
    const statusInfo = statusMap[status] || { text: status, class: 'bg-gray-100 text-gray-800' };
    
    return (
      <div className="flex items-center gap-2">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.class}`}>
          {statusInfo.text}
        </span>
        {autoGenerated && (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            تلقائي
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Minus className="h-5 w-5" />
            إدارة الخصومات
          </CardTitle>
          {hasPermission('manage_deductions') && (
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              إضافة خصم
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">جاري التحميل...</div>
          ) : deductions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>التاريخ</TableHead>
                  {!employeeId && <TableHead>اسم الموظف</TableHead>}
                  <TableHead>المبلغ</TableHead>
                  <TableHead>السبب</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deductions.map((deduction) => (
                  <TableRow key={deduction.id}>
                    <TableCell>
                      {format(new Date(deduction.date), 'yyyy/MM/dd')}
                    </TableCell>
                    {!employeeId && (
                      <TableCell>{deduction.employee_name}</TableCell>
                    )}
                    <TableCell>{formatSalary(deduction.amount)}</TableCell>
                    <TableCell>{deduction.reason}</TableCell>
                    <TableCell>{getStatusBadge(deduction.status, deduction.auto_generated)}</TableCell>
                    <TableCell>
                      {deduction.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateDeductionStatus(deduction.id, 'approved')}
                            className="text-green-600 hover:text-green-700"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateDeductionStatus(deduction.id, 'rejected')}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">لا توجد سجلات خصومات</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>إضافة خصم جديد</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">المبلغ (ريال)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={newDeduction.amount}
                onChange={(e) => setNewDeduction(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">التاريخ</Label>
              <Input
                id="date"
                type="date"
                value={newDeduction.date}
                onChange={(e) => setNewDeduction(prev => ({ ...prev, date: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">السبب</Label>
              <Textarea
                id="reason"
                value={newDeduction.reason}
                onChange={(e) => setNewDeduction(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="سبب الخصم والتفاصيل"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleAddDeduction}>
              حفظ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
