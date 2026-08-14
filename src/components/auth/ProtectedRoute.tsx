import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import type { Permission, UserRole } from '@/types/permissions';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
  requiredPermissions?: Permission[];
  requireAllPermissions?: boolean;
}

export function ProtectedRoute({
  children,
  requiredRoles,
  requiredPermissions,
  requireAllPermissions = true,
}: ProtectedRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const {
    userRole,
    isLoading: permissionsLoading,
    hasAllPermissions,
    hasAnyPermission,
  } = usePermissions();
  const location = useLocation();

  // Show loading while checking auth state
  if (authLoading || permissionsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Check role-based access if requiredRoles is specified
  // Admin and owner always have access to everything
  if (requiredRoles && requiredRoles.length > 0) {
    const isAdminOrOwner = userRole === 'admin' || userRole === 'owner';
    const hasRequiredRole = isAdminOrOwner || requiredRoles.includes(userRole);
    
    if (!hasRequiredRole) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  if (requiredPermissions && requiredPermissions.length > 0) {
    const isAdminOrOwner = userRole === 'admin' || userRole === 'owner';
    const hasRequiredPermissions = requireAllPermissions
      ? hasAllPermissions(requiredPermissions)
      : hasAnyPermission(requiredPermissions);

    if (!isAdminOrOwner && !hasRequiredPermissions) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <>{children}</>;
}
