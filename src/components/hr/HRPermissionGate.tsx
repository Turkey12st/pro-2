import React from 'react';
import { useUserPermissions } from '@/hooks/useUserPermissions';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Lock } from 'lucide-react';

interface HRPermissionGateProps {
  children: React.ReactNode;
  action: 'create' | 'update' | 'delete' | 'view' | 'manage_salaries' | 'manage_attendance';
  resource?: 'employees' | 'salaries' | 'attendance' | 'performance' | 'documents';
  fallback?: React.ReactNode;
  showMessage?: boolean;
}

export function HRPermissionGate({ 
  children, 
  action,
  resource = 'employees',
  fallback,
  showMessage = true 
}: HRPermissionGateProps) {
  const { permissions, loading } = useUserPermissions();

  if (loading) {
    return <div className="animate-pulse h-8 bg-muted rounded" />;
  }

  // HR specific permission checks
  const hasHRPermission = () => {
    // Check if user is admin or owner (full access)
    if (permissions.isMainAccount || permissions.canManageUsers) {
      return true;
    }

    // Check specific permissions
    if (action === 'create' && permissions.canCreate) {
      return true;
    }

    if (action === 'update' && permissions.canUpdate) {
      return true;
    }

    if (action === 'delete' && permissions.canDelete) {
      return true;
    }

    if (action === 'view') {
      return true; // Basic view access for all authenticated users
    }

    if ((action === 'manage_salaries' || action === 'manage_attendance') && permissions.canViewFinancials) {
      return true;
    }

    return false;
  };

  const hasPermission = hasHRPermission();

  if (!hasPermission) {
    if (fallback) return <>{fallback}</>;
    if (!showMessage) return null;
    
    return (
      <Alert className="border-warning bg-warning/10">
        <Lock className="h-4 w-4" />
        <AlertDescription>
          ليس لديك صلاحية {action === 'create' ? 'إضافة' : 
                           action === 'update' ? 'تعديل' : 
                           action === 'delete' ? 'حذف' : 'عرض'} {
            resource === 'employees' ? 'الموظفين' :
            resource === 'salaries' ? 'الرواتب' :
            resource === 'attendance' ? 'الحضور والانصراف' :
            resource === 'performance' ? 'تقييم الأداء' :
            resource === 'documents' ? 'المستندات' : 'هذا المحتوى'
          }. يرجى التواصل مع المدير.
        </AlertDescription>
      </Alert>
    );
  }

  return <>{children}</>;
}