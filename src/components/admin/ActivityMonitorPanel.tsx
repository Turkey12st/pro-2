import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Activity, 
  Users, 
  Eye, 
  RefreshCw,
  Filter,
  Calendar,
  Clock
} from 'lucide-react';

interface SystemActivity {
  id: string;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id: string;
  metadata: any;
  ip_address?: string | null;
  user_agent?: string | null;
  created_at: string;
}

interface ActivityStats {
  totalActivities: number;
  uniqueUsers: number;
  topActions: { action: string; count: number }[];
  activityByHour: { hour: number; count: number }[];
}

export function ActivityMonitorPanel() {
  const [activities, setActivities] = useState<SystemActivity[]>([]);
  const [stats, setStats] = useState<ActivityStats>({
    totalActivities: 0,
    uniqueUsers: 0,
    topActions: [],
    activityByHour: []
  });
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('24h');
  const [actionFilter, setActionFilter] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    loadActivityData();
  }, [timeFilter, actionFilter]);

  const loadActivityData = async () => {
    try {
      setLoading(true);
      
      // حساب نطاق التاريخ
      const now = new Date();
      const timeRanges = {
        '1h': new Date(now.getTime() - 60 * 60 * 1000),
        '24h': new Date(now.getTime() - 24 * 60 * 60 * 1000),
        '7d': new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        '30d': new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      };
      
      const fromDate = timeRanges[timeFilter as keyof typeof timeRanges];

      // بناء الاستعلام
      let query = supabase
        .from('system_activity')
        .select('*')
        .gte('created_at', fromDate.toISOString())
        .order('created_at', { ascending: false })
        .limit(200);

      // تطبيق فلتر الإجراء
      if (actionFilter !== 'all') {
        query = query.eq('action', actionFilter);
      }

      const { data: activitiesData, error } = await query;

      if (error) throw error;

      setActivities((activitiesData || []).map(activity => ({
        ...activity,
        ip_address: activity.ip_address as string | null,
        user_agent: activity.user_agent as string | null
      })));

      // حساب الإحصائيات
      const totalActivities = activitiesData?.length || 0;
      const uniqueUsers = new Set(activitiesData?.map(a => a.user_id)).size;
      
      // أهم الإجراءات
      const actionCounts = activitiesData?.reduce((acc, activity) => {
        acc[activity.action] = (acc[activity.action] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};
      
      const topActions = Object.entries(actionCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([action, count]) => ({ action, count }));

      // النشاط بالساعة
      const activityByHour = Array.from({ length: 24 }, (_, hour) => {
        const count = activitiesData?.filter(activity => {
          const activityHour = new Date(activity.created_at).getHours();
          return activityHour === hour;
        }).length || 0;
        return { hour, count };
      });

      setStats({
        totalActivities,
        uniqueUsers,
        topActions,
        activityByHour
      });

    } catch (error) {
      console.error('خطأ في تحميل بيانات النشاط:', error);
      toast({
        title: 'خطأ في تحميل بيانات النشاط',
        description: 'حدث خطأ أثناء تحميل بيانات النشاط',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getActionDisplayName = (action: string) => {
    const actionNames = {
      'INSERT': 'إضافة',
      'UPDATE': 'تحديث',
      'DELETE': 'حذف',
      'SELECT': 'استعلام',
      'login': 'تسجيل دخول',
      'logout': 'تسجيل خروج',
      'export': 'تصدير',
      'import': 'استيراد'
    };
    return actionNames[action as keyof typeof actionNames] || action;
  };

  const getActionBadgeVariant = (action: string) => {
    const variants = {
      'INSERT': 'default',
      'UPDATE': 'secondary',
      'DELETE': 'destructive',
      'SELECT': 'outline',
      'login': 'default',
      'logout': 'secondary'
    };
    return variants[action as keyof typeof variants] || 'outline' as const;
  };

  const getResourceDisplayName = (resourceType: string) => {
    const resourceNames = {
      'employees': 'الموظفين',
      'user_roles': 'أدوار المستخدمين',
      'attendance_records': 'سجلات الحضور',
      'salary_records': 'سجلات الرواتب',
      'projects': 'المشاريع',
      'clients': 'العملاء'
    };
    return resourceNames[resourceType as keyof typeof resourceNames] || resourceType;
  };

  const uniqueActions = [...new Set(activities.map(a => a.action))];

  return (
    <div className="space-y-6">
      {/* إحصائيات النشاط */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الأنشطة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalActivities}</div>
            <p className="text-xs text-muted-foreground">
              في آخر {timeFilter === '1h' ? 'ساعة' : timeFilter === '24h' ? '24 ساعة' : timeFilter === '7d' ? '7 أيام' : '30 يوم'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">المستخدمين النشطين</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.uniqueUsers}</div>
            <p className="text-xs text-muted-foreground">مستخدمين مختلفين</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">أكثر الإجراءات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.topActions[0]?.action ? getActionDisplayName(stats.topActions[0].action) : '-'}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.topActions[0]?.count || 0} مرة
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">الساعة الأكثر نشاطاً</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.activityByHour.sort((a, b) => b.count - a.count)[0]?.hour || 0}:00
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.activityByHour.sort((a, b) => b.count - a.count)[0]?.count || 0} نشاط
            </p>
          </CardContent>
        </Card>
      </div>

      {/* سجل النشاط */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                مراقبة نشاط النظام
              </CardTitle>
              <CardDescription>
                تتبع جميع أنشطة المستخدمين والعمليات في النظام
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">آخر ساعة</SelectItem>
                  <SelectItem value="24h">آخر 24 ساعة</SelectItem>
                  <SelectItem value="7d">آخر 7 أيام</SelectItem>
                  <SelectItem value="30d">آخر 30 يوم</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الإجراءات</SelectItem>
                  {uniqueActions.map((action) => (
                    <SelectItem key={action} value={action}>
                      {getActionDisplayName(action)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button variant="outline" size="sm" onClick={loadActivityData}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>التاريخ والوقت</TableHead>
                  <TableHead>المستخدم</TableHead>
                  <TableHead>الإجراء</TableHead>
                  <TableHead>المورد</TableHead>
                  <TableHead>عنوان IP</TableHead>
                  <TableHead>التفاصيل</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      جاري التحميل...
                    </TableCell>
                  </TableRow>
                ) : activities.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      لا توجد أنشطة
                    </TableCell>
                  </TableRow>
                ) : (
                  activities.map((activity) => (
                    <TableRow key={activity.id}>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4" />
                          {new Date(activity.created_at).toLocaleString('ar-SA')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <div className="text-sm">
                            {activity.user_id ? 
                              activity.user_id.substring(0, 8) + '...' : 
                              'نظام'
                            }
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getActionBadgeVariant(activity.action)}>
                          {getActionDisplayName(activity.action)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {getResourceDisplayName(activity.resource_type)}
                        </div>
                        {activity.resource_id && (
                          <div className="text-xs text-muted-foreground">
                            ID: {activity.resource_id.substring(0, 8)}...
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          {activity.ip_address || '-'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* أهم الإجراءات */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            أهم الإجراءات
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.topActions.map((actionStat, index) => (
              <div key={actionStat.action} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                    {index + 1}
                  </div>
                  <span className="text-sm font-medium">
                    {getActionDisplayName(actionStat.action)}
                  </span>
                </div>
                <Badge variant="secondary">
                  {actionStat.count} مرة
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}