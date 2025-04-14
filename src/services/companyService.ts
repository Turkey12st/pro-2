
import { supabase } from "@/integrations/supabase/client";
import { CompanyFormData } from "@/types/company";
import { Tables } from "@/integrations/supabase/types";

// Define interface for database structure
type CompanyInfoTable = Tables<"company_Info">;
 
export async function fetchCompanyInfo(): Promise<CompanyFormData | null> {
  const { data, error } = await supabase
    .from("company_Info")
    .select("*")
    .single();

  if (error && error.code !== "PGSQL_NO_ROWS_RETURNED") {
    throw error;
  }

  if (!data) {
    return null;
  }

  // Transform to type-safe format
  const transformedData: CompanyFormData = {
    id: data.id || "",
    name: data.company_name || "",
    company_name: data.company_name || "",
    company_type: data.company_type || "",
    commercial_registration: data.commercial_registration || "",
    unified_national_number: data["Unified National Number"] ? data["Unified National Number"].toString() : "",
    social_insurance_number: data.social_insurance_number || "",
    hrsd_number: data.hrsd_number || "",
    economic_activity: data.economic_activity || "",
    nitaqat_activity: data.nitaqat_activity || "",
    establishment_date: data.establishment_date || "",
    tax_number: data.tax_number || "",
    address: data.address && typeof data.address === 'object' ? {
      street: (data.address as any).street || "",
      city: (data.address as any).city || "", 
      postal_code: (data.address as any).postal_code || "",
      country: (data.address as any).country || ""
    } : {},
    bank_name: data.bank_name || "",
    bank_iban: data.bank_iban || "",
    contact: {
      // Use metadata for contact info since these fields aren't in the table schema
      email: data.metadata && typeof data.metadata === 'object' ? (data.metadata as any).email || "" : "",
      phone: data.metadata && typeof data.metadata === 'object' ? (data.metadata as any).phone || "" : "",
      website: data.metadata && typeof data.metadata === 'object' ? (data.metadata as any).website || "" : "",
    },
    metadata: data.metadata && typeof data.metadata === 'object' ? data.metadata as Record<string, any> : {},
  };

  return transformedData;
}

export async function saveCompanyInfo(data: CompanyFormData, companyId: string | null): Promise<void> {
  // Extract contact info to save in metadata
  const metadata: Record<string, any> = {
    ...(data.metadata || {}),
    email: data.contact?.email || "",
    phone: data.contact?.phone || "",
    website: data.contact?.website || "",
  };

  // Convert complex objects for database compatibility
  const dbData = {
    company_name: data.company_name || "",
    company_type: data.company_type || "",
    commercial_registration: data.commercial_registration || "",
    "Unified National Number": data.unified_national_number ? parseInt(data.unified_national_number) || 0 : 0,
    social_insurance_number: data.social_insurance_number || "",
    hrsd_number: data.hrsd_number || "",
    economic_activity: data.economic_activity || "",
    nitaqat_activity: data.nitaqat_activity || "",
    establishment_date: data.establishment_date || "",
    tax_number: data.tax_number || "",
    address: data.address || {},
    bank_name: data.bank_name || "",
    bank_iban: data.bank_iban || "",
    metadata: metadata
  };

  // For new company
  if (!companyId) {
    const { error } = await supabase
      .from("company_Info")
      .insert(dbData);
    
    if (error) throw error;
  } 
  // For existing company
  else {
    const { error } = await supabase
      .from("company_Info")
      .update(dbData)
      .eq("id", companyId);
      
    if (error) throw error;
  }
}
