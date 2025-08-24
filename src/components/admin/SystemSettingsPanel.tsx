import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Settings, 
  Database, 
  Mail, 
  Shield, 
  Bell,
  Save,
  RotateCcw
} from 'lucide-react';

interface SystemSettings {
  general: {
    systemName: string;
    systemLogo: string;
    defaultLanguage: string;
    timezone: string;
    dateFormat: string;
  };
  security: {
    sessionTimeout: number;
    passwordPolicy: {
      minLength: number;
      requireUppercase: boolean;
      requireLowercase: boolean;
      requireNumbers: boolean;
      requireSymbols: boolean;
    };
    maxLoginAttempts: number;
    enableTwoFactor: boolean;
  };
  notifications: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    documentExpiryDays: number;
    salaryProcessingReminder: boolean;
    attendanceAlerts: boolean;
  };
  email: {
    smtpHost: string;
    smtpPort: number;
    smtpUsername: string;
    smtpSsl: boolean;
    fromEmail: string;
    fromName: string;
  };
}

export function SystemSettingsPanel() {
  const [settings, setSettings] = useState<SystemSettings>({
    general: {
      systemName: 'نظام إدارة الشركات',
      systemLogo: '',
      defaultLanguage: 'ar',
      timezone: 'Asia/Riyadh',
      dateFormat: 'dd/MM/yyyy'
    },
    security: {
      sessionTimeout: 120,
      passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSymbols: false
      },
      maxLoginAttempts: 5,
      enableTwoFactor: false
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      documentExpiryDays: 30,
      salaryProcessingReminder: true,
      attendanceAlerts: true
    },
    email: {
      smtpHost: '',
      smtpPort: 587,
      smtpUsername: '',
      smtpSsl: true,
      fromEmail: '',
      fromName: 'نظام إدارة الشركات'
    }
  });
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('system_preferences')
        .select('preferences')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data?.preferences) {
        const preferences = data.preferences as Partial<SystemSettings>;
        setSettings(prevSettings => {
          const updatedSettings = { ...prevSettings };
          if (preferences.general) {
            updatedSettings.general = { ...updatedSettings.general, ...preferences.general };
          }
          if (preferences.security) {
            updatedSettings.security = { ...updatedSettings.security, ...preferences.security };
          }
          if (preferences.notifications) {
            updatedSettings.notifications = { ...updatedSettings.notifications, ...preferences.notifications };
          }
          if (preferences.email) {
            updatedSettings.email = { ...updatedSettings.email, ...preferences.email };
          }
          return updatedSettings;
        });
      }
    } catch (error) {
      console.error('خطأ في تحميل الإعدادات:', error);
      toast({
        title: 'خطأ في تحميل الإعدادات',
        description: 'حدث خطأ أثناء تحميل إعدادات النظام',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('system_preferences')
        .upsert({
          user_id: user.id,
          preferences: settings as any,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: 'تم حفظ الإعدادات',
        description: 'تم حفظ إعدادات النظام بنجاح',
      });
    } catch (error) {
      console.error('خطأ في حفظ الإعدادات:', error);
      toast({
        title: 'خطأ في حفظ الإعدادات',
        description: 'حدث خطأ أثناء حفظ إعدادات النظام',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const resetSettings = () => {
    if (confirm('هل أنت متأكد من إعادة تعيين جميع الإعدادات؟')) {
      loadSettings();
      toast({
        title: 'تم إعادة التعيين',
        description: 'تم إعادة تعيين الإعدادات إلى آخر نسخة محفوظة',
      });
    }
  };

  const updateSetting = (section: keyof SystemSettings, key: string, value: any) => {
    setSettings(prev => {
      const currentSection = prev[section] || {};
      return {
        ...prev,
        [section]: {
          ...currentSection,
          [key]: value
        }
      };
    });
  };

  const updateNestedSetting = (section: keyof SystemSettings, nestedKey: string, key: string, value: any) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      [section]: {
        ...prevSettings[section],
        [nestedKey]: {
          ...(prevSettings[section] as any)[nestedKey],
          [key]: value
        }
      }
    }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                إعدادات النظام
              </CardTitle>
              <CardDescription>
                إدارة الإعدادات العامة والأمان والإشعارات
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={resetSettings}>
                <RotateCcw className="h-4 w-4 mr-2" />
                إعادة تعيين
              </Button>
              <Button onClick={saveSettings} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="general" className="space-y-6">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="general" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                عام
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                الأمان
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                الإشعارات
              </TabsTrigger>
              <TabsTrigger value="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                البريد الإلكتروني
              </TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>الإعدادات العامة</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="systemName">اسم النظام</Label>
                      <Input
                        id="systemName"
                        value={settings.general.systemName}
                        onChange={(e) => updateSetting('general', 'systemName', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="defaultLanguage">اللغة الافتراضية</Label>
                      <Select 
                        value={settings.general.defaultLanguage} 
                        onValueChange={(value) => updateSetting('general', 'defaultLanguage', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ar">العربية</SelectItem>
                          <SelectItem value="en">English</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="timezone">المنطقة الزمنية</Label>
                      <Select 
                        value={settings.general.timezone} 
                        onValueChange={(value) => updateSetting('general', 'timezone', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Asia/Riyadh">آسيا/الرياض</SelectItem>
                          <SelectItem value="Asia/Dubai">آسيا/دبي</SelectItem>
                          <SelectItem value="Africa/Cairo">أفريقيا/القاهرة</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dateFormat">تنسيق التاريخ</Label>
                      <Select 
                        value={settings.general.dateFormat} 
                        onValueChange={(value) => updateSetting('general', 'dateFormat', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dd/MM/yyyy">يوم/شهر/سنة</SelectItem>
                          <SelectItem value="MM/dd/yyyy">شهر/يوم/سنة</SelectItem>
                          <SelectItem value="yyyy-MM-dd">سنة-شهر-يوم</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>إعدادات الأمان</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="sessionTimeout">مهلة انتهاء الجلسة (دقيقة)</Label>
                      <Input
                        id="sessionTimeout"
                        type="number"
                        value={settings.security.sessionTimeout}
                        onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="maxLoginAttempts">الحد الأقصى لمحاولات تسجيل الدخول</Label>
                      <Input
                        id="maxLoginAttempts"
                        type="number"
                        value={settings.security.maxLoginAttempts}
                        onChange={(e) => updateSetting('security', 'maxLoginAttempts', parseInt(e.target.value))}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label>سياسة كلمة المرور</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="minLength">الحد الأدنى للطول</Label>
                        <Input
                          id="minLength"
                          type="number"
                          value={settings.security.passwordPolicy.minLength}
                          onChange={(e) => updateNestedSetting('security', 'passwordPolicy', 'minLength', parseInt(e.target.value))}
                        />
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="requireUppercase">تتطلب أحرف كبيرة</Label>
                          <Switch
                            id="requireUppercase"
                            checked={settings.security.passwordPolicy.requireUppercase}
                            onCheckedChange={(checked) => updateNestedSetting('security', 'passwordPolicy', 'requireUppercase', checked)}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <Label htmlFor="requireNumbers">تتطلب أرقام</Label>
                          <Switch
                            id="requireNumbers"
                            checked={settings.security.passwordPolicy.requireNumbers}
                            onCheckedChange={(checked) => updateNestedSetting('security', 'passwordPolicy', 'requireNumbers', checked)}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <Label htmlFor="requireSymbols">تتطلب رموز</Label>
                          <Switch
                            id="requireSymbols"
                            checked={settings.security.passwordPolicy.requireSymbols}
                            onCheckedChange={(checked) => updateNestedSetting('security', 'passwordPolicy', 'requireSymbols', checked)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="enableTwoFactor">تفعيل المصادقة الثنائية</Label>
                    <Switch
                      id="enableTwoFactor"
                      checked={settings.security.enableTwoFactor}
                      onCheckedChange={(checked) => updateSetting('security', 'enableTwoFactor', checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>إعدادات الإشعارات</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="emailNotifications">إشعارات البريد الإلكتروني</Label>
                      <Switch
                        id="emailNotifications"
                        checked={settings.notifications.emailNotifications}
                        onCheckedChange={(checked) => updateSetting('notifications', 'emailNotifications', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="smsNotifications">إشعارات الرسائل النصية</Label>
                      <Switch
                        id="smsNotifications"
                        checked={settings.notifications.smsNotifications}
                        onCheckedChange={(checked) => updateSetting('notifications', 'smsNotifications', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="salaryProcessingReminder">تذكير معالجة الرواتب</Label>
                      <Switch
                        id="salaryProcessingReminder"
                        checked={settings.notifications.salaryProcessingReminder}
                        onCheckedChange={(checked) => updateSetting('notifications', 'salaryProcessingReminder', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="attendanceAlerts">تنبيهات الحضور</Label>
                      <Switch
                        id="attendanceAlerts"
                        checked={settings.notifications.attendanceAlerts}
                        onCheckedChange={(checked) => updateSetting('notifications', 'attendanceAlerts', checked)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="documentExpiryDays">عدد أيام تحذير انتهاء المستندات</Label>
                    <Input
                      id="documentExpiryDays"
                      type="number"
                      value={settings.notifications.documentExpiryDays}
                      onChange={(e) => updateSetting('notifications', 'documentExpiryDays', parseInt(e.target.value))}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="email" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>إعدادات البريد الإلكتروني</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="smtpHost">خادم SMTP</Label>
                      <Input
                        id="smtpHost"
                        value={settings.email.smtpHost}
                        onChange={(e) => updateSetting('email', 'smtpHost', e.target.value)}
                        placeholder="smtp.gmail.com"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="smtpPort">منفذ SMTP</Label>
                      <Input
                        id="smtpPort"
                        type="number"
                        value={settings.email.smtpPort}
                        onChange={(e) => updateSetting('email', 'smtpPort', parseInt(e.target.value))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="smtpUsername">اسم المستخدم</Label>
                      <Input
                        id="smtpUsername"
                        value={settings.email.smtpUsername}
                        onChange={(e) => updateSetting('email', 'smtpUsername', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="fromEmail">عنوان البريد الإلكتروني للإرسال</Label>
                      <Input
                        id="fromEmail"
                        type="email"
                        value={settings.email.fromEmail}
                        onChange={(e) => updateSetting('email', 'fromEmail', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="fromName">اسم المرسل</Label>
                      <Input
                        id="fromName"
                        value={settings.email.fromName}
                        onChange={(e) => updateSetting('email', 'fromName', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="smtpSsl">استخدام SSL/TLS</Label>
                    <Switch
                      id="smtpSsl"
                      checked={settings.email.smtpSsl}
                      onCheckedChange={(checked) => updateSetting('email', 'smtpSsl', checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}