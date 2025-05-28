
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
import { Plus, Edit, Check, X } from 'lucide-react';

interface Benefit {
  id: string;
  employee_id: string;
  employee_name: string;
  type: 'bonus' | 'allowance' | 'commission' | 'overtime' | 'other';
  amount: number;
  description: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
}

interface BenefitsManagementProps {
  employeeId?: string;
}

export function BenefitsManagement({ employeeId }: BenefitsManagementProps) {
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const { hasPermission } = usePermissions();
  const { toast } = useToast();

  const [newBenefit, setNewBenefit] = useState({
    employee_id: employeeId || '',
    type: 'bonus' as const,
    amount: 0,
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadBenefits();
  }, [employeeId]);

  const loadBenefits = async () => {
    try {
      setIsLoading(true);
      let query = supabase
        .from('employee_benefits')
        .select(`
          *,
          employees!inner(name)
        `);

      if (employeeId) {
        query = query.eq('employee_id', employeeId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      const formattedBenefits = data?.map(benefit => ({
        ...benefit,
        employee_name: benefit.employees?.name || 'غير معروف'
      })) || [];

      setBenefits(formattedBenefits);
    } catch (error) {
      console.error('Error loading benefits:', error);
      toast({
        title: 'خطأ في تحميل البيانات',
        description: 'حدث خطأ أثناء تحميل سجلات الاستحقاقات',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddBenefit = async () => {
    if (!hasPermission('manage_benefits')) {
      toast({
        title: 'غير مسموح',
        description: 'ليس لديك صلاحية لإضافة الاستحقاقات',
        variant: 'destructive'
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('المستخدم غير مسجل الدخول');

      const { error } = await supabase
        .from('employee_benefits')
        .insert([{
          ...newBenefit,
          created_by: user.id,
          status: hasPermission('approve_benefits') ? 'approved' : 'pending',
          approved_by: hasPermission('approve_benefits') ? user.id : null,
          approved_at: hasPermission('approve_benefits') ? new Date().toISOString() : null
        }]);

      if (error) throw error;

      toast({
        title: 'تم إضافة الاستحقاق بنجاح',
        description: hasPermission('approve_benefits') ? 'تم اعتماد الاستحقاق تلقائياً' : 'الاستحقاق في انتظار الاعتماد'
      });

      setIsDialogOpen(false);
      setNewBenefit({
        employee_id: employeeId || '',
        type: 'bonus',
        amount: 0,
        description: '',
        date: new Date().toISOString().split('T')[0]
      });
      
      loadBenefits();
    } catch (error) {
      console.error('Error adding benefit:', error);
      toast({
        title: 'خطأ في الحفظ',
        description: 'حدث خطأ أثناء حفظ الاستحقاق',
        variant: 'destructive'
      });
    }
  };

  const handleApproveBenefit = async (benefitId: string, approved: boolean) => {
    if (!hasPermission('approve_benefits')) {
      toast({
        title: 'غير مسموح',
        description: 'ليس لديك صلاحية لاعتماد الاستحقاقات',
        variant: 'destructive'
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('المستخدم غير مسجل الدخول');

      const { error } = await supabase
        .from('employee_benefits')
        .update({
          status: approved ? 'approved' : 'rejected',
          approved_by: user.id,
          approved_at: new Date().toISOString()
        })
        .eq('id', benefitId);

      if (error) throw error;

      toast({
        title: approved ? 'تم اعتماد الاستحقاق' : 'تم رفض الاستحقاق',
        description: 'تم تحديث حالة الاستحقاق بنجاح'
      });

      loadBenefits();
    } catch (error) {
      console.error('Error updating benefit status:', error);
      toast({
        title: 'خطأ في التحديث',
        description: 'حدث خطأ أثناء تحديث حالة الاستحقاق',
        variant: 'destructive'
      });
    }
  };

  const getBenefitTypeText = (type: string) => {
    const typeMap = {
      bonus: 'مكافأة',
      allowance: 'بدل',
      commission: 'عمولة',
      overtime: 'عمل إضافي',
      other: 'أخرى'
    };
    return typeMap[type as keyof typeof typeMap] || type;
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { text: 'في الانتظار', class: 'bg-yellow-100 text-yellow-800' },
      approved: { text: 'معتمد', class: 'bg-green-100 text-green-800' },
      rejected: { text: 'مرفوض', class: 'bg-red-100 text-red-800' }
    };
    const statusInfo = statusMap[status as keyof typeof statusMap] || { text: status, class: 'bg-gray-100 text-gray-800' };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.class}`}>
        {statusInfo.text}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>إدارة الاستحقاقات والمكافآت</CardTitle>
          {hasPermission('manage_benefits') && (
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              إضافة استحقاق
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">جاري التحميل...</div>
          ) : benefits.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>التاريخ</TableHead>
                  {!employeeId && <TableHead>اسم الموظف</TableHead>}
                  <TableHead>النوع</TableHead>
                  <TableHead>المبلغ</TableHead>
                  <TableHead>الوصف</TableHead>
                  <TableHead>الحالة</TableHead>
                  {hasPermission('approve_benefits') && <TableHead>الإجراءات</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {benefits.map((benefit) => (
                  <TableRow key={benefit.id}>
                    <TableCell>
                      {format(new Date(benefit.date), 'yyyy/MM/dd')}
                    </TableCell>
                    {!employeeId && (
                      <TableCell>{benefit.employee_name}</TableCell>
                    )}
                    <TableCell>{getBenefitTypeText(benefit.type)}</TableCell>
                    <TableCell>{formatSalary(benefit.amount)}</TableCell>
                    <TableCell>{benefit.description}</TableCell>
                    <TableCell>{getStatusBadge(benefit.status)}</TableCell>
                    {hasPermission('approve_benefits') && benefit.status === 'pending' && (
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleApproveBenefit(benefit.id, true)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleApproveBenefit(benefit.id, false)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">لا توجد سجلات استحقاقات</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>إضافة استحقاق جديد</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="type">نوع الاستحقاق</Label>
              <Select
                value={newBenefit.type}
                onValueChange={(value) => setNewBenefit(prev => ({ ...prev, type: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bonus">مكافأة</SelectItem>
                  <SelectItem value="allowance">بدل</SelectItem>
                  <SelectItem value="commission">عمولة</SelectItem>
                  <SelectItem value="overtime">عمل إضافي</SelectItem>
                  <SelectItem value="other">أخرى</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">المبلغ (ريال)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={newBenefit.amount}
                onChange={(e) => setNewBenefit(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">التاريخ</Label>
              <Input
                id="date"
                type="date"
                value={newBenefit.date}
                onChange={(e) => setNewBenefit(prev => ({ ...prev, date: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">الوصف</Label>
              <Textarea
                id="description"
                value={newBenefit.description}
                onChange={(e) => setNewBenefit(prev => ({ ...prev, description: e.target.value }))}
                placeholder="وصف الاستحقاق وسبب منحه"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleAddBenefit}>
              حفظ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
