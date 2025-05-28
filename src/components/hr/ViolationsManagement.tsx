
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
import { Plus, Edit, AlertTriangle, FileText, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Violation {
  id: string;
  employee_id: string | null;
  employee_name: string;
  type: 'late' | 'absence' | 'misconduct' | 'safety' | 'dress_code' | 'other';
  description: string;
  date: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'resolved' | 'dismissed';
  action_taken: string | null;
  auto_generated: boolean | null;
  created_at: string;
  created_by: string | null;
  reported_by: string;
}

interface ViolationsManagementProps {
  employeeId?: string;
}

export function ViolationsManagement({ employeeId }: ViolationsManagementProps) {
  const [violations, setViolations] = useState<Violation[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedViolation, setSelectedViolation] = useState<Violation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const { hasPermission } = usePermissions();
  const { toast } = useToast();

  const [newViolation, setNewViolation] = useState({
    employee_id: employeeId || '',
    type: 'misconduct' as const,
    description: '',
    date: new Date().toISOString().split('T')[0],
    severity: 'medium' as const,
    action_taken: '',
    reported_by: ''
  });

  useEffect(() => {
    loadViolations();
  }, [employeeId]);

  const loadViolations = async () => {
    try {
      setIsLoading(true);
      console.log('Loading violations...');
      
      let query = supabase
        .from('employee_violations')
        .select('*, employees(name)')
        .order('date', { ascending: false });

      if (employeeId) {
        query = query.eq('employee_id', employeeId);
      }

      const { data: violationsData, error } = await query;

      if (error) throw error;

      const formattedViolations: Violation[] = (violationsData || []).map(violation => ({
        id: violation.id,
        employee_id: violation.employee_id,
        employee_name: violation.employees?.name || 'غير معروف',
        type: violation.type as Violation['type'],
        description: violation.description,
        date: violation.date,
        severity: violation.severity as Violation['severity'],
        status: violation.status as Violation['status'],
        action_taken: violation.action_taken,
        auto_generated: violation.auto_generated,
        created_at: violation.created_at,
        created_by: violation.created_by,
        reported_by: violation.created_by || 'النظام'
      }));

      setViolations(formattedViolations);
    } catch (error) {
      console.error('Error loading violations:', error);
      toast({
        title: 'خطأ في تحميل البيانات',
        description: 'حدث خطأ أثناء تحميل سجلات المخالفات',
        variant: 'destructive'
      });
      setViolations([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddViolation = async () => {
    if (!hasPermission('add_violation')) {
      toast({
        title: 'غير مسموح',
        description: 'ليس لديك صلاحية لإضافة المخالفات',
        variant: 'destructive'
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('المستخدم غير مسجل الدخول');

      const violationData = {
        employee_id: newViolation.employee_id,
        type: newViolation.type,
        description: newViolation.description,
        date: newViolation.date,
        severity: newViolation.severity,
        action_taken: newViolation.action_taken || null,
        auto_generated: false,
        status: 'active',
        created_by: user.id
      };

      const { error } = await supabase
        .from('employee_violations')
        .insert([violationData]);

      if (error) throw error;

      // تطبيق الإجراءات التلقائية حسب نوع المخالفة
      await applyAutomaticActions(violationData);

      toast({
        title: 'تم إضافة المخالفة بنجاح',
        description: 'تم حفظ المخالفة وتطبيق الإجراءات المناسبة'
      });

      setIsDialogOpen(false);
      setNewViolation({
        employee_id: employeeId || '',
        type: 'misconduct',
        description: '',
        date: new Date().toISOString().split('T')[0],
        severity: 'medium',
        action_taken: '',
        reported_by: ''
      });
      
      loadViolations();
    } catch (error) {
      console.error('Error adding violation:', error);
      toast({
        title: 'خطأ في الحفظ',
        description: 'حدث خطأ أثناء حفظ المخالفة',
        variant: 'destructive'
      });
    }
  };

  const applyAutomaticActions = async (violation: any) => {
    try {
      console.log('Applying automatic actions for violation:', violation);
      
      // تطبيق إجراءات حسب شدة المخالفة
      if (violation.severity === 'high' || violation.severity === 'critical') {
        // إضافة خصم مالي للمخالفات الشديدة
        const deductionAmount = violation.severity === 'critical' ? 500 : 200;
        
        await supabase
          .from('salary_deductions')
          .insert([{
            employee_id: violation.employee_id,
            amount: deductionAmount,
            reason: `خصم مخالفة - ${violation.description}`,
            date: violation.date,
            auto_generated: true,
            status: 'pending'
          }]);
      }
      
      // إرسال إشعار للإدارة
      await supabase
        .from('alert_logs')
        .insert([{
          alert_type: 'violation_notification',
          reference_type: 'violation',
          reference_id: violation.employee_id,
          message: `مخالفة جديدة: ${violation.description}`,
          status: 'pending'
        }]);
    } catch (error) {
      console.error('Error applying automatic actions:', error);
    }
  };

  const getSeverityBadge = (severity: string) => {
    const variants = {
      low: 'default',
      medium: 'secondary', 
      high: 'destructive',
      critical: 'destructive'
    } as const;
    
    const labels = {
      low: 'بسيطة',
      medium: 'متوسطة',
      high: 'شديدة', 
      critical: 'حرجة'
    };
    
    return (
      <Badge variant={variants[severity as keyof typeof variants] || 'default'}>
        {labels[severity as keyof typeof labels] || severity}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    const labels = {
      late: 'تأخير',
      absence: 'غياب',
      misconduct: 'سوء سلوك',
      safety: 'مخالفة أمان',
      dress_code: 'مخالفة زي',
      other: 'أخرى'
    };
    
    return (
      <Badge variant="outline">
        {labels[type as keyof typeof labels] || type}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'destructive',
      resolved: 'default',
      dismissed: 'secondary'
    } as const;
    
    const labels = {
      active: 'نشطة',
      resolved: 'محلولة',
      dismissed: 'ملغية'
    };
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'default'}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>إدارة المخالفات</CardTitle>
          {hasPermission('add_violation') && (
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              إضافة مخالفة
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">جاري التحميل...</div>
          ) : violations.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>التاريخ</TableHead>
                  {!employeeId && <TableHead>اسم الموظف</TableHead>}
                  <TableHead>النوع</TableHead>
                  <TableHead>الوصف</TableHead>
                  <TableHead>الشدة</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>الإجراء المتخذ</TableHead>
                  {hasPermission('edit_violation') && <TableHead>الإجراءات</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {violations.map((violation) => (
                  <TableRow key={violation.id}>
                    <TableCell>
                      {format(new Date(violation.date), 'yyyy/MM/dd')}
                    </TableCell>
                    {!employeeId && (
                      <TableCell>{violation.employee_name}</TableCell>
                    )}
                    <TableCell>{getTypeBadge(violation.type)}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {violation.description}
                    </TableCell>
                    <TableCell>{getSeverityBadge(violation.severity)}</TableCell>
                    <TableCell>{getStatusBadge(violation.status)}</TableCell>
                    <TableCell>{violation.action_taken || '-'}</TableCell>
                    {hasPermission('edit_violation') && (
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedViolation(violation);
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
              <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">لا توجد مخالفات مسجلة</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {selectedViolation ? 'تعديل المخالفة' : 'إضافة مخالفة جديدة'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="date">التاريخ</Label>
              <Input
                id="date"
                type="date"
                value={newViolation.date}
                onChange={(e) => setNewViolation(prev => ({ ...prev, date: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">نوع المخالفة</Label>
              <Select
                value={newViolation.type}
                onValueChange={(value) => setNewViolation(prev => ({ ...prev, type: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="late">تأخير</SelectItem>
                  <SelectItem value="absence">غياب</SelectItem>
                  <SelectItem value="misconduct">سوء سلوك</SelectItem>
                  <SelectItem value="safety">مخالفة أمان</SelectItem>
                  <SelectItem value="dress_code">مخالفة زي</SelectItem>
                  <SelectItem value="other">أخرى</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">وصف المخالفة</Label>
              <Input
                id="description"
                value={newViolation.description}
                onChange={(e) => setNewViolation(prev => ({ ...prev, description: e.target.value }))}
                placeholder="اكتب وصف المخالفة"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="severity">الشدة</Label>
              <Select
                value={newViolation.severity}
                onValueChange={(value) => setNewViolation(prev => ({ ...prev, severity: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">بسيطة</SelectItem>
                  <SelectItem value="medium">متوسطة</SelectItem>
                  <SelectItem value="high">شديدة</SelectItem>
                  <SelectItem value="critical">حرجة</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="action">الإجراء المتخذ</Label>
              <Input
                id="action"
                value={newViolation.action_taken}
                onChange={(e) => setNewViolation(prev => ({ ...prev, action_taken: e.target.value }))}
                placeholder="الإجراء المتخذ (اختياري)"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleAddViolation}>
              {selectedViolation ? 'تحديث' : 'حفظ'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
