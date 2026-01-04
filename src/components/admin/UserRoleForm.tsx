import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { createUser } from '@/services/adminUsersService';
import { useToast } from '@/hooks/use-toast';
import { DEFAULT_ROLE_PERMISSIONS, Permission } from '@/types/permissions';
import { z } from 'zod';

interface User {
  id: string;
  email: string;
  role?: string;
  permissions?: string[];
}

interface UserRoleFormProps {
  user: User | null;
  onSave: (userId: string, role: string, permissions: string[]) => void;
  onCancel: () => void;
}

// Password validation schema
const passwordSchema = z.string()
  .min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل')
  .regex(/[A-Z]/, 'كلمة المرور يجب أن تحتوي على حرف كبير واحد على الأقل')
  .regex(/[a-z]/, 'كلمة المرور يجب أن تحتوي على حرف صغير واحد على الأقل')
  .regex(/[0-9]/, 'كلمة المرور يجب أن تحتوي على رقم واحد على الأقل');

export function UserRoleForm({ user, onSave, onCancel }: UserRoleFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [role, setRole] = useState<string>('employee');
  const [customPermissions, setCustomPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      setEmail(user.email);
      setRole(user.role || 'employee');
      setCustomPermissions(user.permissions || []);
    } else {
      setEmail('');
      setPassword('');
      setPasswordError(null);
      setRole('employee');
      setCustomPermissions([]);
    }
  }, [user]);

  const availablePermissions: Permission[] = [
    'view_employees', 'add_employees', 'edit_employees', 'delete_employees',
    'view_attendance', 'add_attendance', 'edit_attendance', 'approve_attendance',
    'view_salaries', 'process_salaries', 'approve_salaries',
    'manage_benefits', 'manage_deductions', 'approve_benefits',
    'view_violations', 'add_violations', 'approve_violations',
    'configure_hr_rules', 'view_reports', 'export_data',
    'manage_users', 'configure_system', 'view_audit_logs'
  ];

  const permissionLabels: Record<Permission, string> = {
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

  const roleLabels = {
    'admin': 'مدير النظام',
    'hr_manager': 'مدير الموارد البشرية',
    'hr_officer': 'موظف موارد بشرية',
    'finance_manager': 'مدير مالي',
    'department_manager': 'مدير قسم',
    'employee': 'موظف'
  };

  const validatePassword = (pwd: string): boolean => {
    try {
      passwordSchema.parse(pwd);
      setPasswordError(null);
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        setPasswordError(err.errors[0].message);
      }
      return false;
    }
  };

  const calculatePasswordStrength = (pwd: string): number => {
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (pwd.length >= 12) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/[a-z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) strength++;
    return strength;
  };

  const getPasswordStrengthLabel = (strength: number): string => {
    if (strength <= 2) return 'ضعيفة';
    if (strength <= 4) return 'متوسطة';
    return 'قوية';
  };

  const getPasswordStrengthColor = (strength: number): string => {
    if (strength <= 2) return 'bg-destructive';
    if (strength <= 4) return 'bg-warning';
    return 'bg-success';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!user) {
        // Validate password for new users
        if (!validatePassword(password)) {
          setLoading(false);
          return;
        }

        // إنشاء مستخدم جديد عبر Edge Function
        const newUser = await createUser(email, password);

        if (newUser) {
          await onSave(newUser.id, role, customPermissions);
        }
      } else {
        // تحديث المستخدم الحالي
        await onSave(user.id, role, customPermissions);
      }
    } catch (error) {
      console.error('خطأ في حفظ المستخدم:', error);
      toast({
        title: 'خطأ في حفظ المستخدم',
        description: error instanceof Error ? error.message : 'حدث خطأ غير متوقع',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (newRole: string) => {
    setRole(newRole);
    // تحديد الأذونات الافتراضية للدور الجديد
    const defaultPermissions = DEFAULT_ROLE_PERMISSIONS[newRole] || [];
    setCustomPermissions(defaultPermissions);
  };

  const handlePermissionChange = (permission: string, checked: boolean) => {
    setCustomPermissions(prev => {
      if (checked) {
        return [...prev, permission];
      } else {
        return prev.filter(p => p !== permission);
      }
    });
  };

  const permissionGroups = [
    {
      title: 'إدارة الموظفين',
      permissions: ['view_employees', 'add_employees', 'edit_employees', 'delete_employees']
    },
    {
      title: 'إدارة الحضور',
      permissions: ['view_attendance', 'add_attendance', 'edit_attendance', 'approve_attendance']
    },
    {
      title: 'إدارة الرواتب',
      permissions: ['view_salaries', 'process_salaries', 'approve_salaries']
    },
    {
      title: 'المزايا والخصومات',
      permissions: ['manage_benefits', 'manage_deductions', 'approve_benefits']
    },
    {
      title: 'المخالفات',
      permissions: ['view_violations', 'add_violations', 'approve_violations']
    },
    {
      title: 'إدارة النظام',
      permissions: ['configure_hr_rules', 'view_reports', 'export_data', 'manage_users', 'configure_system', 'view_audit_logs']
    }
  ];

  const passwordStrength = calculatePasswordStrength(password);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">البريد الإلكتروني</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={!!user}
            required
          />
        </div>

        {!user && (
          <div className="space-y-2">
            <Label htmlFor="password">كلمة المرور</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (e.target.value) {
                  validatePassword(e.target.value);
                }
              }}
              required
              minLength={8}
            />
            {password && (
              <div className="space-y-1">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded ${
                        i <= passwordStrength ? getPasswordStrengthColor(passwordStrength) : 'bg-muted'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  قوة كلمة المرور: {getPasswordStrengthLabel(passwordStrength)}
                </p>
              </div>
            )}
            {passwordError && (
              <p className="text-xs text-destructive">{passwordError}</p>
            )}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="role">الدور</Label>
          <Select value={role} onValueChange={handleRoleChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(roleLabels).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>الأذونات المخصصة</CardTitle>
          <CardDescription>
            يمكنك تخصيص الأذونات لهذا المستخدم بالإضافة إلى الأذونات الافتراضية للدور
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {permissionGroups.map((group) => (
              <div key={group.title} className="space-y-3">
                <h4 className="font-medium text-sm">{group.title}</h4>
                <div className="space-y-2">
                  {group.permissions.map((permission) => (
                    <div key={permission} className="flex items-center space-x-2 space-x-reverse">
                      <Checkbox
                        id={permission}
                        checked={customPermissions.includes(permission)}
                        onCheckedChange={(checked) => 
                          handlePermissionChange(permission, checked as boolean)
                        }
                      />
                      <Label 
                        htmlFor={permission} 
                        className="text-sm cursor-pointer"
                      >
                        {permissionLabels[permission as Permission]}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          إلغاء
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'جاري الحفظ...' : (user ? 'تحديث' : 'إضافة')}
        </Button>
      </div>
    </form>
  );
}
