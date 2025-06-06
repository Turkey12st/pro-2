
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Eye, EyeOff, Lock, Mail, User, Shield, CheckCircle, AlertCircle } from 'lucide-react';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkUserSession();
    setupAuthStateListener();
  }, [navigate]);

  const checkUserSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('خطأ في فحص الجلسة:', error);
    }
  };

  const setupAuthStateListener = () => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && event === 'SIGNED_IN') {
        toast({
          title: 'تم تسجيل الدخول بنجاح',
          description: 'مرحباً بك في النظام',
        });
        navigate('/dashboard');
      }
    });

    return () => subscription.unsubscribe();
  };

  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    return strength;
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    setPasswordStrength(calculatePasswordStrength(value));
  };

  const validateForm = (isSignUp: boolean) => {
    if (!email || !password) {
      setError('جميع الحقول مطلوبة');
      return false;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('البريد الإلكتروني غير صحيح');
      return false;
    }

    if (isSignUp) {
      if (!fullName.trim()) {
        setError('الاسم الكامل مطلوب');
        return false;
      }
      if (password.length < 6) {
        setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
        return false;
      }
    }

    return true;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm(true)) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      });

      if (error) {
        if (error.message.includes('User already registered')) {
          setError('هذا البريد الإلكتروني مسجل بالفعل. يرجى تسجيل الدخول بدلاً من ذلك.');
        } else {
          setError(error.message);
        }
        return;
      }

      if (data.user) {
        await createUserRole(data.user.id, fullName);
        
        setSuccess('تم إنشاء الحساب بنجاح! يمكنك الآن تسجيل الدخول.');
        
        toast({
          title: 'تم إنشاء الحساب بنجاح',
          description: 'يمكنك الآن الوصول للنظام',
        });
      }
    } catch (error: any) {
      console.error('خطأ في التسجيل:', error);
      setError('حدث خطأ أثناء إنشاء الحساب');
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm(false)) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
        } else {
          setError(error.message);
        }
        return;
      }

      if (data.user) {
        setSuccess('تم تسجيل الدخول بنجاح!');
      }
    } catch (error: any) {
      console.error('خطأ في تسجيل الدخول:', error);
      setError('حدث خطأ أثناء تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  const createUserRole = async (userId: string, userName: string) => {
    try {
      const { data: existingAdmins } = await supabase
        .from('user_roles')
        .select('*')
        .eq('role', 'admin');

      const isFirstAdmin = !existingAdmins || existingAdmins.length === 0;
      const role = isFirstAdmin ? 'admin' : 'employee';

      const permissions = isFirstAdmin ? [
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
      ] : ['view_dashboard'];

      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role,
          permissions
        });

      if (error) {
        console.error('خطأ في إنشاء دور المستخدم:', error);
      } else if (isFirstAdmin) {
        toast({
          title: 'مرحباً بك كإدمن رئيسي',
          description: 'تم منحك صلاحيات الإدمن الرئيسي للنظام',
        });
      }
    } catch (error) {
      console.error('خطأ في إنشاء دور المستخدم:', error);
    }
  };

  const getPasswordStrengthText = () => {
    switch (passwordStrength) {
      case 0:
      case 1:
        return { text: 'ضعيفة', color: 'text-red-500' };
      case 2:
      case 3:
        return { text: 'متوسطة', color: 'text-yellow-500' };
      case 4:
      case 5:
        return { text: 'قوية', color: 'text-green-500' };
      default:
        return { text: '', color: '' };
    }
  };

  const strengthInfo = getPasswordStrengthText();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">نظام إدارة الأعمال</h1>
          <p className="text-gray-600">نظام ERP متكامل للشركات السعودية</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl text-center">الوصول للنظام</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">تسجيل الدخول</TabsTrigger>
                <TabsTrigger value="signup">إنشاء حساب جديد</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">البريد الإلكتروني</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="signin-email"
                        type="email"
                        placeholder="أدخل البريد الإلكتروني"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-9"
                        required
                        dir="ltr"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">كلمة المرور</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="signin-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="أدخل كلمة المرور"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-9 pr-9"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1 h-7 w-7 p-0"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
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
                  
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">الاسم الكامل</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="أدخل الاسم الكامل"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="pl-9"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">البريد الإلكتروني</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="أدخل البريد الإلكتروني"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-9"
                        required
                        dir="ltr"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">كلمة المرور</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="أدخل كلمة مرور قوية"
                        value={password}
                        onChange={(e) => handlePasswordChange(e.target.value)}
                        className="pl-9 pr-9"
                        required
                        minLength={6}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1 h-7 w-7 p-0"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    {password && (
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-300 ${
                              passwordStrength <= 2 ? 'bg-red-500' : 
                              passwordStrength <= 3 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${(passwordStrength / 5) * 100}%` }}
                          />
                        </div>
                        <span className={`text-xs font-medium ${strengthInfo.color}`}>
                          {strengthInfo.text}
                        </span>
                      </div>
                    )}
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
                  
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'جاري إنشاء الحساب...' : 'إنشاء حساب جديد'}
                  </Button>
                  
                  <div className="text-center">
                    <p className="text-sm text-gray-600">
                      أول مستخدم يسجل سيحصل على صلاحيات الإدمن الرئيسي
                    </p>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="text-center mt-6 text-sm text-gray-500">
          <p>نظام إدارة متكامل للشركات السعودية</p>
          <p>✅ يلتزم بأنظمة وزارة الموارد البشرية</p>
          <p>✅ يلتزم بنظام التأمينات الاجتماعية</p>
          <p>✅ يلتزم بأنظمة وزارة التجارة</p>
        </div>
      </div>
    </div>
  );
}
