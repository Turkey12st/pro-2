
export const formatDate = (dateString) => {
  if (!dateString) return "غير محدد";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('ar-SA').format(date);
};

export const formatSalary = (salary) => {
  if (!salary && salary !== 0) return "غير محدد";
  return new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(salary);
};
