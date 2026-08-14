import { useMemo } from "react";
import { usePermissions } from "@/hooks/usePermissions";
import type { UserRole } from "@/types/permissions";

export interface UserPermissions {
  isMainAccount: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canViewFinancials: boolean;
  canManageUsers: boolean;
}

const ROLE_PERMISSIONS: Record<UserRole, UserPermissions> = {
  admin: {
    isMainAccount: true,
    canCreate: true,
    canUpdate: true,
    canDelete: true,
    canViewFinancials: true,
    canManageUsers: true,
  },
  owner: {
    isMainAccount: true,
    canCreate: true,
    canUpdate: true,
    canDelete: true,
    canViewFinancials: true,
    canManageUsers: true,
  },
  accountant: {
    isMainAccount: false,
    canCreate: true,
    canUpdate: true,
    canDelete: false,
    canViewFinancials: true,
    canManageUsers: false,
  },
  hr_manager: {
    isMainAccount: false,
    canCreate: true,
    canUpdate: true,
    canDelete: false,
    canViewFinancials: false,
    canManageUsers: false,
  },
  sales_manager: {
    isMainAccount: false,
    canCreate: true,
    canUpdate: true,
    canDelete: false,
    canViewFinancials: false,
    canManageUsers: false,
  },
  viewer: {
    isMainAccount: false,
    canCreate: false,
    canUpdate: false,
    canDelete: false,
    canViewFinancials: false,
    canManageUsers: false,
  },
};

/**
 * واجهة توافقية للمكوّنات القديمة. تعتمد الآن على الشركة الافتراضية والدور
 * المقيد بها من usePermissions؛ ولا تمنح صلاحيات مدير عند غياب الدور.
 */
export function useUserPermissions() {
  const {
    userRole,
    companyId,
    isLoading,
    refreshPermissions,
  } = usePermissions();

  const permissions = useMemo(
    () => ROLE_PERMISSIONS[userRole] ?? ROLE_PERMISSIONS.viewer,
    [userRole]
  );

  return {
    permissions,
    userRole,
    companyId,
    loading: isLoading,
    refreshPermissions,
  };
}
