
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

export interface PartnerData {
  name: string;
  first_name?: string;
  last_name?: string;
  nationality: string;
  identity_number: string;
  partner_type: 'individual' | 'company';
  ownership_percentage: number;
  share_value: number;
  position: string;
  contact_info: {
    email: string;
    phone: string;
    address: string;
  };
  documents: {
    name: string;
    url: string;
    type: string;
    uploadedAt?: string;
  }[];
}

export interface PartnerFormProps {
  partner?: Partner | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const initialPartnerData: PartnerData = {
  name: '',
  first_name: '',
  last_name: '',
  nationality: 'سعودي',
  identity_number: '',
  partner_type: 'individual',
  ownership_percentage: 0,
  share_value: 0,
  position: '',
  contact_info: {
    email: '',
    phone: '',
    address: ''
  },
  documents: []
};
