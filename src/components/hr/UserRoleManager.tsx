
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { usePermissions } from '@/hooks/usePermissions';
import { supabase } from '@/integrations/supabase/client';
import { UserRole, DEFAULT_ROLE_PERMISSIONS } from '@/types/permissions';
import { Shield, Edit, Users } from 'lucide-react';

interface User {
  id: string;
  email: string;
  user_metadata: {
    full_name?: string;
    role?: UserRole;
  };
  created_at: string;
}

interface UserRoleManagerProps {
  employeeId?: string;
}

export function UserRoleManager({ employeeId }: UserRoleManagerProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const { hasPermission } = usePermissions();
  const { toast } = useToast();

  useEffect(() => {
    if (hasPermission('manage_users')) {
      loadUsers();
    }
  }, []);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      // في نظام حقيقي، ستحتاج لاستخدام API خاص لجلب المستخدمين
      // هنا سنستخدم بيانات تجريبية
      const mockUsers: User[] = [
        {
          id: '1',
          email: 'admin@company.com',
          user_metadata: { full_name: 'مدير النظام', role: 'admin' },
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          email: 'hr@company.com',
          user_metadata: { full_name: 'مدير الموارد البشرية', role: 'hr_manager' },
          created_at: new Date().toISOString()
        },
        {
          id: '3',
          email: 'hr.officer@company.com',
          user_metadata: { full_name: 'موظف الموارد البشرية', role: 'hr_officer' },
          created_at: new Date().toISOString()
        }
      ];
      setUsers(mockUsers);
    } catch (error) {
      console.error('Error loading users:', error);
      toast({
        title: 'خطأ في تحميل البيانات',
        description: 'حدث خطأ أثناء تحميل بيانات المستخدمين',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: UserRole) => {
    try {
      // في نظام حقيقي، ستحتاج لاستخدام Admin API
      // const { error } = await supabase.auth.admin.updateUserById(userId, {
      //   user_metadata: { role: newRole }
      // });
      
      // تحديث محلي للبيانات
      setUsers(prev => prev.map(user => 
        user.id === userId 
          ? { ...user, user_metadata: { ...user.user_metadata, role: newRole } }
          : user
      ));

      toast({
        title: 'تم تحديث دور المستخدم',
        description: `تم تغيير دور المستخدم إلى ${getRoleText(newRole)}`
      });

      setIsDialogOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: 'خطأ في التحديث',
        description: 'حدث خطأ أثناء تحديث دور المستخدم',
        variant: 'destructive'
      });
    }
  };

  const getRoleText = (role: UserRole) => {
    const roleMap = {
      admin: 'مدير النظام',
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
      admin: 'bg-red-100 text-red-800 hover:bg-red-200',
      hr_manager: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
      hr_officer: 'bg-green-100 text-green-800 hover:bg-green-200',
      finance_manager: 'bg-purple-100 text-purple-800 hover:bg-purple-200',
      department_manager: 'bg-orange-100 text-orange-800 hover:bg-orange-200',
      employee: 'bg-gray-100 text-gray-800 hover:bg-gray-200'
    };
    
    return (
      <Badge className={roleColors[role]}>
        {getRoleText(role)}
      </Badge>
    );
  };

  const getPermissionCount = (role: UserRole) => {
    return DEFAULT_ROLE_PERMISSIONS[role]?.length || 0;
  };

  if (!hasPermission('manage_users')) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">ليس لديك صلاحية لإدارة المستخدمين</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            إدارة المستخدمين والأدوار
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            إدارة أدوار المستخدمين والصلاحيات في النظام
          </p>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">جاري التحميل...</div>
          ) : users.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الاسم</TableHead>
                  <TableHead>البريد الإلكتروني</TableHead>
                  <TableHead>الدور</TableHead>
                  <TableHead>عدد الصلاحيات</TableHead>
                  <TableHead>تاريخ الإنشاء</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      {user.user_metadata?.full_name || 'غير محدد'}
                    </TableCell>
                    <TableCell dir="ltr" className="text-right">
                      {user.email}
                    </TableCell>
                    <TableCell>
                      {getRoleBadge(user.user_metadata?.role || 'employee')}
                    </TableCell>
                    <TableCell>
                      {getPermissionCount(user.user_metadata?.role || 'employee')} صلاحية
                    </TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString('ar-SA')}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(user);
                          setIsDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
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
          <CardTitle>نظرة عامة على الأدوار والصلاحيات</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(DEFAULT_ROLE_PERMISSIONS).map(([role, permissions]) => (
              <Card key={role} className="border">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">{getRoleText(role as UserRole)}</h4>
                    <Badge variant="outline">{permissions.length} صلاحية</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    {permissions.slice(0, 5).map((permission) => (
                      <div key={permission} className="text-xs text-muted-foreground">
                        • {permission.replace(/_/g, ' ')}
                      </div>
                    ))}
                    {permissions.length > 5 && (
                      <div className="text-xs text-muted-foreground">
                        + {permissions.length - 5} صلاحية أخرى
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>تعديل دور المستخدم</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">اسم المستخدم</p>
                <p className="font-medium">{selectedUser.user_metadata?.full_name || 'غير محدد'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">البريد الإلكتروني</p>
                <p className="font-medium" dir="ltr">{selectedUser.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">الدور الحالي</p>
                {getRoleBadge(selectedUser.user_metadata?.role || 'employee')}
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">الدور الجديد</p>
                <Select
                  defaultValue={selectedUser.user_metadata?.role || 'employee'}
                  onValueChange={(value) => updateUserRole(selectedUser.id, value as UserRole)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">مدير النظام</SelectItem>
                    <SelectItem value="hr_manager">مدير الموارد البشرية</SelectItem>
                    <SelectItem value="hr_officer">موظف الموارد البشرية</SelectItem>
                    <SelectItem value="finance_manager">مدير المالية</SelectItem>
                    <SelectItem value="department_manager">مدير القسم</SelectItem>
                    <SelectItem value="employee">موظف</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              إلغاء
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
