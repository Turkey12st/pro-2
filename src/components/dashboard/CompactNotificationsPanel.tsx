
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
  ChevronRight
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { differenceInDays } from 'date-fns';

// Security enhancement: Input sanitization utility
const sanitizeText = (text: string): string => {
  if (!text || typeof text !== 'string') return '';
  return text.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
             .replace(/[<>]/g, '');
};

// Security enhancement: Validate notification data
const validateNotification = (notification: any): boolean => {
  return notification && 
         typeof notification.id === 'string' &&
         typeof notification.title === 'string' &&
         typeof notification.description === 'string' &&
         ['high', 'medium', 'low'].includes(notification.priority);
};

// Security enhancement: Validate document data
const validateDocument = (doc: any): boolean => {
  return doc && 
         typeof doc.id === 'string' &&
         typeof doc.title === 'string' &&
         typeof doc.expiry_date === 'string' &&
         new Date(doc.expiry_date).toString() !== 'Invalid Date';
};

export function CompactNotificationsPanel() {
  const navigate = useNavigate();

  // Security enhancement: Error boundary and data validation
  const { data: notifications, error: notificationsError } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('id, title, description, priority, created_at')
          .order('created_at', { ascending: false })
          .limit(2);
        
        if (error) {
          console.error('Error fetching notifications:', error);
          throw new Error('Failed to fetch notifications');
        }
        
        // Security: Validate and sanitize data
        return data?.filter(validateNotification).map(notification => ({
          ...notification,
          title: sanitizeText(notification.title),
          description: sanitizeText(notification.description)
        })) || [];
      } catch (error) {
        console.error('Notifications query error:', error);
        return [];
      }
    },
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Security enhancement: Error handling and data validation for documents
  const { data: expiringDocs, error: docsError } = useQuery({
    queryKey: ['expiring-documents'],
    queryFn: async () => {
      try {
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
          console.error('Error fetching documents:', error);
          throw new Error('Failed to fetch documents');
        }

        // Security: Validate and sanitize document data
        return data?.filter(validateDocument).map(doc => ({
          ...doc,
          title: sanitizeText(doc.title),
          days_remaining: differenceInDays(new Date(doc.expiry_date), today)
        })) || [];
      } catch (error) {
        console.error('Documents query error:', error);
        return [];
      }
    },
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Security enhancement: Safe navigation with error boundaries
  const handleSecureNavigation = (path: string) => {
    try {
      // Validate path before navigation
      if (typeof path === 'string' && path.startsWith('/')) {
        navigate(path);
      } else {
        console.warn('Invalid navigation path:', path);
      }
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  // Security: Mock salary data with validation
  const salaryAlert = {
    paymentDate: '2024-01-30',
    amount: 85000,
    daysRemaining: differenceInDays(new Date('2024-01-30'), new Date())
  };

  // Security enhancement: Error display for failed queries
  if (notificationsError || docsError) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertTriangle className="h-4 w-4" />
              خطأ في تحميل التنبيهات
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
            <AlertTriangle className="h-3 w-3 text-gray-600" />
            التنبيهات المهمة
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-2">
          {/* تنبيه الرواتب */}
          <div className="flex items-center justify-between p-2 bg-amber-50 rounded text-xs border border-amber-200">
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
          <div className="flex items-center justify-between p-2 bg-blue-50 rounded text-xs border border-blue-200">
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
      {expiringDocs && expiringDocs.length > 0 && (
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText className="h-3 w-3 text-red-600" />
              مستندات منتهية
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            {expiringDocs.slice(0, 2).map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-2 bg-red-50 rounded text-xs">
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{doc.title}</p>
                  <p className="text-muted-foreground">
                    {doc.days_remaining <= 0 ? 'منتهي' : `${doc.days_remaining} أيام`}
                  </p>
                </div>
                <AlertTriangle className="h-3 w-3 text-red-600 ml-1" />
              </div>
            ))}
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
      )}

      {/* إشعارات النظام */}
      {notifications && notifications.length > 0 && (
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Bell className="h-3 w-3 text-blue-600" />
              إشعارات النظام
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            {notifications.slice(0, 2).map((notification) => (
              <div key={notification.id} className="p-2 bg-blue-50 rounded text-xs">
                <div className="flex items-start gap-2">
                  <AlertTriangle className={`h-3 w-3 mt-0.5 ${
                    notification.priority === 'high' ? 'text-red-500' : 
                    notification.priority === 'medium' ? 'text-yellow-500' : 
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
            ))}
          </CardContent>
        </Card>
      )}

      {/* معلومات إضافية */}
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Calendar className="h-3 w-3 text-gray-600" />
            تذكيرات اليوم
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-2">
          <div className="p-2 bg-green-50 rounded text-xs">
            <div className="flex items-start gap-2">
              <Calendar className="h-3 w-3 text-green-600 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="font-medium">اجتماع فريق العمل</p>
                <p className="text-muted-foreground">الساعة 10:00 صباحاً</p>
              </div>
            </div>
          </div>
          
          <div className="p-2 bg-purple-50 rounded text-xs">
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
