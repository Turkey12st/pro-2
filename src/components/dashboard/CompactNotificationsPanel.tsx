import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Bell, 
  AlertTriangle, 
  FileText, 
  DollarSign,
  Calendar,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { differenceInDays } from 'date-fns';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { parseError } from '@/lib/errorHandler';

// تنظيف النص من البرمجيات الخبيثة
const sanitizeText = (text: string): string => {
  if (!text || typeof text !== 'string') return '';
  return text.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
             .replace(/[<>]/g, '');
};

// التحقق من صحة الإشعار
const validateNotification = (notification: any): boolean => {
  return notification && 
         typeof notification.id === 'string' &&
         typeof notification.title === 'string' &&
         typeof notification.description === 'string' &&
         ['high', 'medium', 'low'].includes(notification.priority);
};

// التحقق من صحة المستند
const validateDocument = (doc: any): boolean => {
  return doc && 
         typeof doc.id === 'string' &&
         typeof doc.title === 'string' &&
         typeof doc.expiry_date === 'string' &&
         new Date(doc.expiry_date).toString() !== 'Invalid Date';
};

export function CompactNotificationsPanel() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // جلب الإشعارات مع معالجة الأخطاء المحسنة
  const { 
    data: notifications, 
    error: notificationsError,
    isLoading: isLoadingNotifications,
    refetch: refetchNotifications
  } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('id, title, description, priority, created_at')
        .order('created_at', { ascending: false })
        .limit(2);
      
      if (error) {
        console.error('Error fetching notifications:', parseError(error));
        return [];
      }
      
      return data?.filter(validateNotification).map(notification => ({
        ...notification,
        title: sanitizeText(notification.title),
        description: sanitizeText(notification.description)
      })) || [];
    },
    retry: 2,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // جلب المستندات المنتهية مع معالجة الأخطاء المحسنة
  const { 
    data: expiringDocs, 
    error: docsError,
    isLoading: isLoadingDocs,
    refetch: refetchDocs
  } = useQuery({
    queryKey: ['expiring-documents'],
    queryFn: async () => {
      const today = new Date();
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(today.getDate() + 30);

      const { data, error } = await supabase
        .from("company_documents")
        .select("id, title, expiry_date")
        .lte("expiry_date", thirtyDaysFromNow.toISOString().split("T")[0])
        .gte("expiry_date", today.toISOString().split("T")[0])
        .order("expiry_date", { ascending: true })
        .limit(2);

      if (error) {
        console.error('Error fetching documents:', parseError(error));
        return [];
      }

      return data?.filter(validateDocument).map(doc => ({
        ...doc,
        title: sanitizeText(doc.title),
        days_remaining: differenceInDays(new Date(doc.expiry_date), today)
      })) || [];
    },
    retry: 2,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // التنقل الآمن
  const handleSecureNavigation = (path: string) => {
    if (typeof path === 'string' && path.startsWith('/')) {
      navigate(path);
    }
  };

  // إعادة تحميل البيانات
  const handleRefresh = () => {
    refetchNotifications();
    refetchDocs();
  };

  // بيانات تنبيه الرواتب
  const salaryAlert = {
    paymentDate: '2024-01-30',
    amount: 85000,
    daysRemaining: differenceInDays(new Date('2024-01-30'), new Date())
  };

  // عرض خطأ في التحميل
  const hasError = notificationsError || docsError;
  const isLoading = isLoadingNotifications || isLoadingDocs;

  if (hasError && !notifications?.length && !expiringDocs?.length) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm col-span-full">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <span>تعذر تحميل بعض البيانات</span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4 ml-1" />
                إعادة المحاولة
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* التنبيهات المهمة مع تنبيه الرواتب */}
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <AlertTriangle className="h-3 w-3 text-muted-foreground" />
            التنبيهات المهمة
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-2">
          {/* تنبيه الرواتب */}
          <div className="flex items-center justify-between p-2 bg-amber-50 dark:bg-amber-950/20 rounded text-xs border border-amber-200 dark:border-amber-800">
            <div className="flex items-center gap-2">
              <DollarSign className="h-3 w-3 text-amber-600" />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">راتب شهري مستحق</p>
                <p className="text-muted-foreground">
                  متبقي {Math.abs(salaryAlert.daysRemaining)} {Math.abs(salaryAlert.daysRemaining) === 1 ? 'يوم' : 'أيام'}
                </p>
              </div>
            </div>
            <Badge variant={salaryAlert.daysRemaining <= 3 ? 'destructive' : 'secondary'} className="text-xs">
              {salaryAlert.daysRemaining <= 0 ? 'مستحق' : 'قريباً'}
            </Badge>
          </div>
          
          {/* باقي التنبيهات */}
          <div className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-950/20 rounded text-xs border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2">
              <Bell className="h-3 w-3 text-blue-600" />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">مراجعة عقود الموظفين</p>
                <p className="text-muted-foreground">مطلوب خلال أسبوع</p>
              </div>
            </div>
            <Badge variant="secondary" className="text-xs">جديد</Badge>
          </div>

          <Button 
            size="sm" 
            variant="outline" 
            className="w-full h-7 text-xs"
            onClick={() => handleSecureNavigation('/hr')}
          >
            <ChevronRight className="h-3 w-3 mr-1" />
            عرض جميع التنبيهات
          </Button>
        </CardContent>
      </Card>

      {/* المستندات المنتهية */}
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <FileText className="h-3 w-3 text-destructive" />
            مستندات منتهية
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-2">
          {isLoadingDocs ? (
            <div className="flex justify-center p-4">
              <LoadingSpinner size="sm" />
            </div>
          ) : expiringDocs && expiringDocs.length > 0 ? (
            expiringDocs.slice(0, 2).map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-2 bg-red-50 dark:bg-red-950/20 rounded text-xs border border-red-200 dark:border-red-800">
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{doc.title}</p>
                  <p className="text-muted-foreground">
                    {doc.days_remaining <= 0 ? 'منتهي' : `${doc.days_remaining} أيام`}
                  </p>
                </div>
                <AlertTriangle className="h-3 w-3 text-destructive ml-1" />
              </div>
            ))
          ) : (
            <p className="text-xs text-muted-foreground text-center py-2">
              لا توجد مستندات منتهية
            </p>
          )}
          <Button 
            size="sm" 
            variant="outline" 
            className="w-full h-7 text-xs"
            onClick={() => handleSecureNavigation('/documents')}
          >
            <ChevronRight className="h-3 w-3 mr-1" />
            إدارة المستندات
          </Button>
        </CardContent>
      </Card>

      {/* إشعارات النظام */}
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Bell className="h-3 w-3 text-blue-600" />
            إشعارات النظام
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-2">
          {isLoadingNotifications ? (
            <div className="flex justify-center p-4">
              <LoadingSpinner size="sm" />
            </div>
          ) : notifications && notifications.length > 0 ? (
            notifications.slice(0, 2).map((notification) => (
              <div key={notification.id} className="p-2 bg-blue-50 dark:bg-blue-950/20 rounded text-xs border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-2">
                  <AlertTriangle className={`h-3 w-3 mt-0.5 ${
                    notification.priority === 'high' ? 'text-destructive' : 
                    notification.priority === 'medium' ? 'text-amber-500' : 
                    'text-blue-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{notification.title}</p>
                    <p className="text-muted-foreground line-clamp-1">
                      {notification.description}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-muted-foreground text-center py-2">
              لا توجد إشعارات جديدة
            </p>
          )}
        </CardContent>
      </Card>

      {/* معلومات إضافية */}
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Calendar className="h-3 w-3 text-muted-foreground" />
            تذكيرات اليوم
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-2">
          <div className="p-2 bg-green-50 dark:bg-green-950/20 rounded text-xs border border-green-200 dark:border-green-800">
            <div className="flex items-start gap-2">
              <Calendar className="h-3 w-3 text-green-600 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="font-medium">اجتماع فريق العمل</p>
                <p className="text-muted-foreground">الساعة 10:00 صباحاً</p>
              </div>
            </div>
          </div>
          
          <div className="p-2 bg-purple-50 dark:bg-purple-950/20 rounded text-xs border border-purple-200 dark:border-purple-800">
            <div className="flex items-start gap-2">
              <Bell className="h-3 w-3 text-purple-600 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="font-medium">مراجعة التقارير الشهرية</p>
                <p className="text-muted-foreground">مستحق اليوم</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
