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
  name?: string;
  first_name?: string;
  last_name?: string;
  nationality?: string;
  identity_number?: string;
  national_id?: string;
  capital_amount?: number;
  capital_percentage?: number;
  ownership_percentage: number;
  share_value: number;
  position?: string;
  role?: string;
  partner_type: string;
  contact_info: {
    email?: string;
    phone?: string;
  };
  documents?: Array<{
    name: string;
    url: string;
    type: string;
  }>;
  created_at: string;
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
  total_debit?: number;
  total_credit?: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
  posted_at?: string;
  posted_by?: string;
  amount?: number;
  exchange_rate?: number;
  is_recurring?: boolean;
  recurrence_pattern?: Record<string, any>;
  is_approved?: boolean;
  approved_by?: string;
  approved_at?: string;
  description: string;
  reference_number?: string;
  status?: string;
  financial_statement_section?: string;
  entry_name?: string;
  entry_type?: string;
  attachment_url?: string;
  currency?: string;
  tags?: string[];
}

export interface JournalEntryItem {
  id: string;
  journal_entry_id: string;
  account_id: string;
  account_number?: string;
  description?: string;
  debit: number;
  credit: number;
  created_at?: string;
  currency?: string;
  exchange_rate?: number;
  tax_amount?: number;
  tax_code?: string;
  dimension1?: string;
  dimension2?: string;
  is_cleared?: boolean;
}

export interface ChartOfAccount {
  id: string;
  parent_account_id?: string;
  account_number: string;
  account_name: string;
  account_type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense' | string;
  balance_type: 'debit' | 'credit' | string;
  description?: string;
  level: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  children?: ChartOfAccount[];
  balance?: number;
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
