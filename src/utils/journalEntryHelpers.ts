
import { JournalEntry } from "@/types/database";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

export const calculateTotals = (entry: Partial<JournalEntry>) => {
  const amount = Number(entry.amount) || 0;
  const entryType = entry.entry_type || 'income';
  
  return {
    total_debit: entryType === 'expense' ? amount : 0,
    total_credit: entryType === 'income' ? amount : 0
  };
};

export const validateJournalEntry = (entry: Partial<JournalEntry>): string[] => {
  const errors = [];
  
  if (!entry.description || entry.description.trim() === '') {
    errors.push('الوصف مطلوب');
  }
  
  if (!entry.entry_name || entry.entry_name.trim() === '') {
    errors.push('اسم القيد مطلوب');
  }
  
  if (!entry.amount || Number(entry.amount) <= 0) {
    errors.push('المبلغ يجب أن يكون أكبر من صفر');
  }
  
  if (!entry.entry_date) {
    errors.push('التاريخ مطلوب');
  }
  
  return errors;
};

export const getFinancialSectionName = (section?: string): string => {
  switch(section) {
    case "income_statement": return "قائمة الدخل";
    case "balance_sheet": return "الميزانية العمومية";
    case "cash_flow": return "التدفقات النقدية";
    default: return "-";
  }
};

export const formatEntryDate = (dateString?: string): string => {
  if (!dateString) return "-";
  
  try {
    return format(new Date(dateString), "dd MMM yyyy", { locale: ar });
  } catch (error) {
    console.error("Error formatting date:", error);
    return dateString;
  }
};

export const formatAmount = (amount?: number): string => {
  if (amount === undefined || amount === null) return "0.00";
  
  return amount.toLocaleString("ar-SA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};
