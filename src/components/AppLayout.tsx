
import React, { useEffect, useState } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { AppNavigation } from "@/components/AppNavigation";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, AlertTriangle } from "lucide-react";

// استيراد الصفحات
import DashboardPage from "@/pages/dashboard/Index";
import HRPage from "@/pages/hr/Index";
import AccountingPage from "@/pages/accounting/Index";
import ProjectsPage from "@/pages/projects/Index";
import ClientsPage from "@/pages/clients/Index";
import PartnersPage from "@/pages/partners/Index";
import CapitalPage from "@/pages/capital/Index";
import DocumentsPage from "@/pages/documents/Index";
import FinancialPage from "@/pages/financial/Index";
import SettingsPage from "@/pages/settings/Index";
import CompanyPage from "@/pages/company/Index";
import CalendarPage from "@/pages/calendar/Index";
import ProjectDetails from "@/pages/projects/ProjectDetails";
import EmployeeProfile from "@/pages/hr/EmployeeProfile";
import AccountingIntegration from "@/pages/hr/AccountingIntegration";

export function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    initializeAuth();
  }, [navigate]);

  const initializeAuth = async () => {
    try {
      setIsLoading(true);
      setAuthError(null);

      // فحص الجلسة الحالية
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('خطأ في جلب الجلسة:', sessionError);
        setAuthError('حدث خطأ في التحقق من الهوية');
        navigate('/auth');
        return;
      }

      if (!session) {
        console.log('لا توجد جلسة نشطة، توجيه لصفحة تسجيل الدخول');
        navigate('/auth');
        return;
      }

      setUser(session.user);
      
      // مراقبة تغيير حالة المصادقة
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log('حدث تغيير في حالة المصادقة:', event);
          
          if (event === 'SIGNED_OUT' || !session) {
            setUser(null);
            toast({
              title: 'تم تسجيل الخروج',
              description: 'تم تسجيل خروجك من النظام',
            });
            navigate('/auth');
          } else if (event === 'SIGNED_IN' && session) {
            setUser(session.user);
            setAuthError(null);
            
            // التوجه للوحة الرئيسية إذا كان في صفحة المصادقة
            if (location.pathname === '/auth') {
              navigate('/dashboard');
            }
          } else if (event === 'TOKEN_REFRESHED') {
            console.log('تم تحديث رمز المصادقة');
            setUser(session?.user || null);
          }
        }
      );

      return () => subscription.unsubscribe();

    } catch (error: any) {
      console.error('خطأ في تهيئة المصادقة:', error);
      setAuthError('حدث خطأ في تهيئة النظام');
      
      toast({
        title: 'خطأ في النظام',
        description: 'حدث خطأ في تهيئة النظام، يرجى المحاولة مرة أخرى',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // معالج لتسجيل الخروج
  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('خطأ في تسجيل الخروج:', error);
        toast({
          title: 'خطأ في تسجيل الخروج',
          description: 'حدث خطأ أثناء تسجيل الخروج',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('خطأ غير متوقع في تسجيل الخروج:', error);
    }
  };

  // شاشة التحميل
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">جاري تحميل النظام...</p>
        </div>
      </div>
    );
  }

  // شاشة الخطأ
  if (authError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">خطأ في النظام</h1>
          <p className="text-gray-600 mb-4">{authError}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            إعادة تحميل الصفحة
          </button>
        </div>
      </div>
    );
  }

  // التخطيط الرئيسي للتطبيق
  return (
    <div className="min-h-screen bg-gray-50">
      <AppNavigation user={user} onSignOut={handleSignOut} />
      <main className="lg:pl-72">
        <div className="min-h-screen">
          <Routes>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/hr" element={<HRPage />} />
            <Route path="/hr/employee/:id" element={<EmployeeProfile />} />
            <Route path="/hr/accounting-integration" element={<AccountingIntegration />} />
            <Route path="/accounting" element={<AccountingPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/projects/:id" element={<ProjectDetails />} />
            <Route path="/clients" element={<ClientsPage />} />
            <Route path="/partners" element={<PartnersPage />} />
            <Route path="/capital" element={<CapitalPage />} />
            <Route path="/documents" element={<DocumentsPage />} />
            <Route path="/financial" element={<FinancialPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/company" element={<CompanyPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
