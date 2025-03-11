
import { Partner } from "@/types/database";

interface CompanyPartnerRecord {
  id?: string;
  name: string;
  partner_type?: string;
  ownership_percentage?: number;
  share_value?: number;
  contact_info?: any;
  documents?: any;
  created_at: string;
  updated_at?: string;
}

export const transformPartnerData = (item: CompanyPartnerRecord): Partner => {
  let contactInfo: Record<string, any> = {};
  
  if (item.contact_info) {
    if (typeof item.contact_info === 'object') {
      contactInfo = item.contact_info as Record<string, any>;
    } else if (typeof item.contact_info === 'string') {
      try {
        contactInfo = JSON.parse(item.contact_info);
      } catch (e) {
        console.error("Failed to parse contact_info string:", e);
      }
    }
  }
  
  const phone = contactInfo?.phone?.toString() || '';
  const email = contactInfo?.email?.toString() || '';
  
  // Ensure we have a valid ID
  const id = (item.id !== undefined) ? item.id.toString() : String(Date.now());
  
  return {
    id,
    name: item.name || '',
    nationality: 'غير محدد',
    identity_number: 'غير محدد',
    capital_amount: item.share_value || 0,
    capital_percentage: item.ownership_percentage || 0,
    contact_phone: phone,
    contact_email: email,
    position: 'شريك',
    created_at: item.created_at
  };
};
