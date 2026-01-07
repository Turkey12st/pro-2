import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface UserPermissions {
  isMainAccount: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canViewFinancials: boolean;
  canManageUsers: boolean;
}

// تحديد الصلاحيات بناءً على الدور
const ROLE_PERMISSIONS: Record<string, UserPermissions> = {
  admin: {
    isMainAccount: true,
    canCreate: true,
    canUpdate: true,
    canDelete: true,
    canViewFinancials: true,
    canManageUsers: true
  },
  owner: {
    isMainAccount: true,
    canCreate: true,
    canUpdate: true,
    canDelete: true,
    canViewFinancials: true,
    canManageUsers: true
  },
  accountant: {
    isMainAccount: false,
    canCreate: true,
    canUpdate: true,
    canDelete: false,
    canViewFinancials: true,
    canManageUsers: false
  },
  hr_manager: {
    isMainAccount: false,
    canCreate: true,
    canUpdate: true,
    canDelete: false,
    canViewFinancials: false,
    canManageUsers: false
  },
  sales_manager: {
    isMainAccount: false,
    canCreate: true,
    canUpdate: true,
    canDelete: false,
    canViewFinancials: false,
    canManageUsers: false
  },
  viewer: {
    isMainAccount: false,
    canCreate: false,
    canUpdate: false,
    canDelete: false,
    canViewFinancials: false,
    canManageUsers: false
  }
};

export function useUserPermissions() {
  const [permissions, setPermissions] = useState<UserPermissions>({
    isMainAccount: false,
    canCreate: false,
    canUpdate: false,
    canDelete: false,
    canViewFinancials: false,
    canManageUsers: false
  });
  const [userRole, setUserRole] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadUserPermissions();
  }, []);

  const loadUserPermissions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // جلب دور المستخدم من الهيكل الجديد (بدون عمود permissions)
      const { data: userRoleData, error } = await supabase
        .from('user_roles')
        .select('role, company_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user role:', error);
        throw error;
      }

      if (userRoleData) {
        const role = userRoleData.role || 'viewer';
        setUserRole(role);
        setCompanyId(userRoleData.company_id);
        
        // استخدام الصلاحيات المحددة مسبقاً للدور
        const rolePermissions = ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.viewer;
        setPermissions(rolePermissions);
      } else {
        // إذا لم يوجد دور محدد، يُعتبر مشاهد بدون صلاحيات
        setPermissions(ROLE_PERMISSIONS.viewer);
      }
    } catch (error) {
      console.error('Error loading user permissions:', error);
      toast({
        title: 'خطأ في تحميل الصلاحيات',
        description: 'حدث خطأ أثناء تحميل صلاحيات المستخدم',
        variant: 'destructive',
      });
      
      setPermissions(ROLE_PERMISSIONS.viewer);
    } finally {
      setLoading(false);
    }
  };

  return {
    permissions,
    userRole,
    companyId,
    loading,
    refreshPermissions: loadUserPermissions
  };
}
