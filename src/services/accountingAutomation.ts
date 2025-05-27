
import { supabase } from "@/integrations/supabase/client";

export interface AccountingEntry {
  type: 'salary' | 'capital' | 'expense' | 'revenue';
  reference_id: string;
  amount: number;
  description?: string;
  auto_journal?: boolean;
}

export class AccountingAutomationService {
  static async createAutomatedEntry(entry: AccountingEntry) {
    try {
      const { data, error } = await supabase.functions.invoke('accounting-automation', {
        body: entry
      });

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error creating automated accounting entry:', error);
      throw error;
    }
  }

  static async processSalaryPayment(employeeId: string, salaryAmount: number, description?: string) {
    return this.createAutomatedEntry({
      type: 'salary',
      reference_id: employeeId,
      amount: salaryAmount,
      description: description || 'دفع راتب شهري',
      auto_journal: true
    });
  }

  static async processCapitalIncrease(amount: number, description?: string) {
    return this.createAutomatedEntry({
      type: 'capital',
      reference_id: crypto.randomUUID(),
      amount,
      description: description || 'زيادة رأس المال',
      auto_journal: true
    });
  }

  static async processExpense(expenseId: string, amount: number, description?: string) {
    return this.createAutomatedEntry({
      type: 'expense',
      reference_id: expenseId,
      amount,
      description: description || 'مصروف عام',
      auto_journal: true
    });
  }

  static async processRevenue(revenueId: string, amount: number, description?: string) {
    return this.createAutomatedEntry({
      type: 'revenue',
      reference_id: revenueId,
      amount,
      description: description || 'إيراد عام',
      auto_journal: true
    });
  }

  static async getCashFlowData(startDate: string, endDate: string) {
    try {
      const { data, error } = await supabase.rpc('calculate_cash_flow', {
        start_date: startDate,
        end_date: endDate
      });

      if (error) {
        throw error;
      }

      return data[0] || {
        total_inflow: 0,
        total_outflow: 0,
        net_flow: 0,
        flow_ratio: 0
      };
    } catch (error) {
      console.error('Error calculating cash flow:', error);
      throw error;
    }
  }
}
