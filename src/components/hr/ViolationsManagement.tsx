
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { usePermissions } from '@/hooks/usePermissions';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { Plus, AlertTriangle, Eye } from 'lucide-react';

interface Violation {
  id: string;
  employee_id: string;
  employee_name: string;
  type: 'late' | 'absence' | 'misconduct' | 'safety' | 'dress_code' | 'other';
  severity: 'minor' | 'major' | 'severe';
  description: string;
  action_taken: 'verbal_warning' | 'written_warning' | 'suspension' | 'termination' | 'none';
  date: string;
  status: 'active' | 'resolved' | 'appealed';
  reported_by: string;
  created_at: string;
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
    severity: 'minor' as const,
    description: '',
    action_taken: 'none' as const,
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadViolations();
  }, [employeeId]);

  const loadViolations = async () => {
    try {
      setIsLoading(true);
      let query = supabase
        .from('employee_violations')
        .select('*');

      if (employeeId) {
        query = query.eq('employee_id', employeeId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        // جلب أسماء الموظفين
        const employeeIds = [...new Set(data.map(violation => violation.employee_id).filter(Boolean))];
        const { data: employees } = await supabase
          .from('employees')
          .select('id, name')
          .in('id', employeeIds);

        const employeeMap = new Map(employees?.map(emp => [emp.id, emp.name]) || []);

        const formattedViolations: Violation[] = data.map(violation => ({
          id: violation.id,
          employee_id: violation.employee_id || '',
          employee_name: employeeMap.get(violation.employee_id || '') || 'غير معروف',
          type: (violation.type as Violation['type']) || 'other',
          severity: (violation.severity as Violation['severity']) || 'minor',
          description: violation.description || '',
          action_taken: (violation.action_taken as Violation['action_taken']) || 'none',
          date: violation.date || '',
          status: (violation.status as Violation['status']) || 'active',
          reported_by: violation.created_by || 'غير محدد',
          created_at: violation.created_at || ''
        }));

        setViolations(formattedViolations);
      } else {
        setViolations([]);
      }
    } catch (error) {
      console.error('Error loading violations:', error);
      toast({
        title: 'خطأ في تحميل البيانات',
        description: 'حدث خطأ أثناء تحميل سجلات المخالفات',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddViolation = async () => {
    if (!hasPermission('add_violations')) {
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

      const { error } = await supabase
        .from('employee_violations')
        .insert([{
          ...newViolation,
          created_by: user.id,
          status: 'active'
        }]);

      if (error) throw error;

      // إنشاء خصم تلقائي إذا كان مطلوباً
      if (newViolation.action_taken === 'written_warning' || newViolation.action_taken === 'suspension') {
        await createAutomaticDeduction(newViolation);
      }

      toast({
        title: 'تم إضافة المخالفة بنجاح',
        description: 'تم تسجيل المخالفة في النظام'
      });

      setIsDialogOpen(false);
      setNewViolation({
        employee_id: employeeId || '',
        type: 'misconduct',
        severity: 'minor',
        description: '',
        action_taken: 'none',
        date: new Date().toISOString().split('T')[0]
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

  const createAutomaticDeduction = async (violation: any) => {
    try {
      let deductionAmount = 0;
      
      // تحديد مبلغ الخصم حسب نوع المخالفة وشدتها
      if (violation.severity === 'minor') {
        deductionAmount = 100;
      } else if (violation.severity === 'major') {
        deductionAmount = 300;
      } else if (violation.severity === 'severe') {
        deductionAmount = 500;
      }

      if (deductionAmount > 0) {
        await supabase
          .from('salary_deductions')
          .insert([{
            employee_id: violation.employee_id,
            amount: deductionAmount,
            reason: `خصم مخالفة: ${violation.description}`,
            date: violation.date,
            auto_generated: true,
            status: 'approved'
          }]);
      }
    } catch (error) {
      console.error('Error creating automatic deduction:', error);
    }
  };

  const getViolationTypeText = (type: string) => {
    const typeMap = {
      late: 'تأخير',
      absence: 'غياب',
      misconduct: 'سوء سلوك',
      safety: 'مخالفة أمان',
      dress_code: 'مخالفة زي',
      other: 'أخرى'
    };
    return typeMap[type as keyof typeof typeMap] || type;
  };

  const getSeverityBadge = (severity: string) => {
    const severityMap = {
      minor: { text: 'بسيطة', class: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' },
      major: { text: 'كبيرة', class: 'bg-orange-100 text-orange-800 hover:bg-orange-200' },
      severe: { text: 'جسيمة', class: 'bg-red-100 text-red-800 hover:bg-red-200' }
    };
    const severityInfo = severityMap[severity as keyof typeof severityMap] || { text: severity, class: 'bg-gray-100 text-gray-800' };
    
    return (
      <Badge className={severityInfo.class}>
        {severityInfo.text}
      </Badge>
    );
  };

  const getActionText = (action: string) => {
    const actionMap = {
      verbal_warning: 'إنذار شفهي',
      written_warning: 'إنذار كتابي',
      suspension: 'إيقاف',
      termination: 'فصل',
      none: 'لا يوجد'
    };
    return actionMap[action as keyof typeof actionMap] || action;
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      active: { text: 'نشطة', class: 'bg-red-100 text-red-800 hover:bg-red-200' },
      resolved: { text: 'محلولة', class: 'bg-green-100 text-green-800 hover:bg-green-200' },
      appealed: { text: 'مستأنفة', class: 'bg-blue-100 text-blue-800 hover:bg-blue-200' }
    };
    const statusInfo = statusMap[status as keyof typeof statusMap] || { text: status, class: 'bg-gray-100 text-gray-800' };
    
    return (
      <Badge className={statusInfo.class}>
        {statusInfo.text}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            إدارة المخالفات والإجراءات التأديبية
          </CardTitle>
          {hasPermission('add_violations') && (
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
                  <TableHead>الشدة</TableHead>
                  <TableHead>الوصف</TableHead>
                  <TableHead>الإجراء المتخذ</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>الإجراءات</TableHead>
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
                    <TableCell>{getViolationTypeText(violation.type)}</TableCell>
                    <TableCell>{getSeverityBadge(violation.severity)}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {violation.description}
                    </TableCell>
                    <TableCell>{getActionText(violation.action_taken)}</TableCell>
                    <TableCell>{getStatusBadge(violation.status)}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedViolation(violation);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">لا توجد سجلات مخالفات</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>إضافة مخالفة جديدة</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
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
              <Label htmlFor="severity">شدة المخالفة</Label>
              <Select
                value={newViolation.severity}
                onValueChange={(value) => setNewViolation(prev => ({ ...prev, severity: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="minor">بسيطة</SelectItem>
                  <SelectItem value="major">كبيرة</SelectItem>
                  <SelectItem value="severe">جسيمة</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="action">الإجراء المتخذ</Label>
              <Select
                value={newViolation.action_taken}
                onValueChange={(value) => setNewViolation(prev => ({ ...prev, action_taken: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">لا يوجد</SelectItem>
                  <SelectItem value="verbal_warning">إنذار شفهي</SelectItem>
                  <SelectItem value="written_warning">إنذار كتابي</SelectItem>
                  <SelectItem value="suspension">إيقاف</SelectItem>
                  <SelectItem value="termination">فصل</SelectItem>
                </SelectContent>
              </Select>
            </div>

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
              <Label htmlFor="description">وصف المخالفة</Label>
              <Textarea
                id="description"
                value={newViolation.description}
                onChange={(e) => setNewViolation(prev => ({ ...prev, description: e.target.value }))}
                placeholder="وصف تفصيلي للمخالفة والظروف المحيطة بها"
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleAddViolation}>
              حفظ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* مشاهدة تفاصيل المخالفة */}
      <Dialog open={!!selectedViolation} onOpenChange={() => setSelectedViolation(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>تفاصيل المخالفة</DialogTitle>
          </DialogHeader>
          {selectedViolation && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">الموظف</Label>
                  <p>{selectedViolation.employee_name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">التاريخ</Label>
                  <p>{format(new Date(selectedViolation.date), 'yyyy/MM/dd')}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">النوع</Label>
                  <p>{getViolationTypeText(selectedViolation.type)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">الشدة</Label>
                  <div>{getSeverityBadge(selectedViolation.severity)}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">الإجراء المتخذ</Label>
                  <p>{getActionText(selectedViolation.action_taken)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">الحالة</Label>
                  <div>{getStatusBadge(selectedViolation.status)}</div>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">وصف المخالفة</Label>
                <p className="mt-1 p-3 bg-muted rounded-lg text-sm">
                  {selectedViolation.description}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedViolation(null)}>
              إغلاق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
