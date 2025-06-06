
export type UserRole = 'admin' | 'hr_manager' | 'hr_officer' | 'finance_manager' | 'employee' | 'department_manager';

export type Permission = 
  // Employee permissions
  | 'view_employees' 
  | 'add_employees' 
  | 'edit_employees' 
  | 'delete_employees'
  // Attendance permissions
  | 'view_attendance' 
  | 'add_attendance' 
  | 'edit_attendance' 
  | 'approve_attendance'
  // Salary permissions
  | 'view_salaries' 
  | 'process_salaries' 
  | 'approve_salaries'
  // Benefits and deductions
  | 'manage_benefits' 
  | 'manage_deductions' 
  | 'approve_benefits'
  // Violations and disciplinary actions
  | 'view_violations' 
  | 'add_violations' 
  | 'approve_violations'
  // HR regulations
  | 'configure_hr_rules' 
  | 'view_reports' 
  | 'export_data'
  // System administration
  | 'manage_users' 
  | 'configure_system' 
  | 'view_audit_logs'
  // Financial permissions
  | 'view_financials'
  | 'manage_financials'
  | 'approve_transactions'
  // Project permissions
  | 'view_projects'
  | 'manage_projects'
  | 'approve_projects'
  // Company management
  | 'manage_company_info'
  | 'manage_partners'
  | 'manage_capital'
  // Dashboard and analytics
  | 'view_dashboard'
  | 'view_analytics'
  | 'export_reports';

export interface RolePermissions {
  [key: string]: Permission[];
}

export const DEFAULT_ROLE_PERMISSIONS: RolePermissions = {
  admin: [
    // الإدمن الرئيسي - كل الصلاحيات
    'view_employees', 'add_employees', 'edit_employees', 'delete_employees',
    'view_attendance', 'add_attendance', 'edit_attendance', 'approve_attendance',
    'view_salaries', 'process_salaries', 'approve_salaries',
    'manage_benefits', 'manage_deductions', 'approve_benefits',
    'view_violations', 'add_violations', 'approve_violations',
    'configure_hr_rules', 'view_reports', 'export_data',
    'manage_users', 'configure_system', 'view_audit_logs',
    'view_financials', 'manage_financials', 'approve_transactions',
    'view_projects', 'manage_projects', 'approve_projects',
    'manage_company_info', 'manage_partners', 'manage_capital',
    'view_dashboard', 'view_analytics', 'export_reports'
  ],
  hr_manager: [
    // مدير الموارد البشرية
    'view_employees', 'add_employees', 'edit_employees',
    'view_attendance', 'add_attendance', 'edit_attendance', 'approve_attendance',
    'view_salaries', 'process_salaries',
    'manage_benefits', 'manage_deductions', 'approve_benefits',
    'view_violations', 'add_violations', 'approve_violations',
    'configure_hr_rules', 'view_reports', 'export_data',
    'view_dashboard', 'view_analytics'
  ],
  hr_officer: [
    // موظف الموارد البشرية
    'view_employees', 'add_employees', 'edit_employees',
    'view_attendance', 'add_attendance', 'edit_attendance',
    'view_salaries',
    'manage_benefits', 'manage_deductions',
    'view_violations', 'add_violations',
    'view_reports', 'view_dashboard'
  ],
  finance_manager: [
    // مدير المالية
    'view_employees',
    'view_attendance',
    'view_salaries', 'process_salaries', 'approve_salaries',
    'view_financials', 'manage_financials', 'approve_transactions',
    'manage_capital',
    'view_reports', 'export_data', 'view_dashboard', 'view_analytics'
  ],
  department_manager: [
    // مدير القسم
    'view_employees',
    'view_attendance', 'add_attendance',
    'view_violations', 'add_violations',
    'view_projects', 'manage_projects',
    'view_reports', 'view_dashboard'
  ],
  employee: [
    // موظف عادي
    'view_attendance',
    'view_dashboard'
  ]
};

export interface AttendanceRule {
  id: string;
  type: 'absence' | 'late' | 'early_leave' | 'overtime';
  threshold: number; // في الدقائق للتأخير، عدد الأيام للغياب
  action: 'warning' | 'deduction' | 'notification' | 'disciplinary';
  amount?: number; // مبلغ الخصم إن وجد
  autoApply: boolean;
  description: string;
}

export interface HRRegulation {
  id: string;
  category: 'attendance' | 'salary' | 'benefits' | 'disciplinary';
  rules: AttendanceRule[];
  isActive: boolean;
  lastUpdated: string;
  updatedBy: string;
}

// نظام تدقيق العمليات
export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  oldValues?: any;
  newValues?: any;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
}
