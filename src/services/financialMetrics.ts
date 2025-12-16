// خدمة المؤشرات المالية المحسنة مع معالجة الأخطاء
import { supabase } from '@/integrations/supabase/client';
import { retryWithBackoff, parseError, logError } from '@/lib/errorHandler';
import { getItem, setItem } from '@/lib/storage';

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

const CACHE_KEY = 'financial_metrics';
const CACHE_TTL = 10 * 60 * 1000; // 10 دقائق

// القيم الافتراضية للمؤشرات
const DEFAULT_METRICS: FinancialMetrics = {
  liquidityRatios: { currentRatio: 0, quickRatio: 0, cashRatio: 0 },
  profitabilityRatios: {
    grossProfitMargin: 0,
    netProfitMargin: 0,
    returnOnAssets: 0,
    returnOnEquity: 0,
    returnOnInvestment: 0,
  },
  debtRatios: { debtToEquity: 0, debtToAssets: 0, interestCoverage: 0 },
  activityRatios: { inventoryTurnover: 0, assetTurnover: 0, receivablesTurnover: 0 },
  workingCapital: 0,
  operatingCashFlow: 0,
  netBankBalance: 0,
};

export class FinancialMetricsService {
  static async calculateFinancialMetrics(): Promise<FinancialMetrics> {
    // محاولة جلب من الكاش
    const cached = getItem<FinancialMetrics>(CACHE_KEY);
    if (cached) {
      console.log('[Cache Hit] Financial Metrics');
      return cached;
    }

    try {
      console.log('حساب المؤشرات المالية المتقدمة...');

      // جلب البيانات مع retry
      const fetchData = async () => {
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

        return {
          accountingTransactions,
          journalEntries,
          employees,
          projects,
          capitalManagement
        };
      };

      const data = await retryWithBackoff(fetchData, 3, 1000);

      // التحقق من الأخطاء
      if (data.accountingTransactions.error) {
        console.warn('خطأ في جلب المعاملات المحاسبية:', data.accountingTransactions.error);
      }
      if (data.capitalManagement.error) {
        console.warn('خطأ في جلب بيانات رأس المال:', data.capitalManagement.error);
      }

      // استخدام البيانات المتوفرة أو مصفوفة فارغة
      const transactions = data.accountingTransactions.data || [];
      const capital = data.capitalManagement.data?.[0];

      // حسابات القيم الأساسية
      const currentAssets = this.calculateCurrentAssets(transactions);
      const currentLiabilities = this.calculateCurrentLiabilities(transactions);
      const totalAssets = this.calculateTotalAssets(transactions);
      const totalEquity = capital?.total_capital || 0;
      const totalDebt = this.calculateTotalDebt(transactions);
      const inventory = this.calculateInventory(transactions);
      const revenues = this.calculateRevenues(transactions);
      const grossProfit = this.calculateGrossProfit(transactions);
      const netIncome = this.calculateNetIncome(transactions);
      const operatingIncome = this.calculateOperatingIncome(transactions);

      // حساب المؤشرات
      const metrics: FinancialMetrics = {
        liquidityRatios: {
          currentRatio: currentLiabilities > 0 ? currentAssets / currentLiabilities : 0,
          quickRatio: currentLiabilities > 0 ? (currentAssets - inventory) / currentLiabilities : 0,
          cashRatio: currentLiabilities > 0 ? this.calculateCash(transactions) / currentLiabilities : 0
        },
        profitabilityRatios: {
          grossProfitMargin: revenues > 0 ? (grossProfit / revenues) * 100 : 0,
          netProfitMargin: revenues > 0 ? (netIncome / revenues) * 100 : 0,
          returnOnAssets: totalAssets > 0 ? (netIncome / totalAssets) * 100 : 0,
          returnOnEquity: totalEquity > 0 ? (netIncome / totalEquity) * 100 : 0,
          returnOnInvestment: totalEquity > 0 ? (operatingIncome / totalEquity) * 100 : 0
        },
        debtRatios: {
          debtToEquity: totalEquity > 0 ? totalDebt / totalEquity : 0,
          debtToAssets: totalAssets > 0 ? totalDebt / totalAssets : 0,
          interestCoverage: this.calculateInterestExpense(transactions) > 0 
            ? operatingIncome / this.calculateInterestExpense(transactions) : 0
        },
        activityRatios: {
          inventoryTurnover: inventory > 0 ? this.calculateCostOfGoodsSold(transactions) / inventory : 0,
          assetTurnover: totalAssets > 0 ? revenues / totalAssets : 0,
          receivablesTurnover: this.calculateAccountsReceivable(transactions) > 0 
            ? revenues / this.calculateAccountsReceivable(transactions) : 0
        },
        workingCapital: currentAssets - currentLiabilities,
        operatingCashFlow: this.calculateOperatingCashFlow(transactions),
        netBankBalance: this.calculateNetBankBalance(transactions)
      };

      // تخزين في الكاش
      setItem(CACHE_KEY, metrics, { ttl: CACHE_TTL });

      console.log('تم حساب المؤشرات المالية بنجاح');
      return metrics;

    } catch (error) {
      const appError = parseError(error);
      logError(appError, 'FinancialMetricsService.calculateFinancialMetrics');
      
      // إرجاع القيم الافتراضية في حالة الخطأ
      console.warn('استخدام القيم الافتراضية للمؤشرات المالية');
      return DEFAULT_METRICS;
    }
  }

  // مسح الكاش
  static clearCache() {
    localStorage.removeItem(`erp_${CACHE_KEY}`);
  }

  private static calculateCurrentAssets(transactions: any[]): number {
    if (!Array.isArray(transactions)) return 0;
    return transactions
      .filter(t => t?.account_id?.startsWith('1') && (t?.debit_amount || 0) > 0)
      .reduce((sum, t) => sum + (t?.debit_amount || 0), 0);
  }

  private static calculateCurrentLiabilities(transactions: any[]): number {
    if (!Array.isArray(transactions)) return 0;
    return transactions
      .filter(t => t?.account_id?.startsWith('2') && (t?.credit_amount || 0) > 0)
      .reduce((sum, t) => sum + (t?.credit_amount || 0), 0);
  }

  private static calculateTotalAssets(transactions: any[]): number {
    if (!Array.isArray(transactions)) return 0;
    return transactions
      .filter(t => t?.account_id?.startsWith('1') && (t?.debit_amount || 0) > 0)
      .reduce((sum, t) => sum + (t?.debit_amount || 0), 0);
  }

  private static calculateTotalDebt(transactions: any[]): number {
    if (!Array.isArray(transactions)) return 0;
    return transactions
      .filter(t => t?.account_id?.startsWith('2') && (t?.credit_amount || 0) > 0)
      .reduce((sum, t) => sum + (t?.credit_amount || 0), 0);
  }

  private static calculateInventory(transactions: any[]): number {
    if (!Array.isArray(transactions)) return 0;
    return transactions
      .filter(t => t?.account_id?.includes('inventory') || t?.description?.includes('مخزون'))
      .reduce((sum, t) => sum + (t?.debit_amount || 0) - (t?.credit_amount || 0), 0);
  }

  private static calculateCash(transactions: any[]): number {
    if (!Array.isArray(transactions)) return 0;
    return transactions
      .filter(t => t?.account_id?.includes('cash') || t?.account_id?.includes('1000'))
      .reduce((sum, t) => sum + (t?.debit_amount || 0) - (t?.credit_amount || 0), 0);
  }

  private static calculateRevenues(transactions: any[]): number {
    if (!Array.isArray(transactions)) return 0;
    return transactions
      .filter(t => t?.account_id?.startsWith('4') && (t?.credit_amount || 0) > 0)
      .reduce((sum, t) => sum + (t?.credit_amount || 0), 0);
  }

  private static calculateGrossProfit(transactions: any[]): number {
    const revenues = this.calculateRevenues(transactions);
    const costOfGoodsSold = this.calculateCostOfGoodsSold(transactions);
    return revenues - costOfGoodsSold;
  }

  private static calculateNetIncome(transactions: any[]): number {
    if (!Array.isArray(transactions)) return 0;
    const revenues = this.calculateRevenues(transactions);
    const expenses = transactions
      .filter(t => t?.account_id?.startsWith('5') && (t?.debit_amount || 0) > 0)
      .reduce((sum, t) => sum + (t?.debit_amount || 0), 0);
    return revenues - expenses;
  }

  private static calculateOperatingIncome(transactions: any[]): number {
    if (!Array.isArray(transactions)) return 0;
    const revenues = this.calculateRevenues(transactions);
    const operatingExpenses = transactions
      .filter(t => t?.account_id?.startsWith('5') && !t?.description?.includes('فوائد'))
      .reduce((sum, t) => sum + (t?.debit_amount || 0), 0);
    return revenues - operatingExpenses;
  }

  private static calculateCostOfGoodsSold(transactions: any[]): number {
    if (!Array.isArray(transactions)) return 0;
    return transactions
      .filter(t => t?.description?.includes('تكلفة البضاعة') || t?.account_id?.includes('cogs'))
      .reduce((sum, t) => sum + (t?.debit_amount || 0), 0);
  }

  private static calculateInterestExpense(transactions: any[]): number {
    if (!Array.isArray(transactions)) return 0;
    return transactions
      .filter(t => t?.description?.includes('فوائد') || t?.account_id?.includes('interest'))
      .reduce((sum, t) => sum + (t?.debit_amount || 0), 0);
  }

  private static calculateAccountsReceivable(transactions: any[]): number {
    if (!Array.isArray(transactions)) return 0;
    return transactions
      .filter(t => t?.description?.includes('ذمم مدينة') || t?.account_id?.includes('receivable'))
      .reduce((sum, t) => sum + (t?.debit_amount || 0) - (t?.credit_amount || 0), 0);
  }

  private static calculateOperatingCashFlow(transactions: any[]): number {
    if (!Array.isArray(transactions)) return 0;
    const operatingTransactions = transactions.filter(t => 
      !t?.account_id?.startsWith('3') &&
      !t?.description?.includes('استثمار') &&
      !t?.description?.includes('أصول ثابتة')
    );
    
    return operatingTransactions.reduce((sum, t) => 
      sum + (t?.credit_amount || 0) - (t?.debit_amount || 0), 0);
  }

  private static calculateNetBankBalance(transactions: any[]): number {
    if (!Array.isArray(transactions)) return 0;
    return transactions
      .filter(t => t?.description?.includes('بنك') || t?.account_id?.includes('bank'))
      .reduce((sum, t) => sum + (t?.debit_amount || 0) - (t?.credit_amount || 0), 0);
  }
}
