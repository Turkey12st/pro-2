
// Add additional types to the existing file

export interface FinancialSummaryType {
  total_income: number;
  total_expenses: number;
  net_profit: number;
  profit_margin: number;
}

export interface SalarySummary {
  total_salaries: number;
  payment_date: string;
  days_remaining: number;
  employees_count: number;
  status: 'upcoming' | 'due' | 'overdue' | 'paid';
}

export interface DocumentWithDaysRemaining {
  id: string;
  title: string;
  type: string;
  expiry_date: string;
  days_remaining: number;
  status: 'active' | 'expired' | 'soon-expire';
}

export interface Partner {
  id: string;
  name: string;
  nationality: string;
  identity_number: string;
  capital_amount: number;
  capital_percentage: number;
  contact_phone: string;
  contact_email: string;
  position: string;
  created_at: string;
}

export interface CompanyInfoRecord {
  id: string;
  company_name: string;
  company_type: string;
  establishment_date: string;
  commercial_registration: string;
  unified_national_number: string;
  social_insurance_number: string;
  hrsd_number: string;
  bank_name: string;
  bank_iban: string;
  nitaqat_activity: string;
  economic_activity: string;
  tax_number: string;
  address: string;
  metadata: Record<string, any>;
  license_expiry_date: string;
  created_at: string;
}
