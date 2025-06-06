
import { useState, useEffect } from 'react';
import { Permission, UserRole, DEFAULT_ROLE_PERMISSIONS } from '@/types/permissions';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function usePermissions() {
  const [userRole, setUserRole] = useState<UserRole>('employee');
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadUserPermissions();
    
    // مراقبة تغيير حالة المستخدم
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        loadUserPermissions();
      } else {
        setUserRole('employee');
        setPermissions([]);
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserPermissions = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setIsLoading(false);
        return;
      }

      setUser(user);

      // محاولة جلب الدور من جدول user_roles
      const { data: userRoleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role, permissions')
        .eq('user_id', user.id)
        .single();

      let role: UserRole = 'employee';
      let customPermissions: Permission[] = [];

      if (userRoleData && !roleError) {
        role = userRoleData.role as UserRole;
        customPermissions = userRoleData.permissions || [];
      } else {
        // الرجوع للـ metadata إذا لم يوجد سجل في الجدول
        role = (user.user_metadata?.role as UserRole) || 'employee';
        
        // إنشاء سجل دور جديد إذا لم يوجد
        if (roleError) {
          await createUserRole(user.id, role);
        }
      }

      // تحديد الصلاحيات - الإدمن الرئيسي يحصل على كل الصلاحيات
      const defaultPermissions = DEFAULT_ROLE_PERMISSIONS[role] || [];
      const finalPermissions = customPermissions.length > 0 ? customPermissions : defaultPermissions;

      setUserRole(role);
      setPermissions(finalPermissions);

      console.log('تم تحميل صلاحيات المستخدم:', { role, permissions: finalPermissions.length });

    } catch (error) {
      console.error('خطأ في تحميل صلاحيات المستخدم:', error);
      toast({
        title: 'خطأ في تحميل الصلاحيات',
        description: 'حدث خطأ أثناء تحميل صلاحيات المستخدم',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createUserRole = async (userId: string, role: UserRole) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role,
          permissions: DEFAULT_ROLE_PERMISSIONS[role] || []
        });

      if (error) {
        console.error('خطأ في إنشاء دور المستخدم:', error);
      }
    } catch (error) {
      console.error('خطأ في إنشاء دور المستخدم:', error);
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

      // تحديث الحالة المحلية إذا كان المستخدم الحالي
      if (userId === user?.id) {
        setUserRole(newRole);
        setPermissions(permissionsToSet);
      }

      toast({
        title: 'تم تحديث الصلاحيات',
        description: `تم تحديث دور المستخدم إلى ${newRole}`,
      });

      return { success: true };
    } catch (error) {
      console.error('خطأ في تحديث دور المستخدم:', error);
      toast({
        title: 'خطأ في التحديث',
        description: 'حدث خطأ أثناء تحديث دور المستخدم',
        variant: 'destructive',
      });
      return { success: false, error };
    }
  };

  const hasPermission = (permission: Permission): boolean => {
    // الإدمن الرئيسي يملك كل الصلاحيات
    if (userRole === 'admin') return true;
    return permissions.includes(permission);
  };

  const hasAnyPermission = (requiredPermissions: Permission[]): boolean => {
    if (userRole === 'admin') return true;
    return requiredPermissions.some(permission => permissions.includes(permission));
  };

  const hasAllPermissions = (requiredPermissions: Permission[]): boolean => {
    if (userRole === 'admin') return true;
    return requiredPermissions.every(permission => permissions.includes(permission));
  };

  const isAdmin = (): boolean => {
    return userRole === 'admin';
  };

  const canManageUsers = (): boolean => {
    return hasPermission('manage_users');
  };

  const canConfigureSystem = (): boolean => {
    return hasPermission('configure_system');
  };

  return {
    user,
    userRole,
    permissions,
    isLoading,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isAdmin,
    canManageUsers,
    canConfigureSystem,
    updateUserRole,
    refreshPermissions: loadUserPermissions
  };
}
