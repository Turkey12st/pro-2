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
