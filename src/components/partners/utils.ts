
import { z } from "zod";
import { Partner } from "@/types/database";

// Schema for partner form validation
export const partnerFormSchema = z.object({
  first_name: z.string().min(1, "الاسم الأول مطلوب"),
  last_name: z.string().min(1, "الاسم الأخير مطلوب"),
  email: z.string().email("البريد الإلكتروني غير صحيح"),
  ownership_percentage: z
    .number()
    .min(0, "يجب أن تكون النسبة أكبر من أو تساوي 0")
    .max(100, "يجب أن تكون النسبة أقل من أو تساوي 100"),
  contact_phone: z.string().optional(),
  national_id: z.string().optional(),
  role: z.string().optional(),
  status: z.enum(["active", "inactive"]).default("active"),
});

// Type for form values derived from schema
export type PartnerFormValues = z.infer<typeof partnerFormSchema>;

// Function to convert form values to a Partner object
export const formValuesToPartner = (
  values: PartnerFormValues,
  id?: string
): Partial<Partner> => {
  return {
    id: id || crypto.randomUUID(),
    first_name: values.first_name,
    last_name: values.last_name,
    email: values.email,
    name: `${values.first_name} ${values.last_name}`,
    ownership_percentage: values.ownership_percentage,
    capital_percentage: values.ownership_percentage, // For compatibility
    contact_phone: values.contact_phone,
    national_id: values.national_id,
    role: values.role,
    status: values.status,
    documents: [],
  };
};

// Function to convert a Partner object to form values
export const partnerToFormValues = (partner: Partner): PartnerFormValues => {
  return {
    first_name: partner.first_name,
    last_name: partner.last_name,
    email: partner.email,
    ownership_percentage: partner.ownership_percentage,
    contact_phone: partner.contact_phone || "",
    national_id: partner.national_id || "",
    role: partner.role || "",
    status: partner.status || "active",
  };
};

// Function to get the full name of a partner
export const getPartnerFullName = (partner: Partner): string => {
  return `${partner.first_name} ${partner.last_name}`;
};

// Function to calculate total ownership percentage
export const calculateTotalOwnership = (partners: Partner[]): number => {
  return partners.reduce((sum, partner) => sum + partner.ownership_percentage, 0);
};

// Function to check if total ownership is valid (equal to 100%)
export const isValidTotalOwnership = (partners: Partner[]): boolean => {
  const total = calculateTotalOwnership(partners);
  return Math.abs(total - 100) < 0.01; // Allow for tiny floating-point errors
};

// Function to transform partner data from the database
export const transformPartnerData = (data: any): Partner => {
  return {
    id: data.id || "",
    first_name: data.first_name || "",
    last_name: data.last_name || "",
    email: data.email || "",
    name: data.name || `${data.first_name || ""} ${data.last_name || ""}`,
    ownership_percentage: data.ownership_percentage || 0,
    capital_percentage: data.ownership_percentage || 0,
    capital_amount: data.share_value || 0,
    contact_phone: data.contact_info?.phone || "",
    national_id: data.national_id || "",
    identity_number: data.national_id || "",
    nationality: data.contact_info?.nationality || "",
    position: data.contact_info?.position || "",
    role: data.partner_type || "",
    status: data.status || "active",
    documents: data.documents || [],
    created_at: data.created_at,
    updated_at: data.updated_at,
    partner_type: data.partner_type || "individual"
  };
};
