
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import FinancialSummary from './FinancialSummary';
import CashFlowChart from './CashFlowChart';
import { CompanyInfoCard } from './CompanyInfoCard';
import { SalarySummary } from './SalarySummary';
import { CapitalSummary } from './CapitalSummary';
import { ZakatCalculator } from './ZakatCalculator';
import { PerformanceMetrics } from './tabs/PerformanceMetrics';

export default function DashboardTabs() {
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
          <FinancialSummary />
          <CashFlowChart />
        </div>
      </TabsContent>

      <TabsContent value="financial" className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <CapitalSummary />
          <ZakatCalculator />
        </div>
        <CashFlowChart />
      </TabsContent>

      <TabsContent value="hr" className="space-y-4">
        <SalarySummary />
      </TabsContent>

      <TabsContent value="performance" className="space-y-4">
        <PerformanceMetrics />
      </TabsContent>
    </Tabs>
  );
}
