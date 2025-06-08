
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import DashboardPage from "@/pages/dashboard/Index";
import AuthPage from "@/pages/auth/Auth";
import AdminAuthPage from "@/pages/auth/AdminAuth";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

// إعداد عميل React Query مع خيارات محسنة
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 1000 * 60 * 5, // 5 دقائق
      gcTime: 1000 * 60 * 10, // 10 دقائق
    },
    mutations: {
      retry: 1,
    },
  },
});

const App = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    // تهيئة التطبيق والتحقق من الجلسة
    const initializeApp = async () => {
      try {
        // جلب الجلسة الحالية
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);

        // إعداد مستمع تغيير حالة المصادقة
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (event, session) => {
            console.log('Auth state changed:', event, session);
            setSession(session);
          }
        );

        setIsInitialized(true);

        // تنظيف المستمع عند إلغاء تحميل المكون
        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('خطأ في تهيئة التطبيق:', error);
        setIsInitialized(true);
      }
    };

    initializeApp();
  }, []);

  // عرض شاشة تحميل أثناء التهيئة
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">جاري تحميل النظام</h2>
          <p className="text-gray-500">نظام إدارة الأعمال المتكامل</p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* صفحة مصادقة المسؤول */}
            <Route 
              path="/admin" 
              element={
                session ? <Navigate to="/dashboard" replace /> : <AdminAuthPage />
              } 
            />
            
            {/* صفحة المصادقة العادية */}
            <Route 
              path="/auth" 
              element={
                session ? <Navigate to="/dashboard" replace /> : <AuthPage />
              } 
            />
            
            {/* الصفحة الرئيسية - توجيه للوحة التحكم */}
            <Route 
              path="/" 
              element={
                session ? <Navigate to="/dashboard" replace /> : <Navigate to="/admin" replace />
              } 
            />
            
            {/* صفحات التطبيق المحمية */}
            <Route 
              path="/*" 
              element={
                session ? <AppLayout /> : <Navigate to="/admin" replace />
              } 
            />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
