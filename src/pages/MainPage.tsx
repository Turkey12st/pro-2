
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { LayoutDashboard } from "lucide-react";

export default function MainPage() {
  const navigate = useNavigate();
  
  // Redirect to dashboard after short delay
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/dashboard");
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <AppLayout>
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
        <div className="text-center space-y-6 max-w-lg">
          <h1 className="text-3xl font-bold">مرحباً بك في نظام إدارة الأعمال</h1>
          <p className="text-muted-foreground">
            يتم توجيهك إلى لوحة المعلومات...
          </p>
          <Button 
            variant="default" 
            size="lg" 
            onClick={() => navigate("/dashboard")}
            className="mt-4"
          >
            <LayoutDashboard className="mr-2 h-4 w-4" />
            الذهاب للوحة المعلومات
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
