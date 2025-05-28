
import { useState, useEffect } from 'react';
import { Permission, UserRole, DEFAULT_ROLE_PERMISSIONS } from '@/types/permissions';
import { supabase } from '@/integrations/supabase/client';

export function usePermissions() {
  const [userRole, setUserRole] = useState<UserRole>('employee');
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

      // في هذا المثال، سنستخدم metadata المستخدم لتحديد الدور
      // يمكن تطوير هذا ليكون من جدول منفصل في المستقبل
      const role = (user.user_metadata?.role as UserRole) || 'employee';
      setUserRole(role);
      setPermissions(DEFAULT_ROLE_PERMISSIONS[role] || []);
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
    isLoading,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    refreshPermissions: loadUserPermissions
  };
}
