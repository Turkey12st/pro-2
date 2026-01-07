import { useState, useEffect } from 'react';
import { Permission, UserRole, DEFAULT_ROLE_PERMISSIONS } from '@/types/permissions';
import { supabase } from '@/integrations/supabase/client';

export function usePermissions() {
  const [userRole, setUserRole] = useState<UserRole>('viewer');
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [companyId, setCompanyId] = useState<string | null>(null);

  useEffect(() => {
    loadUserPermissions();
  }, []);

  const loadUserPermissions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      // جلب دور المستخدم من جدول user_roles (الهيكل الجديد بدون permissions)
      const { data: userRoleData, error } = await supabase
        .from('user_roles')
        .select('role, company_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user role:', error);
      }

      // تحويل الدور للنوع الصحيح، واستخدام viewer كقيمة افتراضية
      const roleValue = userRoleData?.role;
      const validRoles: UserRole[] = ['admin', 'owner', 'accountant', 'hr_manager', 'sales_manager', 'viewer'];
      const role: UserRole = (roleValue && validRoles.includes(roleValue as UserRole)) 
        ? (roleValue as UserRole) 
        : 'viewer';
      setUserRole(role);
      setCompanyId(userRoleData?.company_id || null);
      
      // استخدام الأذونات الافتراضية للدور فقط
      const defaultPermissions = DEFAULT_ROLE_PERMISSIONS[role] || [];
      setPermissions(defaultPermissions);
    } catch (error) {
      console.error('Error loading user permissions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const hasPermission = (permission: Permission): boolean => {
    return permissions.includes(permission);
  };

  const hasAnyPermission = (requiredPermissions: Permission[]): boolean => {
    return requiredPermissions.some(permission => permissions.includes(permission));
  };

  const hasAllPermissions = (requiredPermissions: Permission[]): boolean => {
    return requiredPermissions.every(permission => permissions.includes(permission));
  };

  return {
    userRole,
    permissions,
    companyId,
    isLoading,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    refreshPermissions: loadUserPermissions
  };
}
