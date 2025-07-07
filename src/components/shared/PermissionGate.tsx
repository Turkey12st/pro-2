import React from 'react';
import { useUserPermissions } from '@/hooks/useUserPermissions';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield } from 'lucide-react';

interface PermissionGateProps {
  children: React.ReactNode;
  permission?: 'create' | 'update' | 'delete' | 'view_financials' | 'manage_users';
  requireMainAccount?: boolean;
  fallback?: React.ReactNode;
  showMessage?: boolean;
}

export function PermissionGate({ 
  children, 
  permission, 
  requireMainAccount, 
  fallback,
  showMessage = true 
}: PermissionGateProps) {
  const { permissions, loading } = useUserPermissions();

  if (loading) {
    return <div className="animate-pulse h-8 bg-muted rounded" />;
  }

  // Check main account requirement
  if (requireMainAccount && !permissions.isMainAccount) {
    if (fallback) return <>{fallback}</>;
    if (!showMessage) return null;
    
    return (
      <Alert className="border-warning bg-warning/10">
        <Shield className="h-4 w-4" />
        <AlertDescription>
          هذه الميزة متاحة للحساب الرئيسي فقط
        </AlertDescription>
      </Alert>
    );
  }

  // Check specific permission
  if (permission) {
    const hasPermission = 
      permission === 'create' ? permissions.canCreate :
      permission === 'update' ? permissions.canUpdate :
      permission === 'delete' ? permissions.canDelete :
      permission === 'view_financials' ? permissions.canViewFinancials :
      permission === 'manage_users' ? permissions.canManageUsers :
      false;

    if (!hasPermission) {
      if (fallback) return <>{fallback}</>;
      if (!showMessage) return null;
      
      return (
        <Alert className="border-warning bg-warning/10">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            ليس لديك صلاحية لعرض هذا المحتوى
          </AlertDescription>
        </Alert>
      );
    }
  }

  return <>{children}</>;
}