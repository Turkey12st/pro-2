import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import AppLayout from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useToast } from '@/hooks/use-toast';
import { 
  User, 
  Mail, 
  Building2, 
  Shield, 
  Key, 
  LogOut,
  CheckCircle,
  AlertCircle,
  Calendar
} from 'lucide-react';

interface AccountInfo {
  email: string;
  companyName: string | null;
  companyId: string | null;
  role: string | null;
  createdAt: string | null;
}

export default function AccountPage() {
  const navigate = useNavigate();
  const { user, signOut, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [accountInfo, setAccountInfo] = useState<AccountInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [changingPassword, setChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchAccountInfo = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        // Get user's company info
        const { data: userCompany } = await supabase
          .from('users_companies')
          .select(`
            company_id,
            companies (
              id,
              name
            )
          `)
          .eq('user_id', user.id)
          .eq('is_default', true)
          .maybeSingle();

        // Get user's role
        const { data: userRole } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .maybeSingle();

        setAccountInfo({
          email: user.email || '',
          companyName: (userCompany?.companies as any)?.name || null,
          companyId: userCompany?.company_id || null,
          role: userRole?.role || 'viewer',
          createdAt: user.created_at || null,
        });
      } catch (error) {
        console.error('Error fetching account info:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAccountInfo();
  }, [user?.id]);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (newPassword.length < 8) {
      setPasswordError('كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('كلمات المرور غير متطابقة');
      return;
    }

    try {
      setChangingPassword(true);

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        setPasswordError('حدث خطأ أثناء تغيير كلمة المرور');
      } else {
        setPasswordSuccess('تم تغيير كلمة المرور بنجاح');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (error) {
      setPasswordError('حدث خطأ غير متوقع');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const getRoleLabel = (role: string | null) => {
    const roleLabels: Record<string, string> = {
      admin: 'مدير النظام',
      owner: 'المالك',
      accountant: 'محاسب',
      hr_manager: 'مدير الموارد البشرية',
      finance_manager: 'مدير مالي',
      project_manager: 'مدير مشاريع',
      viewer: 'مشاهد',
    };
    return roleLabels[role || 'viewer'] || role;
  };

  if (authLoading || loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="page-container max-w-4xl mx-auto">
        <div className="space-y-1 mb-6">
          <h1 className="page-title">إعدادات الحساب</h1>
          <p className="page-description">إدارة معلومات حسابك وإعدادات الأمان</p>
        </div>

        <div className="grid gap-6">
          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                معلومات الحساب
              </CardTitle>
              <CardDescription>
                البيانات الأساسية المرتبطة بحسابك
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-muted-foreground">البريد الإلكتروني</Label>
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{accountInfo?.email}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-muted-foreground">الشركة</Label>
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span>{accountInfo?.companyName || 'لم يتم تحديد شركة'}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-muted-foreground">الصلاحية</Label>
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <Badge variant="secondary">{getRoleLabel(accountInfo?.role)}</Badge>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-muted-foreground">تاريخ الإنشاء</Label>
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {accountInfo?.createdAt 
                        ? new Date(accountInfo.createdAt).toLocaleDateString('ar-SA')
                        : 'غير معروف'}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Change Password */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                تغيير كلمة المرور
              </CardTitle>
              <CardDescription>
                حافظ على أمان حسابك بتغيير كلمة المرور بانتظام
              </CardDescription>
            </CardHeader>
            <CardContent>
              {passwordError && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{passwordError}</AlertDescription>
                </Alert>
              )}
              
              {passwordSuccess && (
                <Alert className="mb-4 border-green-500 bg-green-50 text-green-700">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>{passwordSuccess}</AlertDescription>
                </Alert>
              )}
              
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">كلمة المرور الجديدة</Label>
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="8 أحرف على الأقل"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">تأكيد كلمة المرور الجديدة</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="أعد كتابة كلمة المرور"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                
                <Button type="submit" disabled={changingPassword}>
                  {changingPassword ? 'جاري التغيير...' : 'تغيير كلمة المرور'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Sign Out */}
          <Card className="border-destructive/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <LogOut className="h-5 w-5" />
                تسجيل الخروج
              </CardTitle>
              <CardDescription>
                تسجيل الخروج من حسابك على هذا الجهاز
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="destructive" onClick={handleSignOut}>
                تسجيل الخروج
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
