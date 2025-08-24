import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePermissions } from '@/hooks/usePermissions';
import { SecurityAuditPanel } from './SecurityAuditPanel';
import { UserManagementPanel } from './UserManagementPanel';
import { SystemSettingsPanel } from './SystemSettingsPanel';
import { PermissionManagementPanel } from './PermissionManagementPanel';
import { ActivityMonitorPanel } from './ActivityMonitorPanel';
import { 
  Shield, 
  Users, 
  Settings, 
  Key, 
  Activity,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Database
} from 'lucide-react';

export function AdminDashboard() {
  const { userRole, hasPermission } = usePermissions();
  const [activeTab, setActiveTab] = useState('overview');

  // التحقق من صلاحيات الإدارة
  if (!hasPermission('manage_users') && !hasPermission('configure_system')) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              غير مصرح
            </CardTitle>
            <CardDescription>
              ليس لديك صلاحية للوصول إلى لوحة تحكم الإدارة
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">لوحة تحكم الإدارة</h1>
          <p className="text-muted-foreground">
            إدارة النظام والأذونات والمستخدمين
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          {userRole === 'admin' ? 'مدير النظام' : 'مدير'}
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-6 w-full">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            نظرة عامة
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            المستخدمون
          </TabsTrigger>
          <TabsTrigger value="permissions" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            الأذونات
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            الأمان
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            النشاط
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            الإعدادات
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* إحصائيات سريعة */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">إجمالي المستخدمين</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">156</div>
                <p className="text-xs text-muted-foreground">+12% من الشهر الماضي</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">المستخدمين النشطين</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">89</div>
                <p className="text-xs text-muted-foreground">خلال آخر 30 يوم</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">التحذيرات الأمنية</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">3</div>
                <p className="text-xs text-muted-foreground">تحتاج إلى مراجعة</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">معدل الأمان</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">97%</div>
                <p className="text-xs text-muted-foreground">
                  <CheckCircle className="h-3 w-3 inline mr-1" />
                  ممتاز
                </p>
              </CardContent>
            </Card>
          </div>

          {/* نظرة عامة على النظام */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  حالة قاعدة البيانات
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>الجداول النشطة</span>
                  <Badge variant="secondary">42</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>سياسات الأمان</span>
                  <Badge variant="outline">78</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>النسخ الاحتياطية</span>
                  <Badge variant="default">تلقائية</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  نشاط النظام الأخير
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span>تسجيل دخول مستخدم جديد</span>
                    <span className="text-muted-foreground">منذ 5 دقائق</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>تحديث صلاحيات مستخدم</span>
                    <span className="text-muted-foreground">منذ 15 دقيقة</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>إضافة موظف جديد</span>
                    <span className="text-muted-foreground">منذ ساعة</span>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  عرض جميع الأنشطة
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users">
          <UserManagementPanel />
        </TabsContent>

        <TabsContent value="permissions">
          <PermissionManagementPanel />
        </TabsContent>

        <TabsContent value="security">
          <SecurityAuditPanel />
        </TabsContent>

        <TabsContent value="activity">
          <ActivityMonitorPanel />
        </TabsContent>

        <TabsContent value="settings">
          <SystemSettingsPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}