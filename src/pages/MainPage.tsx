
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, ArrowRight } from "lucide-react";

export default function MainPage() {
  const navigate = useNavigate();
  
  // تم تعديل مهلة التوجيه لنعطي المستخدم وقتًا أطول لاستكشاف الصفحة الرئيسية
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/dashboard");
    }, 5000); // تم زيادة المهلة إلى 5 ثوانٍ
    
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <AppLayout>
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
        <div className="text-center space-y-6 max-w-lg">
          <h1 className="text-3xl font-bold">مرحباً بك في نظام إدارة الأعمال</h1>
          <p className="text-muted-foreground">
            سيتم توجيهك إلى لوحة المعلومات قريبًا، أو يمكنك النقر على الزر أدناه للانتقال مباشرة.
          </p>
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
      </div>
    </AppLayout>
  );
}
