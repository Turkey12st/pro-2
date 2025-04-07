
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
  date: string;
  description: string;
  amount: number;
  status: string;
  reference_no: string;
  created_at?: string;
  updated_at?: string;
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
}

export interface DocumentWithDaysRemaining {
  id: string;
  title: string;
  type: string;
  expiry_date: string;
  days_remaining: number;
  status: 'active' | 'expired' | 'soon-expire';
}
