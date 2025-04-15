
import React, { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LayoutDashboard, ArrowRight, FileText, Users, Receipt, Building2 } from "lucide-react";

export default function MainPage() {
  const navigate = useNavigate();
  
  // تم تعديل مهلة التوجيه لنعطي المستخدم وقتًا أطول لاستكشاف الصفحة الرئيسية
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/dashboard");
    }, 10000); // تم زيادة المهلة إلى 10 ثوانٍ
    
    return () => clearTimeout(timer);
  }, [navigate]);

  // قائمة الروابط السريعة للصفحات
  const quickLinks = [
    { name: "لوحة المعلومات", href: "/dashboard", icon: LayoutDashboard, color: "bg-blue-100 text-blue-700" },
    { name: "المحاسبة", href: "/accounting", icon: Receipt, color: "bg-green-100 text-green-700" },
    { name: "الموظفين", href: "/hr", icon: Users, color: "bg-purple-100 text-purple-700" },
    { name: "المستندات", href: "/documents", icon: FileText, color: "bg-amber-100 text-amber-700" },
    { name: "معلومات الشركة", href: "/company", icon: Building2, color: "bg-indigo-100 text-indigo-700" }
  ];

  return (
    <AppLayout>
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
        <div className="text-center space-y-6 max-w-2xl w-full">
          <h1 className="text-3xl font-bold">مرحباً بك في نظام إدارة الأعمال</h1>
          <p className="text-muted-foreground">
            سيتم توجيهك إلى لوحة المعلومات قريبًا، أو يمكنك النقر على الزر أدناه للانتقال مباشرة.
          </p>
          
          <div className="flex justify-center">
            <Button 
              variant="default" 
              size="lg" 
              onClick={() => navigate("/dashboard")}
              className="mt-4 flex items-center gap-2"
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>الذهاب للوحة المعلومات</span>
              <ArrowRight className="h-4 w-4 mr-1" />
            </Button>
          </div>

          {/* قسم الوصول السريع */}
          <div className="mt-10">
            <h2 className="text-xl font-semibold mb-4">الوصول السريع للصفحات</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {quickLinks.map((link) => (
                <Card key={link.href} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <Link 
                      to={link.href} 
                      className="flex items-center gap-3 no-underline text-foreground"
                    >
                      <div className={`p-2 rounded-full ${link.color}`}>
                        <link.icon className="h-5 w-5" />
                      </div>
                      <span className="font-medium">{link.name}</span>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
