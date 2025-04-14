
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Address {
  street?: string;
  city?: string;
  postal_code?: string;
  country?: string;
}

export interface CompanyInfo {
  id: string;
  name: string;
  company_name?: string;
  company_type?: string;
  commercial_registration?: string;
  unified_national_number?: string;
  social_insurance_number?: string;
  hrsd_number?: string;
  economic_activity?: string;
  nitaqat_activity?: string;
  establishment_date?: string;
  logo_url?: string;
  address?: Address;
  bank_name?: string;
  bank_iban?: string;
  tax_number?: string;
  contact?: {
    email?: string;
    phone?: string;
    website?: string;
  };
  metadata?: Record<string, any>;
}

export interface Partner {
  id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  name: string;
  ownership_percentage: number;
  capital_percentage?: number;
  capital_amount?: number;
  contact_phone?: string;
  national_id?: string;
  identity_number?: string;
  nationality?: string;
  position?: string;
  role?: string;
  partner_type?: string;
  status?: "active" | "inactive";
  documents?: DocumentItem[];
  created_at?: string;
  updated_at?: string;
}

export interface DocumentItem {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedAt: string;
}

export interface Document {
  id: string;
  title: string;
  type: string;
  number?: string;
  issue_date: string;
  expiry_date: string;
  status: 'active' | 'expired' | 'soon-expire';
  document_url?: string;
}

export interface SalarySummary {
  total_salaries: number;
  payment_date: string;
  days_remaining: number;
  employees_count: number;
  status: 'upcoming' | 'overdue' | 'paid';
}

export interface FinancialSummaryType {
  total_income: number;
  total_expenses: number;
  net_profit: number;
  profit_margin: number;
}

export interface DocumentWithDaysRemaining extends Document {
  days_remaining: number;
}

export interface JournalEntry {
  id: string;
  entry_date: string;
  description: string;
  entry_name?: string;
  amount?: number;
  entry_type?: string;
  financial_statement_section?: string;
  total_debit?: number;
  total_credit?: number;
  status?: string;
  attachment_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CapitalManagement {
  id?: string;
  total_capital: number;
  available_capital: number;
  reserved_capital: number;
  fiscal_year: number;
  last_updated: string;
  notes?: string;
  turnover_rate?: number;
  created_at?: string;
}
