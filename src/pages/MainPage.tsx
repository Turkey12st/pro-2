import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  LayoutDashboard, 
  ArrowRight, 
  FileText, 
  Users, 
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

  const systemStats = [
    { 
      title: "إجمالي المشاريع", 
      value: "12", 
      description: "مشروع نشط",
      icon: LayoutDashboard,
      href: "/projects",
    },
    { 
      title: "عدد الموظفين", 
      value: "24", 
      description: "موظف مسجل",
      icon: Users,
      href: "/hr",
    },
    { 
      title: "المستندات", 
      value: "156", 
      description: "مستند محفوظ",
      icon: FileText,
      href: "/documents",
    },
    { 
      title: "رأس المال", 
      value: "1.2M", 
      description: "ريال سعودي",
      icon: TrendingUp,
      href: "/capital",
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
    <div className="page-container">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <h1 className="page-title">مرحباً بك في نظام إدارة الأعمال المتكامل</h1>
        <p className="page-description text-lg max-w-2xl mx-auto">
          نظام شامل مع قاعدة بيانات مترابطة لإدارة جميع احتياجات شركتك من مكان واحد.
        </p>
        
        <div className="flex justify-center gap-4 flex-wrap">
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
      <Card className="border-2 border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Database className="h-5 w-5" />
            حالة تكامل البيانات
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className={`w-4 h-4 rounded-full mx-auto mb-2 ${hasInitialized ? 'bg-primary' : 'bg-warning'}`} />
              <p className="text-sm font-medium">
                {hasInitialized ? 'تم التهيئة' : 'جاري التهيئة'}
              </p>
            </div>
            <div className="text-center">
              <div className="w-4 h-4 rounded-full bg-primary mx-auto mb-2" />
              <p className="text-sm font-medium">البيانات مترابطة</p>
            </div>
            <div className="text-center">
              <div className="w-4 h-4 rounded-full bg-primary mx-auto mb-2" />
              <p className="text-sm font-medium">العلاقات صحيحة</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="dashboard-grid">
        {systemStats.map((stat) => (
          <Card 
            key={stat.title} 
            className="stat-card cursor-pointer" 
            onClick={() => navigate(stat.href)}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="stat-label">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="stat-value">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Activities */}
        <Card className="section-card">
          <CardHeader>
            <CardTitle className="section-title">
              <Calendar className="h-5 w-5" />
              الأنشطة الأخيرة
            </CardTitle>
            <CardDescription>
              آخر التحديثات والأنشطة في النظام المتكامل
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div className={`w-2 h-2 rounded-full ${
                  activity.type === 'system' ? 'bg-primary' : 'bg-info'
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
        <Card className="section-card">
          <CardHeader>
            <CardTitle className="section-title">
              <AlertCircle className="h-5 w-5" />
              حالة النظام المتكامل
            </CardTitle>
            <CardDescription>
              المؤشرات العامة لحالة النظام وترابط البيانات
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: "قاعدة البيانات", status: "متصلة ✓" },
              { label: "ترابط البيانات", status: hasInitialized ? 'مكتمل ✓' : 'جاري التهيئة...' },
              { label: "العلاقات", status: "صحيحة ✓" },
              { label: "التخزين السحابي", status: "متاح ✓" },
              { label: "النسخ الاحتياطي", status: "محدث ✓" },
              { label: "الأمان", status: "آمن ✓" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <span className="text-sm">{item.label}</span>
                <span className="text-sm text-primary font-medium">{item.status}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
