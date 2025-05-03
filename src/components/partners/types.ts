
export interface Partner {
  id: string;
  name: string;
  first_name?: string;
  last_name?: string;
  nationality?: string;
  identity_number?: string;
  national_id?: string;
  capital_amount?: number;
  capital_percentage?: number;
  ownership_percentage: number;
  share_value?: number;
  position?: string;
  role?: string;
  partner_type?: 'individual' | 'company';
  contact_info?: {
    email?: string;
    phone?: string;
    address?: string;
  };
  documents?: {
    name: string;
    url: string;
    type: string;
    uploadedAt?: string;
  }[];
  created_at?: string;
  status?: string;
}
