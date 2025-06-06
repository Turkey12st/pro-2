
import React from "react";
import { Container } from "@/components/ui/container";
import { CompanyInfoCard } from "@/components/dashboard/CompanyInfoCard";
import { ERPDashboard } from "@/components/dashboard/ERPDashboard";
import { QuickNavMenu } from "@/components/dashboard/QuickNavMenu";
import { AutoSaveProvider } from "@/components/dashboard/AutoSaveProvider";
import { IntegratedDashboardStats } from "@/components/dashboard/IntegratedDashboardStats";
import { usePermissions } from "@/hooks/usePermissions";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, AlertTriangle, Info } from "lucide-react";

export default function DashboardPage() {
  const { hasPermission, isLoading, userRole, isAdmin } = usePermissions();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري تحميل الصلاحيات...</p>
        </div>
      </div>
    );
  }

  if (!hasPermission('view_dashboard')) {
    return (
      <div className="container mx-auto py-6">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">الوصول مقيد</h3>
            <p className="text-muted-foreground mb-4">
              ليس لديك صلاحية للوصول إلى لوحة التحكم
            </p>
            <p className="text-sm text-muted-foreground">
              دورك الحالي: {userRole} | تحتاج إلى صلاحية "view_dashboard"
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <AutoSaveProvider>
      <div className="space-y-6 p-4 sm:p-6 md:p-8">
        {/* رأس الصفحة مع معلومات الصلاحيات */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">لوحة التحكم المتكاملة</h1>
            <p className="text-muted-foreground">نظام ERP شامل لإدارة الأعمال مع ترابط البيانات</p>
            <div className="flex items-center gap-2 mt-2">
              <div className={`w-2 h-2 rounded-full ${isAdmin() ? 'bg-red-500' : 'bg-blue-500'}`}></div>
              <span className="text-sm text-muted-foreground">
                دورك: {isAdmin() ? 'الإدمن الرئيسي' : userRole}
              </span>
            </div>
          </div>
          <QuickNavMenu />
        </div>

        {/* تنبيه للإدمن الرئيسي */}
        {isAdmin() && (
          <Card className="border-l-4 border-l-red-500 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-red-800">وضع الإدمن الرئيسي</h4>
                  <p className="text-sm text-red-700 mt-1">
                    أنت تملك صلاحيات كاملة على النظام. يمكنك الوصول لجميع البيانات والميزات.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* معلومات النظام */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-blue-800 mb-1">نظام ERP متكامل</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 text-sm text-blue-700">
                  <div>✓ ترابط البيانات في الوقت الفعلي</div>
                  <div>✓ نظام صلاحيات متقدم</div>
                  <div>✓ مؤشرات أداء شاملة</div>
                  <div>✓ توافق مع الأنظمة السعودية</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* مؤشرات الأداء الأساسية */}
        <IntegratedDashboardStats />

        {/* لوحة التحكم الشاملة */}
        {(isAdmin() || hasPermission('view_analytics')) && (
          <ERPDashboard />
        )}

        {/* معلومات إضافية للمدراء */}
        {(hasPermission('manage_users') || hasPermission('configure_system')) && (
          <Card>
            <CardContent className="p-4">
              <h4 className="font-medium mb-2">أدوات الإدارة المتاحة</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                {hasPermission('manage_users') && (
                  <div className="flex items-center gap-2 text-blue-600">
                    <Shield className="h-4 w-4" />
                    إدارة المستخدمين والأدوار
                  </div>
                )}
                {hasPermission('configure_system') && (
                  <div className="flex items-center gap-2 text-green-600">
                    <Shield className="h-4 w-4" />
                    إعدادات النظام
                  </div>
                )}
                {hasPermission('view_audit_logs') && (
                  <div className="flex items-center gap-2 text-purple-600">
                    <Shield className="h-4 w-4" />
                    سجلات المراجعة
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AutoSaveProvider>
  );
}
