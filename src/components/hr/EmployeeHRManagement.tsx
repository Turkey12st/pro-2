
import React from 'react';
import { HRManagementSystem } from './HRManagementSystem';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Shield, Info } from 'lucide-react';

interface EmployeeHRManagementProps {
  employeeId: string;
  employeeName: string;
}

export function EmployeeHRManagement({ employeeId, employeeName }: EmployeeHRManagementProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            إدارة الموارد البشرية - {employeeName}
          </CardTitle>
          <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
            <Info className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">معلومات مهمة حول النظام:</p>
              <ul className="space-y-1 text-xs">
                <li>• جميع الإجراءات تخضع للوائح وزارة الموارد البشرية والتنمية الاجتماعية</li>
                <li>• النظام يطبق اللوائح التلقائية حسب الأنظمة المعتمدة</li>
                <li>• الصلاحيات محددة حسب دور المستخدم في النظام</li>
                <li>• جميع الإجراءات مسجلة ومؤرخة لأغراض المراجعة</li>
              </ul>
            </div>
          </div>
        </CardHeader>
      </Card>

      <HRManagementSystem employeeId={employeeId} />
    </div>
  );
}
