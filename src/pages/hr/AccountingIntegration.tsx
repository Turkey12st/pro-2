
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmployeeAccountingDashboard } from "@/components/hr/EmployeeAccountingDashboard";

export default function AccountingIntegration() {
  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">ربط الموارد البشرية بالمحاسبة</h1>
        <p className="text-muted-foreground">تكامل بيانات الموظفين مع النظام المحاسبي</p>
      </div>

      <EmployeeAccountingDashboard />
    </div>
  );
}
