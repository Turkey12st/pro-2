
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FinancialSummary } from './FinancialSummary';
import CashFlowChart from './CashFlowChart';
import { CompanyInfoCard } from './CompanyInfoCard';
import { SalarySummary } from './SalarySummary';
import { CapitalSummary } from './CapitalSummary';
import { ZakatCalculator } from './ZakatCalculator';
import { PerformanceMetrics } from './tabs/PerformanceMetrics';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { useDataIntegration } from '@/hooks/useDataIntegration';

export default function DashboardTabs() {
  const { data: integratedData, loading } = useDataIntegration();

  // جلب بيانات الشركة الحقيقية
  const { data: companyInfo, isLoading: loadingCompany } = useQuery({
    queryKey: ['company_info_dashboard'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('company_Info')
        .select('*')
        .limit(1)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching company info:', error);
        return null;
      }
      return data;
    }
  });

  // جلب بيانات رأس المال الحقيقية
  const { data: capitalData, isLoading: loadingCapital } = useQuery({
    queryKey: ['capital_data_dashboard'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('capital_management')
        .select('*')
        .eq('fiscal_year', new Date().getFullYear())
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching capital data:', error);
        return null;
      }
      return data;
    }
  });

  // جلب البيانات المالية الحقيقية
  const { data: financialData, isLoading: loadingFinancial } = useQuery({
    queryKey: ['financial_summary_dashboard'],
    queryFn: async () => {
      const currentYear = new Date().getFullYear();
      
      // جلب الإيرادات والمصروفات من القيود المحاسبية
      const { data: entries, error } = await supabase
        .from('journal_entries')
        .select('amount, entry_type, description')
        .gte('entry_date', `${currentYear}-01-01`);
      
      if (error) {
        console.error('Error fetching financial data:', error);
        return {
          total_income: 0,
          total_expenses: 0,
          net_profit: 0,
          profit_margin: 0
        };
      }

      const income = entries?.filter(e => 
        e.entry_type === 'revenue' || 
        e.description?.includes('إيراد') ||
        e.description?.includes('مبيعات')
      ).reduce((sum, e) => sum + (e.amount || 0), 0) || 0;

      const expenses = entries?.filter(e => 
        e.entry_type === 'expense' || 
        e.description?.includes('مصروف') ||
        e.description?.includes('تكلفة')
      ).reduce((sum, e) => sum + (e.amount || 0), 0) || 0;

      const netProfit = income - expenses;
      const profitMargin = income > 0 ? (netProfit / income) * 100 : 0;

      return {
        total_income: income,
        total_expenses: expenses,
        net_profit: netProfit,
        profit_margin: profitMargin
      };
    }
  });

  // تحويل بيانات الشركة للنوع المطلوب
  const formattedCompanyInfo = companyInfo ? {
    id: companyInfo.id,
    name: companyInfo.company_name,
    company_name: companyInfo.company_name,
    commercial_registration: companyInfo.commercial_registration,
    tax_number: companyInfo.tax_number || undefined,
    establishment_date: companyInfo.establishment_date,
    company_type: companyInfo.company_type
  } : {
    id: '1',
    name: 'شركتك',
    company_name: 'شركتك',
    commercial_registration: '',
    tax_number: undefined,
    establishment_date: '',
    company_type: ''
  };

  const isLoading = loading || loadingCompany || loadingCapital || loadingFinancial;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  return (
    <Tabs defaultValue="overview" className="space-y-4">
      <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
        <TabsTrigger value="overview" className="text-xs sm:text-sm">نظرة عامة</TabsTrigger>
        <TabsTrigger value="financial" className="text-xs sm:text-sm">المالية</TabsTrigger>
        <TabsTrigger value="hr" className="text-xs sm:text-sm">الموارد البشرية</TabsTrigger>
        <TabsTrigger value="performance" className="text-xs sm:text-sm">الأداء</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <CompanyInfoCard />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <FinancialSummary data={financialData || { total_income: 0, total_expenses: 0, net_profit: 0, profit_margin: 0 }} />
          <CashFlowChart />
        </div>
      </TabsContent>

      <TabsContent value="financial" className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {capitalData && (
            <CapitalSummary data={{
              total_capital: capitalData.total_capital,
              available_capital: capitalData.available_capital,
              reserved_capital: capitalData.reserved_capital,
              turnover_rate: capitalData.turnover_rate || 0,
              fiscal_year: capitalData.fiscal_year,
              last_updated: capitalData.last_updated
            }} />
          )}
          <ZakatCalculator companyInfo={formattedCompanyInfo} />
        </div>
        <CashFlowChart />
      </TabsContent>

      <TabsContent value="hr" className="space-y-4">
        <SalarySummary />
      </TabsContent>

      <TabsContent value="performance" className="space-y-4">
        <PerformanceMetrics financialData={financialData || { total_income: 0, total_expenses: 0, net_profit: 0, profit_margin: 0 }} />
      </TabsContent>
    </Tabs>
  );
}
