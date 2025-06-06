
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { usePermissions } from '@/hooks/usePermissions';
import { supabase } from '@/integrations/supabase/client';
import { UserRole, DEFAULT_ROLE_PERMISSIONS, Permission } from '@/types/permissions';
import { Shield, Edit, Users, Crown, Settings, AlertTriangle } from 'lucide-react';

interface User {
  id: string;
  email: string;
  user_metadata: {
    full_name?: string;
    role?: UserRole;
  };
  created_at: string;
}

interface UserWithRole extends User {
  role?: UserRole;
  permissions?: Permission[];
}

export function UserRoleManager() {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<UserRole>('employee');
  const [customPermissions, setCustomPermissions] = useState<Permission[]>([]);
  
  const { hasPermission, isAdmin, userRole: currentUserRole } = usePermissions();
  const { toast } = useToast();

  useEffect(() => {
    if (hasPermission('manage_users')) {
      loadUsers();
    }
  }, []);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      
      // جلب المستخدمين من جدول user_roles
      const { data: userRoles, error } = await supabase
        .from('user_roles')
        .select('*');

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      // إنشاء بيانات المستخدمين التجريبية مع الأدوار الفعلية
      const mockUsers: UserWithRole[] = [
        {
          id: 'admin-user-001',
          email: 'admin@company.com',
          user_metadata: { full_name: 'الإدمن الرئيسي', role: 'admin' },
          created_at: new Date().toISOString(),
          role: 'admin',
          permissions: DEFAULT_ROLE_PERMISSIONS.admin
        },
        {
          id: 'hr-manager-001',
          email: 'hr.manager@company.com',
          user_metadata: { full_name: 'مدير الموارد البشرية', role: 'hr_manager' },
          created_at: new Date().toISOString(),
          role: 'hr_manager',
          permissions: DEFAULT_ROLE_PERMISSIONS.hr_manager
        },
        {
          id: 'hr-officer-001',
          email: 'hr.officer@company.com',
          user_metadata: { full_name: 'موظف الموارد البشرية', role: 'hr_officer' },
          created_at: new Date().toISOString(),
          role: 'hr_officer',
          permissions: DEFAULT_ROLE_PERMISSIONS.hr_officer
        },
        {
          id: 'finance-manager-001',
          email: 'finance@company.com',
          user_metadata: { full_name: 'مدير المالية', role: 'finance_manager' },
          created_at: new Date().toISOString(),
          role: 'finance_manager',
          permissions: DEFAULT_ROLE_PERMISSIONS.finance_manager
        },
        {
          id: 'dept-manager-001',
          email: 'dept.manager@company.com',
          user_metadata: { full_name: 'مدير القسم', role: 'department_manager' },
          created_at: new Date().toISOString(),
          role: 'department_manager',
          permissions: DEFAULT_ROLE_PERMISSIONS.department_manager
        },
        {
          id: 'employee-001',
          email: 'employee@company.com',
          user_metadata: { full_name: 'موظف عادي', role: 'employee' },
          created_at: new Date().toISOString(),
          role: 'employee',
          permissions: DEFAULT_ROLE_PERMISSIONS.employee
        }
      ];

      // دمج الأدوار من قاعدة البيانات
      const usersWithRoles = mockUsers.map(user => {
        const roleData = userRoles?.find(role => role.user_id === user.id);
        if (roleData) {
          return {
            ...user,
            role: roleData.role as UserRole,
            permissions: roleData.permissions || DEFAULT_ROLE_PERMISSIONS[roleData.role] || []
          };
        }
        return user;
      });

      setUsers(usersWithRoles);
    } catch (error) {
      console.error('خطأ في تحميل المستخدمين:', error);
      toast({
        title: 'خطأ في تحميل البيانات',
        description: 'حدث خطأ أثناء تحميل بيانات المستخدمين',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: UserRole, newPermissions?: Permission[]) => {
    try {
      const permissionsToSet = newPermissions || DEFAULT_ROLE_PERMISSIONS[newRole] || [];
      
      const { error } = await supabase
        .from('user_roles')
        .upsert({
          user_id: userId,
          role: newRole,
          permissions: permissionsToSet
        });

      if (error) throw error;

      // تحديث البيانات المحلية
      setUsers(prev => prev.map(user => 
        user.id === userId 
          ? { ...user, role: newRole, permissions: permissionsToSet }
          : user
      ));

      toast({
        title: 'تم تحديث دور المستخدم',
        description: `تم تغيير دور المستخدم إلى ${getRoleText(newRole)}`,
      });

      setIsDialogOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('خطأ في تحديث دور المستخدم:', error);
      toast({
        title: 'خطأ في التحديث',
        description: 'حدث خطأ أثناء تحديث دور المستخدم',
        variant: 'destructive',
      });
    }
  };

  const getRoleText = (role: UserRole) => {
    const roleMap = {
      admin: 'الإدمن الرئيسي',
      hr_manager: 'مدير الموارد البشرية',
      hr_officer: 'موظف الموارد البشرية',
      finance_manager: 'مدير المالية',
      department_manager: 'مدير القسم',
      employee: 'موظف'
    };
    return roleMap[role] || role;
  };

  const getRoleBadge = (role: UserRole) => {
    const roleColors = {
      admin: 'bg-red-100 text-red-800 hover:bg-red-200 border-red-300',
      hr_manager: 'bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-300',
      hr_officer: 'bg-green-100 text-green-800 hover:bg-green-200 border-green-300',
      finance_manager: 'bg-purple-100 text-purple-800 hover:bg-purple-200 border-purple-300',
      department_manager: 'bg-orange-100 text-orange-800 hover:bg-orange-200 border-orange-300',
      employee: 'bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-300'
    };
    
    return (
      <Badge className={`${roleColors[role]} border`}>
        {role === 'admin' && <Crown className="h-3 w-3 ml-1" />}
        {getRoleText(role)}
      </Badge>
    );
  };

  const getPermissionCount = (role: UserRole) => {
    return DEFAULT_ROLE_PERMISSIONS[role]?.length || 0;
  };

  const canEditUser = (userRole: UserRole) => {
    // الإدمن الرئيسي يمكنه تعديل الجميع
    if (isAdmin()) return true;
    
    // المدراء يمكنهم تعديل الأدوار الأقل منهم فقط
    const roleHierarchy = {
      admin: 6,
      hr_manager: 4,
      finance_manager: 4,
      department_manager: 3,
      hr_officer: 2,
      employee: 1
    };

    const currentUserLevel = roleHierarchy[currentUserRole] || 0;
    const targetUserLevel = roleHierarchy[userRole] || 0;

    return currentUserLevel > targetUserLevel;
  };

  if (!hasPermission('manage_users')) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">ليس لديك صلاحية لإدارة المستخدمين</p>
          <p className="text-sm text-muted-foreground mt-2">
            تحتاج إلى صلاحية "manage_users" للوصول لهذا القسم
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* تنبيه للإدمن الرئيسي */}
      {isAdmin() && (
        <Card className="border-l-4 border-l-red-500 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <Crown className="h-5 w-5" />
              صلاحيات الإدمن الرئيسي
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700 text-sm">
              أنت تملك صلاحيات الإدمن الرئيسي - يمكنك إدارة جميع المستخدمين والصلاحيات في النظام.
              تعامل مع هذه الصلاحيات بحذر شديد.
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            إدارة المستخدمين والأدوار
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            إدارة أدوار المستخدمين والصلاحيات في النظام - نظام متقدم يوافق المعايير العالمية
          </p>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">جاري التحميل...</div>
          ) : users.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>المستخدم</TableHead>
                  <TableHead>البريد الإلكتروني</TableHead>
                  <TableHead>الدور</TableHead>
                  <TableHead>عدد الصلاحيات</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>تاريخ الإنشاء</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} className={user.role === 'admin' ? 'bg-red-50' : ''}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {user.role === 'admin' && <Crown className="h-4 w-4 text-red-600" />}
                        <span className="font-medium">
                          {user.user_metadata?.full_name || 'غير محدد'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell dir="ltr" className="text-right font-mono text-sm">
                      {user.email}
                    </TableCell>
                    <TableCell>
                      {getRoleBadge(user.role || 'employee')}
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                        {getPermissionCount(user.role || 'employee')} صلاحية
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-green-700 border-green-300">
                        نشط
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString('ar-SA')}
                    </TableCell>
                    <TableCell>
                      {canEditUser(user.role || 'employee') ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user);
                            setSelectedRole(user.role || 'employee');
                            setCustomPermissions(user.permissions || []);
                            setIsDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      ) : (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <AlertTriangle className="h-3 w-3" />
                          <span className="text-xs">محمي</span>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">لا توجد مستخدمين</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* نظرة عامة على الأدوار */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            هيكل الأدوار والصلاحيات
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            نظرة عامة على هيكل الصلاحيات في النظام
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(DEFAULT_ROLE_PERMISSIONS).map(([role, permissions]) => (
              <Card key={role} className="border relative">
                {role === 'admin' && (
                  <div className="absolute -top-2 -right-2">
                    <Crown className="h-5 w-5 text-red-600" />
                  </div>
                )}
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">{getRoleText(role as UserRole)}</h4>
                    <Badge variant="outline" className={role === 'admin' ? 'border-red-300 text-red-700' : ''}>
                      {permissions.length} صلاحية
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {permissions.slice(0, 8).map((permission) => (
                      <div key={permission} className="text-xs text-muted-foreground flex items-center gap-1">
                        <div className="w-1 h-1 bg-current rounded-full"></div>
                        {permission.replace(/_/g, ' ')}
                      </div>
                    ))}
                    {permissions.length > 8 && (
                      <div className="text-xs text-muted-foreground font-medium">
                        + {permissions.length - 8} صلاحية أخرى
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* مربع حوار تعديل المستخدم */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              تعديل دور المستخدم
            </DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">اسم المستخدم</p>
                <p className="font-medium">{selectedUser.user_metadata?.full_name || 'غير محدد'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">البريد الإلكتروني</p>
                <p className="font-medium font-mono" dir="ltr">{selectedUser.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">الدور الحالي</p>
                {getRoleBadge(selectedUser.role || 'employee')}
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">الدور الجديد</p>
                <Select
                  value={selectedRole}
                  onValueChange={(value) => setSelectedRole(value as UserRole)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {isAdmin() && (
                      <SelectItem value="admin" className="text-red-700">
                        <div className="flex items-center gap-2">
                          <Crown className="h-4 w-4" />
                          الإدمن الرئيسي
                        </div>
                      </SelectItem>
                    )}
                    <SelectItem value="hr_manager">مدير الموارد البشرية</SelectItem>
                    <SelectItem value="hr_officer">موظف الموارد البشرية</SelectItem>
                    <SelectItem value="finance_manager">مدير المالية</SelectItem>
                    <SelectItem value="department_manager">مدير القسم</SelectItem>
                    <SelectItem value="employee">موظف</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  الصلاحيات ({DEFAULT_ROLE_PERMISSIONS[selectedRole]?.length || 0})
                </p>
                <div className="text-xs text-muted-foreground max-h-20 overflow-y-auto">
                  {DEFAULT_ROLE_PERMISSIONS[selectedRole]?.slice(0, 5).map(permission => (
                    <div key={permission}>• {permission.replace(/_/g, ' ')}</div>
                  ))}
                  {(DEFAULT_ROLE_PERMISSIONS[selectedRole]?.length || 0) > 5 && (
                    <div>+ المزيد...</div>
                  )}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              إلغاء
            </Button>
            <Button 
              onClick={() => selectedUser && updateUserRole(selectedUser.id, selectedRole)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              تحديث الدور
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
