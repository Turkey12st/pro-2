
export interface CapitalManagement {
  id?: string;
  created_at?: string;
  total_capital: number;
  available_capital: number;
  reserved_capital: number;
  turnover_rate?: number;
  last_updated: string;
  fiscal_year: number;
  notes?: string;
}

export interface Partner {
  id: string;
  name: string;
  nationality?: string;
  identity_number?: string;
  partner_type: string;
  position?: string;
  ownership_percentage: number;
  capital_amount?: number;
  capital_percentage?: number;
  contact_info?: {
    email?: string;
    phone?: string;
  };
  documents?: Array<{
    id: string;
    name: string;
    url: string;
    uploaded_at: string;
  }>;
}

export interface SalarySummary {
  total_salaries: number;
  payment_date: string;
  days_remaining: number;
  employees_count: number;
  status: 'upcoming' | 'due' | 'overdue' | 'paid';
}

export interface FinancialSummaryType {
  total_income: number;
  total_expenses: number;
  net_profit: number;
  profit_margin: number;
}

export interface JournalEntry {
  id: string;
  description: string;
  amount: number;
  // Adding fields to match implementation
  entry_name?: string;
  entry_type?: string;
  financial_statement_section?: string;
  entry_date?: string;
  total_debit?: number;
  total_credit?: number;
  // Original fields
  date: string;
  status: string;
  reference_no: string;
  created_at?: string;
  updated_at?: string;
  attachment_url?: string;
}

export interface CompanyInfo {
  id: string;
  name: string;
  legal_name?: string;
  registration_number?: string;
  tax_number?: string;
  industry?: string;
  address?: Address;
  contact?: {
    email?: string;
    phone?: string;
    website?: string;
  };
  establishment_date?: string;
  logo_url?: string;
  // Additional fields from implementation
  company_name?: string;
  company_type?: string;
  commercial_registration?: string;
  unified_national_number?: string;
  social_insurance_number?: string;
  hrsd_number?: string;
  economic_activity?: string;
  nitaqat_activity?: string;
  bank_name?: string;
  bank_iban?: string;
  metadata?: Record<string, any>;
}

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
}

export interface CompanyInfoRecord {
  id: string;
  name?: string;
  legal_name?: string;
  registration_number?: string;
  tax_number?: string;
  industry?: string;
  address?: Address;
  contact?: {
    email?: string;
    phone?: string;
    website?: string;
  };
  establishment_date?: string;
  logo_url?: string;
  // Additional fields to match implementation
  company_name?: string;
  company_type?: string;
  commercial_registration?: string;
  unified_national_number?: string;
  social_insurance_number?: string;
  hrsd_number?: string;
  metadata?: Record<string, any>;
}

export interface Document {
  id: string;
  title: string;
  description?: string;
  file_url: string;
  created_at?: string;
  expires_at?: string;
  document_type: string;
  status: string;
  // Additional fields from implementation
  type?: string;
  number?: string;
  issue_date?: string;
  expiry_date?: string;
  document_url?: string;
}

export interface DocumentWithDaysRemaining {
  id: string;
  title: string;
  type: string;
  expiry_date: string;
  days_remaining: number;
  status: 'active' | 'expired' | 'soon-expire';
}

// This interface is needed for DocumentUploadDialog to work correctly
export interface DocumentItem {
  id: string;
  name: string;
  url: string;
  uploaded_at: string;
}

// Define the Json type for documents and other JSON fields
export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];
