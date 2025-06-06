
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

export default function DashboardTabs() {
  // بيانات وهمية للاختبار
  const mockFinancialData = {
    total_income: 150000,
    total_expenses: 80000,
    net_profit: 70000,
    profit_margin: 46.7
  };

  const mockCapitalData = {
    total_capital: 500000,
    available_capital: 300000,
    reserved_capital: 200000,
    turnover_rate: 2.5,
    fiscal_year: new Date().getFullYear(),
    last_updated: new Date().toISOString()
  };

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
