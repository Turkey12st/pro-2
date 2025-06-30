
import { formatNumberEnglish, formatCurrencyEnglish, formatPercentageEnglish } from './numberFormatter';

export const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return "غير محدد";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US').format(date);
};

// استخدام المنسقات الجديدة للأرقام الإنجليزية
export const formatSalary = formatCurrencyEnglish;
export const formatNumber = formatNumberEnglish;
export const formatPercentage = formatPercentageEnglish;

export const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'active':
    case 'completed':
    case 'paid':
    case 'success':
      return 'text-green-600 bg-green-100';
    case 'soon-expire':
    case 'warning':
    case 'pending':
    case 'upcoming':
      return 'text-amber-600 bg-amber-100';
    case 'expired':
    case 'error':
    case 'cancelled':
    case 'overdue':
      return 'text-red-600 bg-red-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};
