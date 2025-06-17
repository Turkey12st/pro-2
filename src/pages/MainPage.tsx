
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  LayoutDashboard, 
  ArrowRight, 
  FileText, 
  Users, 
  Receipt, 
  Building2,
  TrendingUp,
  Calendar,
  AlertCircle,
  Database,
  RefreshCw
} from "lucide-react";
import { useDataIntegration } from "@/hooks/useDataIntegration";

export default function MainPage() {
  const navigate = useNavigate();
  const { isInitializing, hasInitialized, refreshDataIntegrity } = useDataIntegration();
  
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/dashboard");
    }, 15000);
    
    return () => clearTimeout(timer);
  }, [navigate]);

  const systemStats = [
    { 
      title: "إجمالي المشاريع", 
      value: "12", 
      description: "مشروع نشط",
      icon: LayoutDashboard,
      color: "text-blue-600" 
    },
    { 
      title: "عدد الموظفين", 
      value: "24", 
      description: "موظف مسجل",
      icon: Users,
      color: "text-green-600" 
    },
    { 
      title: "المستندات", 
      value: "156", 
      description: "مستند محفوظ",
      icon: FileText,
      color: "text-purple-600" 
    },
    { 
      title: "رأس المال", 
      value: "1.2M", 
      description: "ريال سعودي",
      icon: TrendingUp,
      color: "text-amber-600" 
    }
  ];

  const recentActivities = [
    { title: "تم تهيئة ترابط البيانات", time: "منذ دقائق", type: "system" },
    { title: "تم إضافة مشروع جديد", time: "منذ ساعتين", type: "project" },
    { title: "تحديث بيانات موظف", time: "منذ 4 ساعات", type: "hr" },
    { title: "رفع مستند جديد", time: "أمس", type: "document" },
    { title: "دفع راتب شهري", time: "منذ يومين", type: "finance" }
  ];

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">مرحباً بك في نظام إدارة الأعمال المتكامل</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            نظام شامل مع قاعدة بيانات مترابطة لإدارة جميع احتياجات شركتك من مكان واحد. 
            تم ضمان ترابط البيانات عبر جميع الأقسام.
          </p>
          
          <div className="flex justify-center gap-4">
            <Button 
              onClick={() => navigate("/dashboard")}
              size="lg" 
              className="text-lg px-8 py-3"
            >
              <LayoutDashboard className="h-5 w-5 ml-2" />
              الذهاب للوحة المعلومات
              <ArrowRight className="h-5 w-5 mr-2" />
            </Button>
            
            <Button 
              onClick={refreshDataIntegrity}
              variant="outline"
              size="lg" 
              className="text-lg px-8 py-3"
              disabled={isInitializing}
            >
              <RefreshCw className={`h-5 w-5 ml-2 ${isInitializing ? 'animate-spin' : ''}`} />
              تحديث ترابط البيانات
            </Button>
          </div>
        </div>

        {/* Data Integration Status */}
        <Card className="border-2 border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Database className="h-5 w-5" />
              حالة تكامل البيانات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className={`w-4 h-4 rounded-full mx-auto mb-2 ${hasInitialized ? 'bg-green-500' : 'bg-yellow-500'}`} />
                <p className="text-sm font-medium">
                  {hasInitialized ? 'تم التهيئة' : 'جاري التهيئة'}
                </p>
              </div>
              <div className="text-center">
                <div className="w-4 h-4 rounded-full bg-green-500 mx-auto mb-2" />
                <p className="text-sm font-medium">البيانات مترابطة</p>
              </div>
              <div className="text-center">
                <div className="w-4 h-4 rounded-full bg-green-500 mx-auto mb-2" />
                <p className="text-sm font-medium">العلاقات صحيحة</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {systemStats.map((stat) => (
            <Card key={stat.title} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Recent Activities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                الأنشطة الأخيرة
              </CardTitle>
              <CardDescription>
                آخر التحديثات والأنشطة في النظام المتكامل
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.type === 'system' ? 'bg-green-500' : 'bg-blue-500'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.title}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* System Health */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                حالة النظام المتكامل
              </CardTitle>
              <CardDescription>
                المؤشرات العامة لحالة النظام وترابط البيانات
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">قاعدة البيانات</span>
                  <span className="text-sm text-green-600 font-medium">متصلة ✓</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">ترابط البيانات</span>
                  <span className="text-sm text-green-600 font-medium">
                    {hasInitialized ? 'مكتمل ✓' : 'جاري التهيئة...'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">العلاقات</span>
                  <span className="text-sm text-green-600 font-medium">صحيحة ✓</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">التخزين السحابي</span>
                  <span className="text-sm text-green-600 font-medium">متاح ✓</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">النسخ الاحتياطي</span>
                  <span className="text-sm text-green-600 font-medium">محدث ✓</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">الأمان</span>
                  <span className="text-sm text-green-600 font-medium">آمن ✓</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
