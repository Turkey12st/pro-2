
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

      // التحقق من دور المستخدم باستخدام .maybeSingle() لتجنب أخطاء البيانات المفقودة
      const { data: userRole, error } = await supabase
        .from('user_roles')
        .select('role, permissions')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user role:', error);
        throw error;
      }

      if (userRole) {
        const isMainAccount = userRole.role === 'admin' || userRole.role === 'owner';
        
        // تحويل permissions إلى مصفوفة إذا لم تكن كذلك
        const permissionsArray = Array.isArray(userRole.permissions) 
          ? userRole.permissions 
          : [];
        
        setPermissions({
          isMainAccount,
          canCreate: isMainAccount || permissionsArray.includes('create'),
          canUpdate: isMainAccount || permissionsArray.includes('update'),
          canDelete: isMainAccount,
          canViewFinancials: isMainAccount || permissionsArray.includes('view_financials'),
          canManageUsers: isMainAccount
        });
      } else {
        // إذا لم يوجد دور محدد، يُعتبر مستخدم عادي بدون صلاحيات
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
      
      // في حالة الخطأ، تعيين صلاحيات آمنة (بدون صلاحيات)
      setPermissions({
        isMainAccount: false,
        canCreate: false,
        canUpdate: false,
        canDelete: false,
        canViewFinancials: false,
        canManageUsers: false
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
