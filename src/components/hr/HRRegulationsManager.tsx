
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { usePermissions } from '@/hooks/usePermissions';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Edit, Settings, FileText, Save } from 'lucide-react';

interface AttendanceRule {
  id: string;
  type: string;
  threshold: number;
  action: string;
  amount?: number;
  autoApply: boolean;
  description: string;
}

interface DatabaseRegulation {
  id: string;
  category: string;
  rules: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  updated_by: string | null;
  last_updated: string | null;
  description: string | null;
}

interface HRRegulation {
  id: string;
  category: 'attendance' | 'salary' | 'benefits' | 'disciplinary';
  rules: AttendanceRule[];
  isActive: boolean;
  lastUpdated: string;
  updatedBy: string;
}

interface HRRegulationsManagerProps {
  employeeId?: string;
}

export function HRRegulationsManager({ employeeId }: HRRegulationsManagerProps) {
  const [regulations, setRegulations] = useState<HRRegulation[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRegulation, setSelectedRegulation] = useState<HRRegulation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const { hasPermission } = usePermissions();
  const { toast } = useToast();

  const [newRule, setNewRule] = useState<AttendanceRule>({
    id: '',
    type: 'absence',
    threshold: 1,
    action: 'warning',
    amount: 0,
    autoApply: true,
    description: ''
  });

  useEffect(() => {
    if (hasPermission('configure_hr_rules')) {
      loadHRRegulations();
    }
  }, []);

  const loadHRRegulations = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('hr_regulations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // تحويل البيانات من قاعدة البيانات إلى الصيغة المطلوبة
      const formattedRegulations: HRRegulation[] = (data || []).map((reg: DatabaseRegulation) => ({
        id: reg.id,
        category: reg.category as HRRegulation['category'],
        rules: Array.isArray(reg.rules) ? reg.rules : [],
        isActive: reg.is_active,
        lastUpdated: reg.last_updated || reg.updated_at,
        updatedBy: reg.updated_by || 'system'
      }));

      setRegulations(formattedRegulations);
    } catch (error) {
      console.error('Error loading HR regulations:', error);
      toast({
        title: 'خطأ في تحميل البيانات',
        description: 'حدث خطأ أثناء تحميل اللوائح',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveRegulation = async (regulation: HRRegulation) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('المستخدم غير مسجل الدخول');

      const regulationData = {
        category: regulation.category,
        rules: regulation.rules as any,
        is_active: regulation.isActive,
        last_updated: new Date().toISOString(),
        updated_by: user.id
      };

      if (regulation.id && regulation.id !== '') {
        const { error } = await supabase
          .from('hr_regulations')
          .update(regulationData)
          .eq('id', regulation.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('hr_regulations')
          .insert([regulationData]);
        if (error) throw error;
      }

      toast({
        title: 'تم حفظ اللائحة بنجاح',
        description: 'تم تحديث اللوائح في النظام'
      });

      loadHRRegulations();
    } catch (error) {
      console.error('Error saving regulation:', error);
      toast({
        title: 'خطأ في الحفظ',
        description: 'حدث خطأ أثناء حفظ اللائحة',
        variant: 'destructive'
      });
    }
  };

  const toggleRegulationStatus = async (regulationId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('hr_regulations')
        .update({ is_active: isActive })
        .eq('id', regulationId);

      if (error) throw error;

      toast({
        title: isActive ? 'تم تفعيل اللائحة' : 'تم إلغاء تفعيل اللائحة',
        description: 'تم تحديث حالة اللائحة'
      });

      loadHRRegulations();
    } catch (error) {
      console.error('Error toggling regulation status:', error);
      toast({
        title: 'خطأ في التحديث',
        description: 'حدث خطأ أثناء تحديث حالة اللائحة',
        variant: 'destructive'
      });
    }
  };

  const defaultRegulations: HRRegulation[] = [
    {
      id: 'attendance-rules',
      category: 'attendance',
      isActive: true,
      lastUpdated: new Date().toISOString(),
      updatedBy: 'system',
      rules: [
        {
          id: '1',
          type: 'absence',
          threshold: 1,
          action: 'notification',
          autoApply: true,
          description: 'إرسال إشعار للموظف في حالة الغياب'
        },
        {
          id: '2',
          type: 'absence',
          threshold: 3,
          action: 'warning',
          autoApply: true,
          description: 'إنذار شفهي بعد 3 أيام غياب متتالية'
        },
        {
          id: '3',
          type: 'late',
          threshold: 15,
          action: 'deduction',
          amount: 50,
          autoApply: true,
          description: 'خصم 50 ريال عند التأخير أكثر من 15 دقيقة'
        },
        {
          id: '4',
          type: 'late',
          threshold: 30,
          action: 'warning',
          autoApply: true,
          description: 'إنذار كتابي عند التأخير أكثر من 30 دقيقة'
        }
      ]
    },
    {
      id: 'salary-rules',
      category: 'salary',
      isActive: true,
      lastUpdated: new Date().toISOString(),
      updatedBy: 'system',
      rules: [
        {
          id: '5',
          type: 'overtime',
          threshold: 60,
          action: 'notification',
          autoApply: true,
          description: 'حساب العمل الإضافي بعد ساعة من نهاية الدوام'
        }
      ]
    }
  ];

  const initializeDefaultRegulations = async () => {
    try {
      for (const regulation of defaultRegulations) {
        await saveRegulation(regulation);
      }
      toast({
        title: 'تم إنشاء اللوائح الافتراضية',
        description: 'تم إنشاء اللوائح الأساسية للموارد البشرية'
      });
    } catch (error) {
      console.error('Error initializing default regulations:', error);
      toast({
        title: 'خطأ في الإنشاء',
        description: 'حدث خطأ أثناء إنشاء اللوائح الافتراضية',
        variant: 'destructive'
      });
    }
  };

  if (!hasPermission('configure_hr_rules')) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Settings className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">ليس لديك صلاحية لإدارة اللوائح والأنظمة</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            إدارة اللوائح والأنظمة
          </CardTitle>
          <div className="flex gap-2">
            {regulations.length === 0 && (
              <Button variant="outline" onClick={initializeDefaultRegulations}>
                إنشاء اللوائح الافتراضية
              </Button>
            )}
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              إضافة لائحة
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">جاري التحميل...</div>
          ) : regulations.length > 0 ? (
            <div className="space-y-4">
              {regulations.map((regulation) => (
                <Card key={regulation.id} className="border">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold">
                          {regulation.category === 'attendance' ? 'لوائح الحضور والانصراف' :
                           regulation.category === 'salary' ? 'لوائح الرواتب' :
                           regulation.category === 'benefits' ? 'لوائح الاستحقاقات' :
                           regulation.category === 'disciplinary' ? 'لوائح التأديب' : 
                           regulation.category}
                        </h3>
                        <Badge variant={regulation.isActive ? 'default' : 'secondary'}>
                          {regulation.isActive ? 'نشطة' : 'معطلة'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={regulation.isActive}
                          onCheckedChange={(checked) => toggleRegulationStatus(regulation.id, checked)}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedRegulation(regulation);
                            setIsDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {regulation.rules.map((rule, index) => (
                        <div key={rule.id || index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div>
                            <p className="font-medium text-sm">{rule.description}</p>
                            <p className="text-xs text-muted-foreground">
                              النوع: {rule.type} | العتبة: {rule.threshold} | 
                              الإجراء: {rule.action} | تلقائي: {rule.autoApply ? 'نعم' : 'لا'}
                              {rule.amount && ` | المبلغ: ${rule.amount} ريال`}
                            </p>
                          </div>
                          <Badge variant={rule.autoApply ? 'default' : 'outline'}>
                            {rule.autoApply ? 'تلقائي' : 'يدوي'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">لا توجد لوائح مُعرَّفة</p>
              <Button onClick={initializeDefaultRegulations}>
                إنشاء اللوائح الافتراضية
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedRegulation ? 'تعديل اللائحة' : 'إضافة لائحة جديدة'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">فئة اللائحة</Label>
                <Select defaultValue="attendance">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="attendance">الحضور والانصراف</SelectItem>
                    <SelectItem value="salary">الرواتب</SelectItem>
                    <SelectItem value="benefits">الاستحقاقات</SelectItem>
                    <SelectItem value="disciplinary">التأديب</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <Switch id="active" defaultChecked />
                <Label htmlFor="active">نشطة</Label>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">إضافة قاعدة جديدة</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ruleType">نوع القاعدة</Label>
                  <Select
                    value={newRule.type}
                    onValueChange={(value) => setNewRule(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="absence">غياب</SelectItem>
                      <SelectItem value="late">تأخير</SelectItem>
                      <SelectItem value="early_leave">خروج مبكر</SelectItem>
                      <SelectItem value="overtime">عمل إضافي</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="threshold">العتبة</Label>
                  <Input
                    id="threshold"
                    type="number"
                    value={newRule.threshold}
                    onChange={(e) => setNewRule(prev => ({ ...prev, threshold: parseInt(e.target.value) || 0 }))}
                    placeholder={newRule.type === 'late' ? 'دقائق' : 'أيام'}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="action">الإجراء</Label>
                  <Select
                    value={newRule.action}
                    onValueChange={(value) => setNewRule(prev => ({ ...prev, action: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="notification">إشعار</SelectItem>
                      <SelectItem value="warning">إنذار</SelectItem>
                      <SelectItem value="deduction">خصم</SelectItem>
                      <SelectItem value="disciplinary">إجراء تأديبي</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {newRule.action === 'deduction' && (
                  <div className="space-y-2">
                    <Label htmlFor="amount">مبلغ الخصم (ريال)</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      value={newRule.amount}
                      onChange={(e) => setNewRule(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">وصف القاعدة</Label>
                <Textarea
                  id="description"
                  value={newRule.description}
                  onChange={(e) => setNewRule(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="وصف تفصيلي للقاعدة ومتى تُطبق"
                />
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <Switch
                  id="autoApply"
                  checked={newRule.autoApply}
                  onCheckedChange={(checked) => setNewRule(prev => ({ ...prev, autoApply: checked }))}
                />
                <Label htmlFor="autoApply">تطبيق تلقائي</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={() => {
              console.log('Saving new rule:', newRule);
              setIsDialogOpen(false);
            }}>
              <Save className="h-4 w-4 mr-2" />
              حفظ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
