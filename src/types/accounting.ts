// Types for accounting system
export interface JournalEntry {
  id: string;
  entry_date: string;
  description: string;
  total_debit: number;
  total_credit: number;
  status?: string;
  entry_name?: string;
  created_at?: string;
  updated_at?: string;
}

export interface JournalEntryLine {
  id: string;
  account_name: string;
  debit: number;
  credit: number;
}

export interface DoubleEntryJournalEntry {
  entry_date: string;
  description: string;
  entry_name?: string;
  lines: JournalEntryLine[];
}

export interface FinancialReport {
  title: string;
  data: any[];
  period: string;
  generatedAt: string;
}
