
import { Partner } from "@/types/database";

export interface PartnerFormProps {
  onSuccess?: () => void;
  partner?: Partner; // For future edit functionality
}

export interface PartnerData {
  name: string;
  nationality?: string;
  identity_number?: string;
  partner_type: string;
  ownership_percentage: number;
  share_value: number;
  position?: string;
  contact_info: {
    email?: string;
    phone?: string;
  };
}

export const initialPartnerData: PartnerData = {
  name: '',
  nationality: '',
  identity_number: '',
  partner_type: 'individual',
  ownership_percentage: 0,
  share_value: 0,
  position: '',
  contact_info: {
    email: '',
    phone: '',
  },
};
