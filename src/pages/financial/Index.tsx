
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FinancialSummary } from "@/components/dashboard/FinancialSummary";
import { CashFlowChart } from "@/components/dashboard/CashFlowChart";

export default function FinancialPage() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">النظام المالي</h1>
        <p className="text-muted-foreground">تتبع ومراقبة الأداء المالي للشركة</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="cashflow">التدفق النقدي</TabsTrigger>
          <TabsTrigger value="analysis">التحليل المالي</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <FinancialSummary />
        </TabsContent>

        <TabsContent value="cashflow">
          <CashFlowChart />
        </TabsContent>

        <TabsContent value="analysis">
          <Card>
            <CardHeader>
              <CardTitle>التحليل المالي المتقدم</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                تحليل مالي مفصل ومؤشرات الأداء ستكون متاحة قريباً
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
