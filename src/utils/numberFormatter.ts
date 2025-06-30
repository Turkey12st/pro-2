
// تنسيق الأرقام بالإنجليزية
export const formatNumberEnglish = (value: number | null | undefined): string => {
  if (value === null || value === undefined || isNaN(value)) return "0";
  
  // تحويل الأرقام العربية إلى إنجليزية إذا لزم الأمر
  const englishNumber = value.toString().replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString());
  
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(parseFloat(englishNumber));
};

export const formatCurrencyEnglish = (value: number | null | undefined): string => {
  if (value === null || value === undefined || isNaN(value)) return "0 SAR";
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'SAR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(value).replace('SAR', 'SAR');
};

export const formatPercentageEnglish = (value: number | null | undefined): string => {
  if (value === null || value === undefined || isNaN(value)) return "0%";
  
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 2
  }).format(value / 100);
};
