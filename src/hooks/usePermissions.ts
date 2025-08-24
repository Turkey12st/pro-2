
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

      // جلب دور المستخدم من جدول user_roles
      const { data: userRole, error } = await supabase
        .from('user_roles')
        .select('role, permissions')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user role:', error);
      }

      const role = (userRole?.role as UserRole) || 'employee';
      setUserRole(role);
      
      // دمج الأذونات الافتراضية مع الأذونات المخصصة
      const defaultPermissions = DEFAULT_ROLE_PERMISSIONS[role] || [];
      const customPermissions = Array.isArray(userRole?.permissions) 
        ? userRole.permissions.filter((p): p is Permission => typeof p === 'string')
        : [];
      
      const allPermissions = [...new Set([...defaultPermissions, ...customPermissions])];
      setPermissions(allPermissions);
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
