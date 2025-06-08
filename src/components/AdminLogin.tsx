
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, User, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // تسجيل الدخول
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginError) {
        if (loginError.message.includes('Invalid login credentials')) {
          setError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
        } else if (loginError.message.includes('Email not confirmed')) {
          setError('يرجى تأكيد البريد الإلكتروني أولاً');
        } else {
          setError('خطأ في تسجيل الدخول: ' + loginError.message);
        }
        return;
      }

      if (data.user) {
        // التحقق من دور المستخدم أو تعيينه كمسؤول
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', data.user.id)
          .single();

        if (roleError && roleError.code !== 'PGRST116') {
          console.error('خطأ في جلب دور المستخدم:', roleError);
        }

        // تعيين دور المسؤول إذا لم يكن موجوداً
        if (!roleData) {
          await supabase
            .from('user_roles')
            .upsert({
              user_id: data.user.id,
              role: 'admin',
              permissions: [
                'view_dashboard', 'manage_users', 'configure_system', 'view_analytics',
                'view_employees', 'add_employees', 'edit_employees', 'delete_employees',
                'view_attendance', 'add_attendance', 'edit_attendance', 'approve_attendance',
                'view_salaries', 'process_salaries', 'approve_salaries',
                'manage_benefits', 'manage_deductions', 'approve_benefits',
                'view_violations', 'add_violations', 'approve_violations',
                'configure_hr_rules', 'view_reports', 'export_data',
                'view_financials', 'manage_financials', 'approve_transactions',
                'view_projects', 'manage_projects', 'approve_projects',
                'manage_company_info', 'manage_partners', 'manage_capital',
                'view_audit_logs', 'export_reports'
              ]
            });
        }

        setSuccess('تم تسجيل الدخول بنجاح!');
        toast({
          title: 'تم تسجيل الدخول بنجاح',
          description: 'مرحباً بك في نظام الإدارة',
        });

        // انتظار قصير للسماح للمستخدم برؤية رسالة النجاح
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      }
    } catch (error: any) {
      console.error('خطأ في تسجيل الدخول:', error);
      setError('حدث خطأ أثناء تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTestAdmin = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // استخدام بريد إلكتروني صالح للاختبار
      const testAdminEmail = 'test.admin@example.com';
      const testAdminPassword = 'TestAdmin123!';

      // محاولة تسجيل الدخول أولاً
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: testAdminEmail,
        password: testAdminPassword,
      });

      if (signInData.user) {
        // المستخدم موجود بالفعل، تسجيل الدخول ناجح
        setSuccess('تم تسجيل الدخول بحساب الاختبار بنجاح!');
        toast({
          title: 'تم الدخول بنجاح',
          description: `البريد: ${testAdminEmail}`,
        });
        
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
        return;
      }

      // إذا فشل تسجيل الدخول، نحاول إنشاء حساب جديد
      if (signInError && signInError.message.includes('Invalid login credentials')) {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: testAdminEmail,
          password: testAdminPassword,
          options: {
            data: {
              full_name: 'مسؤول الاختبار',
            }
          }
        });

        if (signUpError) {
          if (signUpError.message.includes('User already registered')) {
            setError('الحساب موجود بالفعل، يرجى تسجيل الدخول');
            setEmail(testAdminEmail);
          } else {
            setError('خطأ في إنشاء الحساب: ' + signUpError.message);
          }
          return;
        }

        if (signUpData.user) {
          // تعيين صلاحيات المسؤول
          await supabase
            .from('user_roles')
            .upsert({
              user_id: signUpData.user.id,
              role: 'admin',
              permissions: [
                'view_dashboard', 'manage_users', 'configure_system', 'view_analytics',
                'view_employees', 'add_employees', 'edit_employees', 'delete_employees',
                'view_attendance', 'add_attendance', 'edit_attendance', 'approve_attendance',
                'view_salaries', 'process_salaries', 'approve_salaries',
                'manage_benefits', 'manage_deductions', 'approve_benefits',
                'view_violations', 'add_violations', 'approve_violations',
                'configure_hr_rules', 'view_reports', 'export_data',
                'view_financials', 'manage_financials', 'approve_transactions',
                'view_projects', 'manage_projects', 'approve_projects',
                'manage_company_info', 'manage_partners', 'manage_capital',
                'view_audit_logs', 'export_reports'
              ]
            });

          setSuccess('تم إنشاء حساب المسؤول بنجاح!');
          toast({
            title: 'تم إنشاء الحساب',
            description: `البريد: ${testAdminEmail} | كلمة المرور: ${testAdminPassword}`,
          });

          // تحديث الحقول
          setEmail(testAdminEmail);
          setPassword(testAdminPassword);
        }
      } else {
        setError('خطأ غير متوقع: ' + signInError?.message);
      }
    } catch (error: any) {
      console.error('خطأ في إنشاء حساب المسؤول:', error);
      setError('حدث خطأ أثناء إنشاء حساب المسؤول');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-600 rounded-xl flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">دخول المسؤول</h1>
          <p className="text-gray-600">الوصول السريع لوحة تحكم المسؤول</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader>
            <CardTitle className="text-center text-red-600">تسجيل دخول المسؤول</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="admin-email">البريد الإلكتروني</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="admin-email"
                    type="email"
                    placeholder="test.admin@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9"
                    required
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin-password">كلمة المرور</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="admin-password"
                    type="password"
                    placeholder="كلمة مرور المسؤول"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9"
                    required
                  />
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="border-green-500 text-green-700">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={loading}>
                {loading ? 'جاري تسجيل الدخول...' : 'دخول المسؤول'}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">أو</span>
              </div>
            </div>

            <Button 
              onClick={handleCreateTestAdmin}
              variant="outline" 
              className="w-full border-red-200 text-red-600 hover:bg-red-50"
              disabled={loading}
            >
              إنشاء/دخول حساب اختبار
            </Button>

            <div className="text-center text-sm text-gray-600 space-y-1">
              <p>🔑 حساب المسؤول للاختبار:</p>
              <p>البريد: test.admin@example.com</p>
              <p>كلمة المرور: TestAdmin123!</p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-gray-500">
          <p>⚠️ هذا دخول خاص للمسؤولين فقط</p>
          <p>🔐 صلاحيات كاملة على النظام</p>
        </div>
      </div>
    </div>
  );
}
