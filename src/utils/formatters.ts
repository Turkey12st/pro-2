
export const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return "غير محدد";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('ar-SA').format(date);
};

export const formatSalary = (salary: number | null | undefined) => {
  if (salary === null || salary === undefined) return "غير محدد";
  return new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(salary);
};

export const formatNumber = (number: number | null | undefined) => {
  if (number === null || number === undefined) return "غير محدد";
  return new Intl.NumberFormat('ar-SA').format(number);
};

export const formatPercentage = (value: number | null | undefined) => {
  if (value === null || value === undefined) return "غير محدد";
  return new Intl.NumberFormat('ar-SA', { style: 'percent', maximumFractionDigits: 2 }).format(value / 100);
};

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
