
import { Address } from "./database";

export interface CompanyFormData {
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

export interface CompanyFormState {
  loading: boolean;
  saving: boolean;
  autoSaveLoading: boolean;
  lastSaved: string | null;
}

export interface DbCompanyData {
  company_name: string;
  company_type: string;
  commercial_registration: string;
  "Unified National Number": number | null;
  social_insurance_number: string;
  hrsd_number: string;
  economic_activity: string;
  nitaqat_activity: string;
  establishment_date: string;
  tax_number: string;
  address: Record<string, any>;
  bank_name: string;
  bank_iban: string;
  email: string;
  phone: string;
  website: string;
  metadata: Record<string, any>;
}

export interface DocumentItem {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedAt: string;
}
