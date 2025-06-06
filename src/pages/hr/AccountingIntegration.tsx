import React from 'react';
import { AppLayout } from '@/components/AppLayout';
import { EmployeeAccountingOverview } from '@/components/hr/EmployeeAccountingOverview';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, Info } from 'lucide-react';

export default function AccountingIntegration() {
  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">الربط المحاسبي للموظفين</h1>
            <p className="text-muted-foreground">
              نظام متكامل يربط الموظفين بجميع الجوانب المحاسبية والإدارية والمالية
            </p>
          </div>
        </div>

        {/* Info Card */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Info className="h-5 w-5" />
              نظام الربط المحاسبي المتكامل
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-blue-700">
            <ul className="space-y-2">
              <li>• <strong>ربط تلقائي:</strong> عند تسجيل موظف جديد يتم إنشاء حساباته المحاسبية تلقائياً</li>
              <li>• <strong>قيود الرواتب:</strong> إنشاء قيود محاسبية تلقائية عند دفع الرواتب</li>
              <li>• <strong>مؤشرات الأداء:</strong> حساب KPIs بناءً على المهام والمشاريع المنجزة</li>
              <li>• <strong>الحوافز والمكافآت:</strong> ربط الحوافز بالأداء والقيود المحاسبية</li>
              <li>• <strong>تخصيص المشاريع:</strong> ربط الموظفين بالمشاريع وحساب التكاليف</li>
              <li>• <strong>التقارير المالية:</strong> تقارير شاملة للتكاليف والأرباح والأداء</li>
            </ul>
          </CardContent>
        </Card>

        <EmployeeAccountingOverview />
      </div>
    </AppLayout>
  );
}
