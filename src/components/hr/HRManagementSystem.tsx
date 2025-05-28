
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { usePermissions } from '@/hooks/usePermissions';
import { AttendanceManagement } from './AttendanceManagement';
import { BenefitsManagement } from './BenefitsManagement';
import { DeductionsManagement } from './DeductionsManagement';
import { ViolationsManagement } from './ViolationsManagement';
import { HRRegulationsManager } from './HRRegulationsManager';
import { UserRoleManager } from './UserRoleManager';
import { 
  Users, 
  Clock, 
  DollarSign, 
  AlertTriangle, 
  Settings, 
  FileText,
  Shield,
  TrendingUp
} from 'lucide-react';

interface HRManagementSystemProps {
  employeeId?: string;
}

export function HRManagementSystem({ employeeId }: HRManagementSystemProps) {
  const { hasPermission, userRole } = usePermissions();
  const [activeTab, setActiveTab] = useState('attendance');

  const managementSections = [
    {
      id: 'attendance',
      label: 'الحضور والانصراف',
      icon: Clock,
      permission: 'view_attendance',
      component: AttendanceManagement
    },
    {
      id: 'benefits',
      label: 'الاستحقاقات',
      icon: DollarSign,
      permission: 'manage_benefits',
      component: BenefitsManagement
    },
    {
      id: 'deductions',
      label: 'الخصومات',
      icon: TrendingUp,
      permission: 'manage_deductions',
      component: DeductionsManagement
    },
    {
      id: 'violations',
      label: 'المخالفات',
      icon: AlertTriangle,
      permission: 'view_violations',
      component: ViolationsManagement
    },
    {
      id: 'regulations',
      label: 'اللوائح والأنظمة',
      icon: FileText,
      permission: 'configure_hr_rules',
      component: HRRegulationsManager
    },
    {
      id: 'users',
      label: 'إدارة المستخدمين',
      icon: Shield,
      permission: 'manage_users',
      component: UserRoleManager
    }
  ];

  const availableSections = managementSections.filter(section => 
    hasPermission(section.permission as any)
  );

  if (availableSections.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">ليس لديك صلاحيات للوصول لهذا القسم</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            نظام إدارة الموارد البشرية
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            الدور الحالي: {userRole} | الصلاحيات المتاحة: {availableSections.length}
          </p>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {availableSections.map((section) => {
            const Icon = section.icon;
            return (
              <TabsTrigger key={section.id} value={section.id} className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{section.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {availableSections.map((section) => {
          const Component = section.component;
          return (
            <TabsContent key={section.id} value={section.id}>
              <Component employeeId={employeeId} />
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
