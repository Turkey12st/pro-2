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

export interface Address {
  street?: string;
  city?: string;
  postal_code?: string;
  [key: string]: any;
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
  address: string | Address;
  metadata: Record<string, any>;
  license_expiry_date: string;
  created_at: string;
}

export interface CompanyInfo extends CompanyInfoRecord {}

export interface Document {
  id: string;
  title: string;
  type: string;
  number?: string;
  issue_date: string;
  expiry_date: string;
  status: 'active' | 'expired' | 'soon-expire';
  document_url?: string;
  reminder_days: number[];
  created_at: string;
}

export interface JournalEntry {
  id: string;
  entry_date: string;
  description: string;
  amount: number;
  entry_name?: string;
  entry_type?: string;
  status?: string;
  total_debit: number;
  total_credit: number;
  financial_statement_section?: string;
  created_at: string;
  updated_at: string;
  attachment_url?: string;
}

export interface CapitalManagement {
  total_capital: number;
  available_capital: number;
  reserved_capital: number;
  fiscal_year: number;
  turnover_rate?: number;
  last_updated: string;
  created_at: string;
  notes?: string;
}

export interface CompanyPartnerData {
  id?: string;
  name: string;
  partner_type: string;
  ownership_percentage: number;
  share_value: number;
  nationality?: string;
  identity_number?: string;
  position?: string;
  contact_info: {
    phone?: string;
    email?: string;
  };
  created_at: string;
  updated_at: string;
  documents: any[];
}
