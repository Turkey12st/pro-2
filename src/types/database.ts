
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[];

export interface Address {
  street?: string;
  city?: string;
  region?: string;
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
  contact?: {
    email?: string;
    phone?: string;
    website?: string;
  };
  metadata?: Record<string, any>;
  legal_name?: string;
  registration_number?: string;
  tax_number?: string;
  industry?: string;
  "Unified National Number"?: number;
}

// Specific type for database record
export interface CompanyInfoRecord extends CompanyInfo {
  created_at?: string;
  updated_at?: string;
  unified_national_number: string;
}

export interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  position: string;
  department: string;
  salary: number;
  hire_date: string;
  status: "active" | "inactive" | "terminated" | "on_leave";
  national_id?: string;
  birth_date?: string;
  gender?: "male" | "female";
  contact_number?: string;
  emergency_contact?: string;
  job_title?: string;
  manager_id?: string;
  created_at?: string;
  updated_at?: string;
  profile_image?: string;
  bank_account?: string;
  bank_name?: string;
  iban?: string;
}

export interface CapitalManagement {
  id: string;
  total_capital: number;
  available_capital: number;
  reserved_capital: number;
  utilized_capital?: number;
  investments?: Array<{
    id: string;
    name: string;
    amount: number;
    description?: string;
    date: string;
    status: string;
  }>;
  created_at?: string;
  updated_at?: string;
}

export interface Document {
  id: string;
  title: string;
  document_type: string;
  file_url: string;
  created_at: string;
  expiry_date?: string;
  issue_date?: string;
  status?: "active" | "expired" | "soon-expire";
  document_url?: string;
  type?: string;
  number?: string;
  reminder_days?: number[];
  metadata?: Json;
}

export interface Partner {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  ownership_percentage: number;
  contact_phone?: string;
  national_id?: string;
  role?: string;
  status?: "active" | "inactive";
  documents?: Json[];
  created_at?: string;
  updated_at?: string;
}

export interface JournalEntry {
  id: string;
  amount: number;
  description: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  status: string;
  attachment_url?: string;
  ledger_id?: string;
  // Added new fields
  entry_name?: string;
  entry_type?: string;
  entry_date?: string;
  financial_statement_section?: string;
  total_debit?: number;
  total_credit?: number;
  date?: string; // To maintain compatibility with existing code
  reference_no?: string; // To maintain compatibility with existing code
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  start_date: string;
  end_date?: string;
  budget?: number;
  status: "planned" | "in_progress" | "completed" | "on_hold" | "cancelled";
  client_id?: string;
  manager_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Client {
  id: string;
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: Address;
  status: "active" | "inactive";
  created_at?: string;
  updated_at?: string;
}
