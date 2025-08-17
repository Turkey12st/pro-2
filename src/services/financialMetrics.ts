import { supabase } from '@/integrations/supabase/client';

export interface FinancialMetrics {
  liquidityRatios: {
    currentRatio: number;
    quickRatio: number;
    cashRatio: number;
  };
  profitabilityRatios: {
    grossProfitMargin: number;
    netProfitMargin: number;
    returnOnAssets: number;
    returnOnEquity: number;
    returnOnInvestment: number;
  };
  debtRatios: {
    debtToEquity: number;
    debtToAssets: number;
    interestCoverage: number;
  };
  activityRatios: {
    inventoryTurnover: number;
    assetTurnover: number;
    receivablesTurnover: number;
  };
  workingCapital: number;
  operatingCashFlow: number;
  netBankBalance: number;
}

export class FinancialMetricsService {
  static async calculateFinancialMetrics(): Promise<FinancialMetrics> {
    try {
      console.log('حساب المؤشرات المالية المتقدمة...');

      // جلب البيانات المالية من قاعدة البيانات
      const [
        accountingTransactions,
        journalEntries,
        employees,
        projects,
        capitalManagement
      ] = await Promise.all([
        supabase.from('accounting_transactions').select('*'),
        supabase.from('journal_entries').select('*'),
        supabase.from('employees').select('*'),
        supabase.from('projects').select('*'),
        supabase.from('capital_management').select('*').order('fiscal_year', { ascending: false }).limit(1)
      ]);

      if (accountingTransactions.error) throw accountingTransactions.error;
      if (journalEntries.error) throw journalEntries.error;
      if (employees.error) throw employees.error;
      if (projects.error) throw projects.error;
      if (capitalManagement.error) throw capitalManagement.error;

      // حسابات القيم الأساسية
      const currentAssets = this.calculateCurrentAssets(accountingTransactions.data);
      const currentLiabilities = this.calculateCurrentLiabilities(accountingTransactions.data);
      const totalAssets = this.calculateTotalAssets(accountingTransactions.data);
      const totalEquity = capitalManagement.data[0]?.total_capital || 0;
      const totalDebt = this.calculateTotalDebt(accountingTransactions.data);
      const inventory = this.calculateInventory(accountingTransactions.data);
      const revenues = this.calculateRevenues(accountingTransactions.data);
      const grossProfit = this.calculateGrossProfit(accountingTransactions.data);
      const netIncome = this.calculateNetIncome(accountingTransactions.data);
      const operatingIncome = this.calculateOperatingIncome(accountingTransactions.data);

      // حساب المؤشرات
      const liquidityRatios = {
        currentRatio: currentLiabilities > 0 ? currentAssets / currentLiabilities : 0,
        quickRatio: currentLiabilities > 0 ? (currentAssets - inventory) / currentLiabilities : 0,
        cashRatio: currentLiabilities > 0 ? this.calculateCash(accountingTransactions.data) / currentLiabilities : 0
      };

      const profitabilityRatios = {
        grossProfitMargin: revenues > 0 ? (grossProfit / revenues) * 100 : 0,
        netProfitMargin: revenues > 0 ? (netIncome / revenues) * 100 : 0,
        returnOnAssets: totalAssets > 0 ? (netIncome / totalAssets) * 100 : 0,
        returnOnEquity: totalEquity > 0 ? (netIncome / totalEquity) * 100 : 0,
        returnOnInvestment: totalEquity > 0 ? (operatingIncome / totalEquity) * 100 : 0
      };

      const debtRatios = {
        debtToEquity: totalEquity > 0 ? totalDebt / totalEquity : 0,
        debtToAssets: totalAssets > 0 ? totalDebt / totalAssets : 0,
        interestCoverage: this.calculateInterestExpense(accountingTransactions.data) > 0 
          ? operatingIncome / this.calculateInterestExpense(accountingTransactions.data) : 0
      };

      const activityRatios = {
        inventoryTurnover: inventory > 0 ? this.calculateCostOfGoodsSold(accountingTransactions.data) / inventory : 0,
        assetTurnover: totalAssets > 0 ? revenues / totalAssets : 0,
        receivablesTurnover: this.calculateAccountsReceivable(accountingTransactions.data) > 0 
          ? revenues / this.calculateAccountsReceivable(accountingTransactions.data) : 0
      };

      const workingCapital = currentAssets - currentLiabilities;
      const operatingCashFlow = this.calculateOperatingCashFlow(accountingTransactions.data);
      const netBankBalance = this.calculateNetBankBalance(accountingTransactions.data);

      console.log('تم حساب المؤشرات المالية بنجاح');

      return {
        liquidityRatios,
        profitabilityRatios,
        debtRatios,
        activityRatios,
        workingCapital,
        operatingCashFlow,
        netBankBalance
      };

    } catch (error) {
      console.error('خطأ في حساب المؤشرات المالية:', error);
      throw error;
    }
  }

  private static calculateCurrentAssets(transactions: any[]): number {
    return transactions
      .filter(t => t.account_id?.startsWith('1') && t.debit_amount > 0)
      .reduce((sum, t) => sum + (t.debit_amount || 0), 0);
  }

  private static calculateCurrentLiabilities(transactions: any[]): number {
    return transactions
      .filter(t => t.account_id?.startsWith('2') && t.credit_amount > 0)
      .reduce((sum, t) => sum + (t.credit_amount || 0), 0);
  }

  private static calculateTotalAssets(transactions: any[]): number {
    return transactions
      .filter(t => t.account_id?.startsWith('1') && t.debit_amount > 0)
      .reduce((sum, t) => sum + (t.debit_amount || 0), 0);
  }

  private static calculateTotalDebt(transactions: any[]): number {
    return transactions
      .filter(t => t.account_id?.startsWith('2') && t.credit_amount > 0)
      .reduce((sum, t) => sum + (t.credit_amount || 0), 0);
  }

  private static calculateInventory(transactions: any[]): number {
    return transactions
      .filter(t => t.account_id?.includes('inventory') || t.description?.includes('مخزون'))
      .reduce((sum, t) => sum + (t.debit_amount || 0) - (t.credit_amount || 0), 0);
  }

  private static calculateCash(transactions: any[]): number {
    return transactions
      .filter(t => t.account_id?.includes('cash') || t.account_id?.includes('1000'))
      .reduce((sum, t) => sum + (t.debit_amount || 0) - (t.credit_amount || 0), 0);
  }

  private static calculateRevenues(transactions: any[]): number {
    return transactions
      .filter(t => t.account_id?.startsWith('4') && t.credit_amount > 0)
      .reduce((sum, t) => sum + (t.credit_amount || 0), 0);
  }

  private static calculateGrossProfit(transactions: any[]): number {
    const revenues = this.calculateRevenues(transactions);
    const costOfGoodsSold = this.calculateCostOfGoodsSold(transactions);
    return revenues - costOfGoodsSold;
  }

  private static calculateNetIncome(transactions: any[]): number {
    const revenues = this.calculateRevenues(transactions);
    const expenses = transactions
      .filter(t => t.account_id?.startsWith('5') && t.debit_amount > 0)
      .reduce((sum, t) => sum + (t.debit_amount || 0), 0);
    return revenues - expenses;
  }

  private static calculateOperatingIncome(transactions: any[]): number {
    const revenues = this.calculateRevenues(transactions);
    const operatingExpenses = transactions
      .filter(t => t.account_id?.startsWith('5') && !t.description?.includes('فوائد'))
      .reduce((sum, t) => sum + (t.debit_amount || 0), 0);
    return revenues - operatingExpenses;
  }

  private static calculateCostOfGoodsSold(transactions: any[]): number {
    return transactions
      .filter(t => t.description?.includes('تكلفة البضاعة') || t.account_id?.includes('cogs'))
      .reduce((sum, t) => sum + (t.debit_amount || 0), 0);
  }

  private static calculateInterestExpense(transactions: any[]): number {
    return transactions
      .filter(t => t.description?.includes('فوائد') || t.account_id?.includes('interest'))
      .reduce((sum, t) => sum + (t.debit_amount || 0), 0);
  }

  private static calculateAccountsReceivable(transactions: any[]): number {
    return transactions
      .filter(t => t.description?.includes('ذمم مدينة') || t.account_id?.includes('receivable'))
      .reduce((sum, t) => sum + (t.debit_amount || 0) - (t.credit_amount || 0), 0);
  }

  private static calculateOperatingCashFlow(transactions: any[]): number {
    const operatingTransactions = transactions.filter(t => 
      !t.account_id?.startsWith('3') && // Exclude equity
      !t.description?.includes('استثمار') &&
      !t.description?.includes('أصول ثابتة')
    );
    
    return operatingTransactions.reduce((sum, t) => 
      sum + (t.credit_amount || 0) - (t.debit_amount || 0), 0);
  }

  private static calculateNetBankBalance(transactions: any[]): number {
    return transactions
      .filter(t => t.description?.includes('بنك') || t.account_id?.includes('bank'))
      .reduce((sum, t) => sum + (t.debit_amount || 0) - (t.credit_amount || 0), 0);
  }
}