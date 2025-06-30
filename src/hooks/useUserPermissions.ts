
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

export function useUserPermissions() {
  const [permissions, setPermissions] = useState<UserPermissions>({
    isMainAccount: false,
    canCreate: false,
    canUpdate: false,
    canDelete: false,
    canViewFinancials: false,
    canManageUsers: false
  });
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

      // التحقق من دور المستخدم
      const { data: userRole } = await supabase
        .from('user_roles')
        .select('role, permissions')
        .eq('user_id', user.id)
        .single();

      if (userRole) {
        const isMainAccount = userRole.role === 'admin' || userRole.role === 'owner';
        
        setPermissions({
          isMainAccount,
          canCreate: isMainAccount || userRole.permissions?.includes('create'),
          canUpdate: isMainAccount || userRole.permissions?.includes('update'),
          canDelete: isMainAccount,
          canViewFinancials: isMainAccount || userRole.permissions?.includes('view_financials'),
          canManageUsers: isMainAccount
        });
      } else {
        // إذا لم يوجد دور محدد، يُعتبر مستخدم عادي
        setPermissions({
          isMainAccount: false,
          canCreate: false,
          canUpdate: false,
          canDelete: false,
          canViewFinancials: false,
          canManageUsers: false
        });
      }
    } catch (error) {
      console.error('Error loading user permissions:', error);
      toast({
        title: 'خطأ في تحميل الصلاحيات',
        description: 'حدث خطأ أثناء تحميل صلاحيات المستخدم',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    permissions,
    loading,
    refreshPermissions: loadUserPermissions
  };
}
