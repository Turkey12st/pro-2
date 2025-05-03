
import { Partner } from "./types";

export const formatCapitalAmount = (amount?: number): string => {
  if (amount === undefined || amount === null) return "0 ريال";
  return new Intl.NumberFormat('ar-SA', {
    style: 'currency',
    currency: 'SAR',
    maximumFractionDigits: 0
  }).format(amount);
};

export const formatPercentage = (percentage?: number): string => {
  if (percentage === undefined || percentage === null) return "0%";
  return new Intl.NumberFormat('ar-SA', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(percentage / 100);
};

export const createEmptyPartner = (): Partial<Partner> => {
  return {
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
};

export const formatPartnerForDisplay = (partner: Partner) => {
  return {
    ...partner,
    formattedCapital: formatCapitalAmount(partner.capital_amount || partner.share_value),
    formattedPercentage: formatPercentage(partner.ownership_percentage || partner.capital_percentage),
    email: partner.contact_info?.email || '',
    phone: partner.contact_info?.phone || '',
    type: partner.partner_type === 'company' ? 'شركة' : 'فرد',
    status: partner.status || 'نشط'
  };
};

export const formatPartnerForSubmission = (partner: Partial<Partner>) => {
  // تحويل البيانات للتخزين
  const submissionData = {
    name: partner.name || '',
    first_name: partner.first_name || '',
    last_name: partner.last_name || '',
    nationality: partner.nationality || '',
    identity_number: partner.identity_number || '',
    partner_type: partner.partner_type || 'individual',
    ownership_percentage: parseFloat(partner.ownership_percentage?.toString() || '0'),
    share_value: parseFloat(partner.share_value?.toString() || '0'),
    position: partner.position || '',
    contact_info: {
      email: partner.contact_info?.email || '',
      phone: partner.contact_info?.phone || '',
      address: partner.contact_info?.address || ''
    }
  };

  return submissionData;
};
