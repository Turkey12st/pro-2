
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
  | 'view_audit_logs';

export interface RolePermissions {
  [key: string]: Permission[];
}

export const DEFAULT_ROLE_PERMISSIONS: RolePermissions = {
  admin: [
    'view_employees', 'add_employees', 'edit_employees', 'delete_employees',
    'view_attendance', 'add_attendance', 'edit_attendance', 'approve_attendance',
    'view_salaries', 'process_salaries', 'approve_salaries',
    'manage_benefits', 'manage_deductions', 'approve_benefits',
    'view_violations', 'add_violations', 'approve_violations',
    'configure_hr_rules', 'view_reports', 'export_data',
    'manage_users', 'configure_system', 'view_audit_logs'
  ],
  hr_manager: [
    'view_employees', 'add_employees', 'edit_employees',
    'view_attendance', 'add_attendance', 'edit_attendance', 'approve_attendance',
    'view_salaries', 'process_salaries',
    'manage_benefits', 'manage_deductions', 'approve_benefits',
    'view_violations', 'add_violations', 'approve_violations',
    'configure_hr_rules', 'view_reports', 'export_data'
  ],
  hr_officer: [
    'view_employees', 'add_employees', 'edit_employees',
    'view_attendance', 'add_attendance', 'edit_attendance',
    'view_salaries',
    'manage_benefits', 'manage_deductions',
    'view_violations', 'add_violations',
    'view_reports'
  ],
  finance_manager: [
    'view_employees',
    'view_attendance',
    'view_salaries', 'process_salaries', 'approve_salaries',
    'view_reports', 'export_data'
  ],
  department_manager: [
    'view_employees',
    'view_attendance', 'add_attendance',
    'view_violations', 'add_violations',
    'view_reports'
  ],
  employee: [
    'view_attendance'
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
