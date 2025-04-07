
import { Partner } from "@/types/database";

export const transformPartnerData = (partnerData: any): Partner => {
  let formattedPartner: Partner = {
    id: partnerData.id || '',
    name: partnerData.name || '',
    partner_type: partnerData.partner_type || 'individual',
    ownership_percentage: Number(partnerData.ownership_percentage) || 0,
  };
  
  // Add optional fields if they exist in the data
  if (partnerData.nationality) formattedPartner.nationality = partnerData.nationality;
  if (partnerData.identity_number) formattedPartner.identity_number = partnerData.identity_number;
  if (partnerData.position) formattedPartner.position = partnerData.position;
  if (partnerData.share_value) formattedPartner.capital_amount = Number(partnerData.share_value);
  
  // Calculate capital percentage if total capital is provided
  if (partnerData.totalCapital && partnerData.share_value) {
    const capitalPercentage = (Number(partnerData.share_value) / Number(partnerData.totalCapital)) * 100;
    formattedPartner.capital_percentage = Math.round(capitalPercentage * 100) / 100; // Round to 2 decimal places
  }
  
  // Format contact info
  formattedPartner.contact_info = {};
  if (partnerData.contact_info) {
    // If contact_info is already an object
    if (typeof partnerData.contact_info === 'object') {
      formattedPartner.contact_info = partnerData.contact_info;
    } 
    // If it's a string, try to parse it (in case it's a JSON string)
    else if (typeof partnerData.contact_info === 'string') {
      try {
        formattedPartner.contact_info = JSON.parse(partnerData.contact_info);
      } catch (e) {
        // If parsing fails, set up empty object
        formattedPartner.contact_info = {};
      }
    }
  }
  
  // Add individual contact fields to contact_info if they exist
  if (partnerData.email && !formattedPartner.contact_info.email) {
    formattedPartner.contact_info.email = partnerData.email;
  }
  
  if (partnerData.phone && !formattedPartner.contact_info.phone) {
    formattedPartner.contact_info.phone = partnerData.phone;
  }
  
  // Format documents
  formattedPartner.documents = partnerData.documents || [];
  
  return formattedPartner;
};
