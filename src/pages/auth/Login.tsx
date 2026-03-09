import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { 
  Lock, Mail, AlertCircle, CheckCircle, KeyRound, 
  Building2, Shield, Zap, BarChart3, Users, ArrowLeft 
} from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('البريد الإلكتروني غير صالح'),
  password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
});

const resetSchema = z.object({
  email: z.string().email('البريد الإلكتروني غير صالح'),
});

async function setupNewUserCompany(userId: string, companyName: string): Promise<boolean> {
  try {
    const { data: newCompany, error: companyError } = await supabase
      .from('companies')
      .insert({ name: companyName, is_active: true })
      .select('id')
      .single();

    if (companyError || !newCompany) return false;

    const { error: linkError } = await supabase
      .from('users_companies')
      .insert({ user_id: userId, company_id: newCompany.id, is_default: true });

    if (linkError) return false;

    await supabase
      .from('user_roles')
      .insert({ user_id: userId, company_id: newCompany.id, role: 'admin' });

    return true;
  } catch {
    return false;
  }
}

const features = [
  { icon: BarChart3, title: 'تقارير ذكية', desc: 'تحليلات متقدمة ولوحات بيانات تفاعلية' },
  { icon: Users, title: 'إدارة الموظفين', desc: 'نظام موارد بشرية متكامل مع الرواتب' },
  { icon: Shield, title: 'أمان متقدم', desc: 'حماية البيانات وفق أعلى المعايير' },
  { icon: Zap, title: 'أداء فائق', desc: 'مزامنة فورية وتكامل سلس' },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, isAuthenticated, loading } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [fullName, setFullName] = useState('');

  useEffect(() => {
    if (isAuthenticated && !loading) {
      const from = (location.state as any)?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, loading, navigate, location]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    try {
      const validated = loginSchema.parse({ email, password });
      setIsSubmitting(true);
      
      const { error } = await signIn(validated.email, validated.password);
      
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setError('بيانات الدخول غير صحيحة. تحقق من البريد الإلكتروني وكلمة المرور.');
        } else if (error.message.includes('Email not confirmed')) {
          setError('لم يتم تأكيد البريد الإلكتروني. يرجى التحقق من بريدك الوارد.');
        } else {
          setError(error.message);
        }
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    try {
      const validated = resetSchema.parse({ email });
      setIsSubmitting(true);
      
      const { error } = await supabase.auth.resetPasswordForEmail(validated.email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      
      if (error) {
        setError('حدث خطأ أثناء إرسال رابط الاستعادة. حاول مرة أخرى.');
      } else {
        setSuccess('تم إرسال رابط استعادة كلمة المرور إلى بريدك الإلكتروني.');
        setEmail('');
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl gradient-primary animate-pulse-glow flex items-center justify-center">
            <Building2 className="h-8 w-8 text-primary-foreground" />
          </div>
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (showForgotPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-subtle p-4" dir="rtl">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-info/5 rounded-full blur-3xl" />
        </div>
        
        <Card className="w-full max-w-md glass-card animate-scale-in relative z-10">
          <CardHeader className="text-center space-y-4 pb-2">
            <div className="mx-auto w-20 h-20 rounded-2xl gradient-primary shadow-primary flex items-center justify-center animate-float">
              <KeyRound className="h-10 w-10 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl font-bold">استعادة كلمة المرور</CardTitle>
            <CardDescription className="text-base">أدخل بريدك الإلكتروني لإرسال رابط الاستعادة</CardDescription>
          </CardHeader>
          
          <CardContent className="pt-4">
            {error && (
              <Alert variant="destructive" className="mb-4 animate-slide-down">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {success && (
              <Alert className="mb-4 border-success/30 bg-success/5 text-success animate-slide-down">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleForgotPassword} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="reset-email" className="text-sm font-medium">البريد الإلكتروني</Label>
                <div className="relative">
                  <Mail className="absolute right-3 top-3.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="example@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pr-11 h-12 rounded-xl input-premium"
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              
              <Button type="submit" className="w-full h-12 rounded-xl btn-primary-glow text-base" disabled={isSubmitting}>
                {isSubmitting ? 'جاري الإرسال...' : 'إرسال رابط الاستعادة'}
              </Button>
              
              <Button
                type="button"
                variant="ghost"
                className="w-full h-11 rounded-xl"
                onClick={() => {
                  setShowForgotPassword(false);
                  setError(null);
                  setSuccess(null);
                }}
              >
                <ArrowLeft className="h-4 w-4 ml-2" />
                العودة لتسجيل الدخول
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" dir="rtl">
      {/* Left Side - Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 hero-gradient relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-black/10 to-transparent" />
        
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-20 w-72 h-72 bg-white/5 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-40 left-10 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-float stagger-2" />
          <div className="absolute top-1/2 right-1/3 w-48 h-48 bg-white/10 rounded-full blur-2xl animate-bounce-subtle" />
        </div>
        
        <div className="relative z-10 flex flex-col justify-center p-12 lg:p-16 text-white max-w-xl mx-auto">
          <div className="space-y-8 animate-slide-up">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Building2 className="h-8 w-8" />
              </div>
              <span className="text-2xl font-bold">نظام ERP المتكامل</span>
            </div>
            
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-4">
                إدارة أعمالك
                <br />
                <span className="text-white/80">بذكاء وكفاءة</span>
              </h1>
              <p className="text-lg text-white/70 leading-relaxed">
                منصة متكاملة لإدارة الموارد البشرية، المحاسبة، والعمليات المالية. 
                مصممة خصيصاً للمنشآت السعودية ومتوافقة مع الأنظمة الحكومية.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-4">
              {features.map((feature, index) => (
                <div 
                  key={feature.title}
                  className={`p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 animate-slide-up stagger-${index + 1}`}
                >
                  <feature.icon className="h-6 w-6 mb-2 text-white/90" />
                  <h3 className="font-semibold text-sm mb-1">{feature.title}</h3>
                  <p className="text-xs text-white/60">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-background p-6 sm:p-8 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-info/5 rounded-full blur-3xl" />
        </div>
        
        <div className="w-full max-w-md relative z-10 animate-fade-in">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                <Building2 className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">نظام ERP</span>
            </div>
          </div>
          
          <Card className="glass-card border-0 shadow-2xl">
            <CardHeader className="text-center space-y-3 pb-4">
              <div className="mx-auto w-16 h-16 rounded-2xl gradient-primary shadow-primary flex items-center justify-center animate-bounce-subtle">
                <Lock className="h-8 w-8 text-primary-foreground" />
              </div>
              <CardTitle className="text-2xl font-bold">مرحباً بعودتك</CardTitle>
              <CardDescription className="text-base">سجل دخولك للوصول إلى لوحة التحكم</CardDescription>
            </CardHeader>
            
            <CardContent className="pt-2">
              {error && (
                <Alert variant="destructive" className="mb-4 animate-slide-down">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              {success && (
                <Alert className="mb-4 border-success/30 bg-success/5 text-success animate-slide-down">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}
              
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="login-email" className="text-sm font-medium">البريد الإلكتروني</Label>
                  <div className="relative">
                    <Mail className="absolute right-3 top-3.5 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="example@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pr-11 h-12 rounded-xl input-premium"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="login-password" className="text-sm font-medium">كلمة المرور</Label>
                    <Button
                      type="button"
                      variant="link"
                      className="px-0 text-xs h-auto text-primary hover:text-primary/80"
                      onClick={() => setShowForgotPassword(true)}
                    >
                      نسيت كلمة المرور؟
                    </Button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute right-3 top-3.5 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pr-11 h-12 rounded-xl input-premium"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full h-12 rounded-xl btn-primary-glow text-base font-semibold" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      جاري تسجيل الدخول...
                    </span>
                  ) : 'تسجيل الدخول'}
                </Button>
              </form>
              
              <div className="mt-6 p-4 bg-muted/30 rounded-xl border border-border/50">
                <div className="flex items-start gap-3 text-muted-foreground">
                  <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground text-sm">التسجيل متوقف مؤقتاً</p>
                    <p className="text-xs mt-1">نعمل على تحسين النظام. سيتم فتح التسجيل قريباً.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <p className="text-center text-xs text-muted-foreground mt-6">
            © 2024 نظام ERP المتكامل. جميع الحقوق محفوظة.
          </p>
        </div>
      </div>
    </div>
  );
}
