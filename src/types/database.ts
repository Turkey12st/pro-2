
export interface CompanyInfo {
  id: string;
  company_name: string;
  company_type: string;
  establishment_date: string;
  commercial_registration: string;
  unified_national_number: number;
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
  turnover_rate?: number;
  created_at?: string;
  last_updated?: string;
}

export interface FinancialSummary {
  total_income: number;
  total_expenses: number;
  net_profit: number;
  profit_margin: number;
}
