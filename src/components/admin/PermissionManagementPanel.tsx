import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Key, 
  Plus, 
  Edit, 
  Trash2, 
  Calendar,
  User,
  Shield
} from 'lucide-react';

interface CustomPermission {
  id: string;
  user_id: string;
  permission_type: string;
  resource_id?: string;
  granted_by: string;
  granted_at: string;
  expires_at?: string;
  is_active: boolean;
  user_email?: string;
  granted_by_email?: string;
}

export function PermissionManagementPanel() {
  const [permissions, setPermissions] = useState<CustomPermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState<CustomPermission | null>(null);
  const { toast } = useToast();

  // بيانات النموذج
  const [formData, setFormData] = useState({
    userEmail: '',
    permissionType: '',
    expiresAt: '',
    description: ''
  });

  useEffect(() => {
    loadPermissions();
  }, []);

  const loadPermissions = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('custom_permissions')
        .select(`
          *,
          user:user_id(email),
          granted_by_user:granted_by(email)
        `)
        .order('granted_at', { ascending: false });

      if (error) throw error;

      const permissionsWithEmails = data?.map(permission => ({
        ...permission,
        user_email: permission.user?.email,
        granted_by_email: permission.granted_by_user?.email
      })) || [];

      setPermissions(permissionsWithEmails);
    } catch (error) {
      console.error('خطأ في تحميل الأذونات:', error);
      toast({
        title: 'خطأ في تحميل الأذونات',
        description: 'حدث خطأ أثناء تحميل الأذونات المخصصة',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // البحث عن المستخدم بالبريد الإلكتروني
      const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
      
      if (usersError) throw usersError;
      
      const targetUser = users.find(user => user.email === formData.userEmail);
      
      if (!targetUser) {
        toast({
          title: 'خطأ',
          description: 'لم يتم العثور على مستخدم بهذا البريد الإلكتروني',
          variant: 'destructive',
        });
        return;
      }

      const permissionData = {
        user_id: targetUser.id,
        permission_type: formData.permissionType,
        expires_at: formData.expiresAt || null,
        is_active: true
      };

      if (selectedPermission) {
        // تحديث إذن موجود
        const { error } = await supabase
          .from('custom_permissions')
          .update(permissionData)
          .eq('id', selectedPermission.id);

        if (error) throw error;
      } else {
        // إضافة إذن جديد
        const { error } = await supabase
          .from('custom_permissions')
          .insert(permissionData);

        if (error) throw error;
      }

      await loadPermissions();
      setShowDialog(false);
      setSelectedPermission(null);
      setFormData({
        userEmail: '',
        permissionType: '',
        expiresAt: '',
        description: ''
      });

      toast({
        title: 'تم الحفظ',
        description: selectedPermission ? 'تم تحديث الإذن بنجاح' : 'تم إضافة الإذن بنجاح',
      });
    } catch (error) {
      console.error('خطأ في حفظ الإذن:', error);
      toast({
        title: 'خطأ في الحفظ',
        description: 'حدث خطأ أثناء حفظ الإذن',
        variant: 'destructive',
      });
    }
  };

  const deletePermission = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الإذن؟')) return;

    try {
      const { error } = await supabase
        .from('custom_permissions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await loadPermissions();
      
      toast({
        title: 'تم الحذف',
        description: 'تم حذف الإذن بنجاح',
      });
    } catch (error) {
      console.error('خطأ في حذف الإذن:', error);
      toast({
        title: 'خطأ في الحذف',
        description: 'حدث خطأ أثناء حذف الإذن',
        variant: 'destructive',
      });
    }
  };

  const togglePermissionStatus = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('custom_permissions')
        .update({ is_active: !isActive })
        .eq('id', id);

      if (error) throw error;

      await loadPermissions();
      
      toast({
        title: 'تم التحديث',
        description: `تم ${!isActive ? 'تفعيل' : 'إلغاء'} الإذن`,
      });
    } catch (error) {
      console.error('خطأ في تحديث الإذن:', error);
      toast({
        title: 'خطأ في التحديث',
        description: 'حدث خطأ أثناء تحديث الإذن',
        variant: 'destructive',
      });
    }
  };

  const permissionTypes = [
    'view_employees', 'add_employees', 'edit_employees', 'delete_employees',
    'view_attendance', 'add_attendance', 'edit_attendance', 'approve_attendance',
    'view_salaries', 'process_salaries', 'approve_salaries',
    'manage_benefits', 'manage_deductions', 'approve_benefits',
    'view_violations', 'add_violations', 'approve_violations',
    'configure_hr_rules', 'view_reports', 'export_data',
    'manage_users', 'configure_system', 'view_audit_logs'
  ];

  const permissionLabels: Record<string, string> = {
    'view_employees': 'عرض الموظفين',
    'add_employees': 'إضافة موظفين',
    'edit_employees': 'تعديل الموظفين',
    'delete_employees': 'حذف الموظفين',
    'view_attendance': 'عرض الحضور',
    'add_attendance': 'إضافة حضور',
    'edit_attendance': 'تعديل الحضور',
    'approve_attendance': 'اعتماد الحضور',
    'view_salaries': 'عرض الرواتب',
    'process_salaries': 'معالجة الرواتب',
    'approve_salaries': 'اعتماد الرواتب',
    'manage_benefits': 'إدارة المزايا',
    'manage_deductions': 'إدارة الخصومات',
    'approve_benefits': 'اعتماد المزايا',
    'view_violations': 'عرض المخالفات',
    'add_violations': 'إضافة مخالفات',
    'approve_violations': 'اعتماد المخالفات',
    'configure_hr_rules': 'إعداد قوانين الموارد البشرية',
    'view_reports': 'عرض التقارير',
    'export_data': 'تصدير البيانات',
    'manage_users': 'إدارة المستخدمين',
    'configure_system': 'إعداد النظام',
    'view_audit_logs': 'عرض سجلات التدقيق'
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                إدارة الأذونات المخصصة
              </CardTitle>
              <CardDescription>
                منح أذونات خاصة للمستخدمين خارج نطاق أدوارهم الافتراضية
              </CardDescription>
            </div>
            <Button
              onClick={() => {
                setSelectedPermission(null);
                setFormData({
                  userEmail: '',
                  permissionType: '',
                  expiresAt: '',
                  description: ''
                });
                setShowDialog(true);
              }}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              إضافة إذن مخصص
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>المستخدم</TableHead>
                  <TableHead>نوع الإذن</TableHead>
                  <TableHead>تاريخ المنح</TableHead>
                  <TableHead>تاريخ الانتهاء</TableHead>
                  <TableHead>منح بواسطة</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      جاري التحميل...
                    </TableCell>
                  </TableRow>
                ) : permissions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      لا توجد أذونات مخصصة
                    </TableCell>
                  </TableRow>
                ) : (
                  permissions.map((permission) => (
                    <TableRow key={permission.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <div>
                            <div className="font-medium">
                              {permission.user_email}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {permission.user_id.substring(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {permissionLabels[permission.permission_type] || permission.permission_type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4" />
                          {new Date(permission.granted_at).toLocaleDateString('ar-SA')}
                        </div>
                      </TableCell>
                      <TableCell>
                        {permission.expires_at ? (
                          <div className="text-sm">
                            {new Date(permission.expires_at).toLocaleDateString('ar-SA')}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">بلا انتهاء</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          <Shield className="h-4 w-4" />
                          {permission.granted_by_email}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={permission.is_active ? "default" : "secondary"}
                          className="cursor-pointer"
                          onClick={() => togglePermissionStatus(permission.id, permission.is_active)}
                        >
                          {permission.is_active ? 'نشط' : 'معطل'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedPermission(permission);
                              setFormData({
                                userEmail: permission.user_email || '',
                                permissionType: permission.permission_type,
                                expiresAt: permission.expires_at ? 
                                  new Date(permission.expires_at).toISOString().split('T')[0] : '',
                                description: ''
                              });
                              setShowDialog(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deletePermission(permission.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* مربع حوار إضافة/تعديل الإذن */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedPermission ? 'تعديل الإذن المخصص' : 'إضافة إذن مخصص'}
            </DialogTitle>
            <DialogDescription>
              منح إذن خاص لمستخدم معين لمدة محددة أو دائمة
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="userEmail">البريد الإلكتروني للمستخدم</Label>
              <Input
                id="userEmail"
                type="email"
                value={formData.userEmail}
                onChange={(e) => setFormData({ ...formData, userEmail: e.target.value })}
                placeholder="user@example.com"
                required
                disabled={!!selectedPermission}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="permissionType">نوع الإذن</Label>
              <Select 
                value={formData.permissionType} 
                onValueChange={(value) => setFormData({ ...formData, permissionType: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر نوع الإذن" />
                </SelectTrigger>
                <SelectContent>
                  {permissionTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {permissionLabels[type]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiresAt">تاريخ الانتهاء (اختياري)</Label>
              <Input
                id="expiresAt"
                type="date"
                value={formData.expiresAt}
                onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">ملاحظات</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="سبب منح هذا الإذن..."
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                إلغاء
              </Button>
              <Button type="submit">
                {selectedPermission ? 'تحديث' : 'إضافة'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}