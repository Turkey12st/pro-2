// الأدوار المتوافقة مع قاعدة البيانات (app_role enum)
export type UserRole = 'admin' | 'owner' | 'accountant' | 'hr_manager' | 'sales_manager' | 'viewer';

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
  // Accounting permissions
  | 'view_accounts'
  | 'manage_accounts'
  | 'view_journal_entries'
  | 'create_journal_entries'
  | 'post_journal_entries'
  | 'view_financials'
  // Client/Supplier permissions
  | 'view_clients'
  | 'manage_clients'
  | 'view_suppliers'
  | 'manage_suppliers';

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
    'manage_users', 'configure_system', 'view_audit_logs',
    'view_accounts', 'manage_accounts', 'view_journal_entries', 'create_journal_entries', 'post_journal_entries', 'view_financials',
    'view_clients', 'manage_clients', 'view_suppliers', 'manage_suppliers'
  ],
  owner: [
    'view_employees', 'add_employees', 'edit_employees', 'delete_employees',
    'view_attendance', 'add_attendance', 'edit_attendance', 'approve_attendance',
    'view_salaries', 'process_salaries', 'approve_salaries',
    'manage_benefits', 'manage_deductions', 'approve_benefits',
    'view_violations', 'add_violations', 'approve_violations',
    'configure_hr_rules', 'view_reports', 'export_data',
    'manage_users', 'configure_system', 'view_audit_logs',
    'view_accounts', 'manage_accounts', 'view_journal_entries', 'create_journal_entries', 'post_journal_entries', 'view_financials',
    'view_clients', 'manage_clients', 'view_suppliers', 'manage_suppliers'
  ],
  accountant: [
    'view_employees',
    'view_salaries', 'process_salaries',
    'view_reports', 'export_data',
    'view_accounts', 'manage_accounts', 'view_journal_entries', 'create_journal_entries', 'post_journal_entries', 'view_financials',
    'view_clients', 'view_suppliers'
  ],
  hr_manager: [
    'view_employees', 'add_employees', 'edit_employees',
    'view_attendance', 'add_attendance', 'edit_attendance', 'approve_attendance',
    'view_salaries', 'process_salaries',
    'manage_benefits', 'manage_deductions', 'approve_benefits',
    'view_violations', 'add_violations', 'approve_violations',
    'configure_hr_rules', 'view_reports', 'export_data'
  ],
  sales_manager: [
    'view_employees',
    'view_reports', 'export_data',
    'view_clients', 'manage_clients',
    'view_suppliers', 'manage_suppliers'
  ],
  viewer: [
    'view_employees',
    'view_attendance',
    'view_accounts',
    'view_journal_entries',
    'view_clients',
    'view_suppliers',
    'view_reports'
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
