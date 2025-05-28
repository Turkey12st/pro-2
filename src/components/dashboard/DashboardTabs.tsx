
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FinancialSummary } from './FinancialSummary';
import CashFlowChart from './CashFlowChart';
import { CompanyInfoCard } from './CompanyInfoCard';
import { SalarySummary } from './SalarySummary';
import { CapitalSummary } from './CapitalSummary';
import { ZakatCalculator } from './ZakatCalculator';
import { PerformanceMetrics } from './tabs/PerformanceMetrics';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export default function DashboardTabs() {
  // جلب بيانات الموظفين الحقيقية من قاعدة البيانات
  const { data: employeesData } = useQuery({
    queryKey: ['dashboard_employees'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('*');
      
      if (error) {
        console.error('Error fetching employees for dashboard:', error);
        return [];
      }
      
      return data || [];
    },
  });

  // جلب بيانات رأس المال الحقيقية
  const { data: capitalData } = useQuery({
    queryKey: ['dashboard_capital'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('capital_management')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error) {
        console.error('Error fetching capital data:', error);
        return null;
      }
      
      return data;
    },
  });

  // حساب البيانات المالية الحقيقية من بيانات الموظفين
  const mockFinancialData = React.useMemo(() => {
    if (!employeesData) return { total_income: 0, total_expenses: 0, net_profit: 0, profit_margin: 0 };
    
    const totalSalaries = employeesData.reduce((sum, emp) => sum + (emp.salary || 0), 0);
    const estimatedIncome = totalSalaries * 1.5; // تقدير الدخل كـ 1.5 ضعف إجمالي الرواتب
    const netProfit = estimatedIncome - totalSalaries;
    const profitMargin = estimatedIncome > 0 ? (netProfit / estimatedIncome) * 100 : 0;
    
    return {
      total_income: estimatedIncome,
      total_expenses: totalSalaries,
      net_profit: netProfit,
      profit_margin: profitMargin
    };
  }, [employeesData]);

  // إعداد بيانات رأس المال مع القيم الافتراضية
  const mockCapitalData = React.useMemo(() => {
    if (!capitalData) {
      return {
        total_capital: 500000,
        available_capital: 300000,
        reserved_capital: 200000,
        turnover_rate: 2.5,
        fiscal_year: new Date().getFullYear(),
        last_updated: new Date().toISOString()
      };
    }
    
    return {
      total_capital: capitalData.total_capital,
      available_capital: capitalData.available_capital,
      reserved_capital: capitalData.reserved_capital,
      turnover_rate: capitalData.turnover_rate || 2.5,
      fiscal_year: capitalData.fiscal_year,
      last_updated: capitalData.last_updated
    };
  }, [capitalData]);

  // بيانات الشركة مع التوافق مع النوع المطلوب
  const mockCompanyInfo = {
    id: '1',
    name: 'شركة المثال المحدودة',
    company_name: 'شركة المثال المحدودة',
    commercial_registration: '1234567890',
    tax_number: '300123456789003',
    establishment_date: '2020-01-01',
    company_type: 'محدودة المسؤولية'
  };

  return (
    <Tabs defaultValue="overview" className="space-y-4">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
        <TabsTrigger value="financial">المالية</TabsTrigger>
        <TabsTrigger value="hr">الموارد البشرية</TabsTrigger>
        <TabsTrigger value="performance">الأداء</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <CompanyInfoCard />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <FinancialSummary data={mockFinancialData} />
          <CashFlowChart />
        </div>
      </TabsContent>

      <TabsContent value="financial" className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <CapitalSummary data={mockCapitalData} />
          <ZakatCalculator companyInfo={mockCompanyInfo} />
        </div>
        <CashFlowChart />
      </TabsContent>

      <TabsContent value="hr" className="space-y-4">
        <SalarySummary />
      </TabsContent>

      <TabsContent value="performance" className="space-y-4">
        <PerformanceMetrics financialData={mockFinancialData} />
      </TabsContent>
    </Tabs>
  );
}
