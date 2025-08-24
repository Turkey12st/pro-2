import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { UserRoleForm } from './UserRoleForm';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  UserPlus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Shield,
  Mail,
  Calendar
} from 'lucide-react';

interface User {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at?: string;
  user_metadata?: any;
  role?: string;
  permissions?: string[];
}

export function UserManagementPanel() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      
      // جلب بيانات المستخدمين الأساسية من auth.users
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) throw authError;

      // جلب أدوار المستخدمين من user_roles
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role, permissions');

      if (rolesError) throw rolesError;

      // دمج البيانات
      const usersWithRoles = authUsers.users.map(user => {
        const roleData = userRoles?.find(r => r.user_id === user.id);
        return {
          ...user,
          role: roleData?.role || 'employee',
          permissions: roleData?.permissions || []
        };
      });

      setUsers(usersWithRoles);
    } catch (error) {
      console.error('خطأ في تحميل المستخدمين:', error);
      toast({
        title: 'خطأ في تحميل المستخدمين',
        description: 'حدث خطأ أثناء تحميل قائمة المستخدمين',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRoleUpdate = async (userId: string, newRole: string, permissions: string[]) => {
    try {
      // تحديث أو إدراج دور المستخدم
      const { error } = await supabase
        .from('user_roles')
        .upsert({
          user_id: userId,
          role: newRole,
          permissions: permissions
        });

      if (error) throw error;

      // إعادة تحميل المستخدمين
      await loadUsers();
      
      toast({
        title: 'تم تحديث الصلاحيات',
        description: 'تم تحديث صلاحيات المستخدم بنجاح',
      });
      
      setShowRoleDialog(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('خطأ في تحديث الصلاحيات:', error);
      toast({
        title: 'خطأ في تحديث الصلاحيات',
        description: 'حدث خطأ أثناء تحديث صلاحيات المستخدم',
        variant: 'destructive',
      });
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المستخدم؟')) return;

    try {
      // حذف دور المستخدم أولاً
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      // حذف المستخدم من auth
      const { error } = await supabase.auth.admin.deleteUser(userId);
      
      if (error) throw error;

      await loadUsers();
      
      toast({
        title: 'تم حذف المستخدم',
        description: 'تم حذف المستخدم بنجاح',
      });
    } catch (error) {
      console.error('خطأ في حذف المستخدم:', error);
      toast({
        title: 'خطأ في حذف المستخدم',
        description: 'حدث خطأ أثناء حذف المستخدم',
        variant: 'destructive',
      });
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const getRoleDisplayName = (role: string) => {
    const roleNames = {
      admin: 'مدير النظام',
      hr_manager: 'مدير الموارد البشرية',
      hr_officer: 'موظف موارد بشرية',
      finance_manager: 'مدير مالي',
      department_manager: 'مدير قسم',
      employee: 'موظف'
    };
    return roleNames[role as keyof typeof roleNames] || role;
  };

  const getRoleBadgeVariant = (role: string) => {
    const variants = {
      admin: 'destructive',
      hr_manager: 'default',
      hr_officer: 'secondary',
      finance_manager: 'outline',
      department_manager: 'secondary',
      employee: 'outline'
    };
    return variants[role as keyof typeof variants] || 'outline' as const;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            إدارة المستخدمين والصلاحيات
          </CardTitle>
          <CardDescription>
            إدارة جميع مستخدمي النظام وصلاحياتهم
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* أدوات البحث والتصفية */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="البحث عن مستخدم..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="تصفية حسب الدور" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأدوار</SelectItem>
                <SelectItem value="admin">مدير النظام</SelectItem>
                <SelectItem value="hr_manager">مدير الموارد البشرية</SelectItem>
                <SelectItem value="hr_officer">موظف موارد بشرية</SelectItem>
                <SelectItem value="finance_manager">مدير مالي</SelectItem>
                <SelectItem value="department_manager">مدير قسم</SelectItem>
                <SelectItem value="employee">موظف</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={() => {
                setSelectedUser(null);
                setShowRoleDialog(true);
              }}
              className="flex items-center gap-2"
            >
              <UserPlus className="h-4 w-4" />
              إضافة مستخدم
            </Button>
          </div>

          {/* جدول المستخدمين */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>المستخدم</TableHead>
                  <TableHead>الدور</TableHead>
                  <TableHead>تاريخ التسجيل</TableHead>
                  <TableHead>آخر دخول</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      جاري التحميل...
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      لا توجد نتائج
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <Mail className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="font-medium">{user.email}</div>
                            <div className="text-sm text-muted-foreground">
                              {user.user_metadata?.full_name || 'غير محدد'}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(user.role || 'employee')}>
                          {getRoleDisplayName(user.role || 'employee')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4" />
                          {new Date(user.created_at).toLocaleDateString('ar-SA')}
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.last_sign_in_at ? (
                          <div className="text-sm">
                            {new Date(user.last_sign_in_at).toLocaleDateString('ar-SA')}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">لم يدخل بعد</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-green-600">
                          نشط
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(user);
                              setShowRoleDialog(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteUser(user.id)}
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

      {/* مربع حوار إدارة الأدوار */}
      <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedUser ? 'تعديل صلاحيات المستخدم' : 'إضافة مستخدم جديد'}
            </DialogTitle>
            <DialogDescription>
              {selectedUser ? 
                `تعديل صلاحيات المستخدم: ${selectedUser.email}` :
                'إضافة مستخدم جديد وتحديد صلاحياته'
              }
            </DialogDescription>
          </DialogHeader>
          <UserRoleForm
            user={selectedUser}
            onSave={handleRoleUpdate}
            onCancel={() => {
              setShowRoleDialog(false);
              setSelectedUser(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}