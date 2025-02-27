export interface CompanyInfo {
  id: string;
  company_name: string;
  company_type: string;
  establishment_date: string;
  commercial_registration: string;
  unified_national_number: string;
  social_insurance_number: string;
  hrsd_number: string;
  bank_name?: string;
  bank_iban?: string;
  nitaqat_activity?: string;
  economic_activity?: string;
  tax_number?: string;
  address?: {
    street?: string;
    city?: string;
    postal_code?: string;
  };
  license_expiry_date?: string;
  created_at: string;
}

export interface Partner {
  id: string;
  name: string;
  partner_type: string;
  ownership_percentage: number;
  share_value: number;
  contact_info: {
    email?: string;
    phone?: string;
  };
  documents: any[];
  created_at: string;
  updated_at?: string;
}

export interface CapitalManagement {
  id?: string;
  fiscal_year: number;
  total_capital: number;
  available_capital: number;
  reserved_capital: number;
  notes: string;
  description?: string;
  turnover_rate?: number;
  created_at?: string;
  last_updated?: string;
}

export interface JournalEntry {
  id: string;
  description: string;
  entry_name: string;
  amount: number;
  total_debit: number;
  total_credit: number;
  entry_date: string;
  financial_statement_section?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface FinancialSummary {
  total_income: number;
  total_expenses: number;
  net_profit: number;
  profit_margin: number;
}
