
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

export function CompactNotificationsPanel() {
  const navigate = useNavigate();

  // جلب التنبيهات العامة
  const { data: notifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(2);
      
      if (error) throw error;
      return data;
    }
  });

  // جلب المستندات المنتهية
  const { data: expiringDocs } = useQuery({
    queryKey: ['expiring-documents'],
    queryFn: async () => {
      const today = new Date();
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(today.getDate() + 30);

      const { data, error } = await supabase
        .from("company_documents")
        .select("*")
        .lte("expiry_date", thirtyDaysFromNow.toISOString().split("T")[0])
        .gte("expiry_date", today.toISOString().split("T")[0])
        .order("expiry_date", { ascending: true })
        .limit(2);

      if (error) throw error;
      return data?.map(doc => ({
        ...doc,
        days_remaining: differenceInDays(new Date(doc.expiry_date), today)
      }));
    }
  });

  // تنبيهات الرواتب (بيانات وهمية للمثال)
  const salaryAlert = {
    paymentDate: '2024-01-30',
    amount: 85000,
    daysRemaining: differenceInDays(new Date('2024-01-30'), new Date())
  };

  return (
    <div className="space-y-3">
      {/* التنبيهات المهمة مع تنبيه الرواتب */}
      <Card className="border-l-4 border-l-gray-500">
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
            onClick={() => navigate('/hr')}
          >
            <ChevronRight className="h-3 w-3 mr-1" />
            عرض جميع التنبيهات
          </Button>
        </CardContent>
      </Card>

      {/* المستندات المنتهية */}
      {expiringDocs && expiringDocs.length > 0 && (
        <Card className="border-l-4 border-l-red-500">
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
              onClick={() => navigate('/documents')}
            >
              <ChevronRight className="h-3 w-3 mr-1" />
              إدارة المستندات
            </Button>
          </CardContent>
        </Card>
      )}

      {/* التنبيهات العامة */}
      {notifications && notifications.length > 0 && (
        <Card className="border-l-4 border-l-blue-500">
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
    </div>
  );
}
