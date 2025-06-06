
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CompanyInfoForm } from "@/components/company/CompanyInfoForm";

export default function CompanyPage() {
  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">معلومات الشركة</h1>
        <p className="text-muted-foreground">إدارة المعلومات الأساسية للشركة</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>البيانات الأساسية</CardTitle>
        </CardHeader>
        <CardContent>
          <CompanyInfoForm />
        </CardContent>
      </Card>
    </div>
  );
}
