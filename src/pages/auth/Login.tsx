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
import { Lock, Mail, AlertCircle, CheckCircle, KeyRound } from 'lucide-react';

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
        <LoadingSpinner />
      </div>
    );
  }

  if (showForgotPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4" dir="rtl">
        <Card className="w-full max-w-md shadow-lg border-border">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <KeyRound className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">استعادة كلمة المرور</CardTitle>
            <CardDescription>أدخل بريدك الإلكتروني لإرسال رابط الاستعادة</CardDescription>
          </CardHeader>
          
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {success && (
              <Alert className="mb-4 border-primary/30 bg-primary/5 text-primary">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">البريد الإلكتروني</Label>
                <div className="relative">
                  <Mail className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="example@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pr-10"
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'جاري الإرسال...' : 'إرسال رابط الاستعادة'}
              </Button>
              
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => {
                  setShowForgotPassword(false);
                  setError(null);
                  setSuccess(null);
                }}
              >
                العودة لتسجيل الدخول
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4" dir="rtl">
      <Card className="w-full max-w-md shadow-lg border-border">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">نظام إدارة الأعمال</CardTitle>
          <CardDescription>سجل دخولك للوصول إلى لوحة التحكم</CardDescription>
        </CardHeader>
        
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {success && (
            <Alert className="mb-4 border-primary/30 bg-primary/5 text-primary">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="login-email">البريد الإلكتروني</Label>
              <div className="relative">
                <Mail className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="login-email"
                  type="email"
                  placeholder="example@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pr-10"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="login-password">كلمة المرور</Label>
                <Button
                  type="button"
                  variant="link"
                  className="px-0 text-xs h-auto"
                  onClick={() => setShowForgotPassword(true)}
                >
                  نسيت كلمة المرور؟
                </Button>
              </div>
              <div className="relative">
                <Lock className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="login-password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>
            
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
            </Button>
          </form>
          
          <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-border">
            <div className="flex items-center gap-2 text-muted-foreground">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <div>
                <p className="font-medium text-foreground">التسجيل متوقف مؤقتاً</p>
                <p className="text-sm">نعمل على تحسين النظام. سيتم فتح التسجيل قريباً.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
