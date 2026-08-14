import { useCallback, useEffect, useState } from "react";
import type { Permission, UserRole } from "@/types/permissions";
import { DEFAULT_ROLE_PERMISSIONS } from "@/types/permissions";
import { supabase } from "@/integrations/supabase/client";

const VALID_ROLES: UserRole[] = [
  "admin",
  "owner",
  "accountant",
  "hr_manager",
  "sales_manager",
  "viewer",
];

export function usePermissions() {
  const [userRole, setUserRole] = useState<UserRole>("viewer");
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [companyId, setCompanyId] = useState<string | null>(null);

  const loadUserPermissions = useCallback(async () => {
    setIsLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setUserRole("viewer");
        setPermissions([]);
        setCompanyId(null);
        return;
      }

      const { data: membership, error: membershipError } = await supabase
        .from("users_companies")
        .select("company_id, is_default, created_at")
        .eq("user_id", user.id)
        .order("is_default", { ascending: false })
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (membershipError) throw membershipError;

      const selectedCompanyId = membership?.company_id ?? null;
      setCompanyId(selectedCompanyId);

      if (!selectedCompanyId) {
        setUserRole("viewer");
        setPermissions([]);
        return;
      }

      const { data: roleRecord, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("company_id", selectedCompanyId)
        .maybeSingle();

      if (roleError) throw roleError;

      const role = VALID_ROLES.includes(roleRecord?.role as UserRole)
        ? (roleRecord?.role as UserRole)
        : "viewer";

      setUserRole(role);
      setPermissions(DEFAULT_ROLE_PERMISSIONS[role] ?? []);
    } catch (error) {
      console.error("تعذر تحميل صلاحيات المستخدم:", error);
      setUserRole("viewer");
      setPermissions([]);
      setCompanyId(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadUserPermissions();
  }, [loadUserPermissions]);

  const hasPermission = useCallback(
    (permission: Permission): boolean => permissions.includes(permission),
    [permissions]
  );

  const hasAnyPermission = useCallback(
    (requiredPermissions: Permission[]): boolean =>
      requiredPermissions.some((permission) => permissions.includes(permission)),
    [permissions]
  );

  const hasAllPermissions = useCallback(
    (requiredPermissions: Permission[]): boolean =>
      requiredPermissions.every((permission) => permissions.includes(permission)),
    [permissions]
  );

  return {
    userRole,
    permissions,
    companyId,
    isLoading,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    refreshPermissions: loadUserPermissions,
  };
}
