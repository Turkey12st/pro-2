import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Download,
  RefreshCw
} from 'lucide-react';

interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  table_name?: string;
  record_id?: string;
  new_values?: any;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

interface SecurityMetrics {
  totalEvents: number;
  failedAttempts: number;
  suspiciousActivities: number;
  lastScan: string;
}

export function SecurityAuditPanel() {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    totalEvents: 0,
    failedAttempts: 0,
    suspiciousActivities: 0,
    lastScan: new Date().toISOString()
  });
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('24h');
  const { toast } = useToast();

  useEffect(() => {
    loadAuditData();
  }, [timeFilter]);

  const loadAuditData = async () => {
    try {
      setLoading(true);
      
      // حساب نطاق التاريخ بناءً على الفلتر
      const now = new Date();
      const timeRanges = {
        '1h': new Date(now.getTime() - 60 * 60 * 1000),
        '24h': new Date(now.getTime() - 24 * 60 * 60 * 1000),
        '7d': new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        '30d': new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      };
      
      const fromDate = timeRanges[timeFilter as keyof typeof timeRanges];

      // جلب سجلات التدقيق
      const { data: logs, error: logsError } = await supabase
        .from('security_audit_log')
        .select('*')
        .gte('created_at', fromDate.toISOString())
        .order('created_at', { ascending: false })
        .limit(100);

      if (logsError) throw logsError;

      const formattedLogs = (logs || []).map(log => ({
        ...log,
        ip_address: log.ip_address ? String(log.ip_address) : 'غير محدد'
      }));
      
      setAuditLogs(formattedLogs);

      // حساب المقاييس
      const totalEvents = logs?.length || 0;
      const failedAttempts = logs?.filter(log => 
        log.new_values && 
        typeof log.new_values === 'object' && 
        'success' in log.new_values && 
        log.new_values.success === false
      ).length || 0;

      const suspiciousActivities = logs?.filter(log => 
        log.action.includes('suspicious') || 
        log.action.includes('failed') ||
        log.action.includes('unauthorized')
      ).length || 0;

      setMetrics({
        totalEvents,
        failedAttempts,
        suspiciousActivities,
        lastScan: new Date().toISOString()
      });

    } catch (error) {
      console.error('خطأ في تحميل بيانات التدقيق:', error);
      toast({
        title: 'خطأ في تحميل بيانات التدقيق',
        description: 'حدث خطأ أثناء تحميل سجلات الأمان',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const exportAuditReport = async () => {
    try {
      const csvContent = [
        ['التاريخ', 'المستخدم', 'الإجراء', 'الجدول', 'النتيجة'].join(','),
        ...auditLogs.map(log => [
          new Date(log.created_at).toLocaleString('ar-SA'),
          log.user_id || 'نظام',
          log.action,
          log.table_name || '',
          log.new_values?.success !== false ? 'نجح' : 'فشل'
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `security-audit-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();

      toast({
        title: 'تم تصدير التقرير',
        description: 'تم تصدير تقرير التدقيق الأمني بنجاح',
      });
    } catch (error) {
      toast({
        title: 'خطأ في التصدير',
        description: 'حدث خطأ أثناء تصدير التقرير',
        variant: 'destructive',
      });
    }
  };

  const getActionBadge = (action: string, success?: boolean) => {
    if (success === false) {
      return <Badge variant="destructive" className="flex items-center gap-1">
        <XCircle className="h-3 w-3" />
        فشل
      </Badge>;
    }
    
    if (action.includes('suspicious')) {
      return <Badge variant="destructive" className="flex items-center gap-1">
        <AlertTriangle className="h-3 w-3" />
        مشبوه
      </Badge>;
    }
    
    if (action.includes('login') || action.includes('auth')) {
      return <Badge variant="default" className="flex items-center gap-1">
        <Shield className="h-3 w-3" />
        مصادقة
      </Badge>;
    }
    
    return <Badge variant="secondary" className="flex items-center gap-1">
      <CheckCircle className="h-3 w-3" />
      عادي
    </Badge>;
  };

  const getActionDisplayName = (action: string) => {
    const actionNames = {
      'INSERT': 'إضافة',
      'UPDATE': 'تحديث',
      'DELETE': 'حذف',
      'SELECT': 'استعلام',
      'login': 'تسجيل دخول',
      'logout': 'تسجيل خروج',
      'suspicious_activity_detected': 'نشاط مشبوه',
      'failed_login': 'فشل في تسجيل الدخول',
      'unauthorized_access': 'وصول غير مصرح'
    };
    return actionNames[action as keyof typeof actionNames] || action;
  };

  return (
    <div className="space-y-6">
      {/* مقاييس الأمان */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الأحداث</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalEvents}</div>
            <p className="text-xs text-muted-foreground">
              في آخر {timeFilter === '1h' ? 'ساعة' : timeFilter === '24h' ? '24 ساعة' : timeFilter === '7d' ? '7 أيام' : '30 يوم'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">المحاولات الفاشلة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{metrics.failedAttempts}</div>
            <p className="text-xs text-muted-foreground">تحتاج إلى مراجعة</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">أنشطة مشبوهة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{metrics.suspiciousActivities}</div>
            <p className="text-xs text-muted-foreground">تحت المراقبة</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">آخر فحص</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold">
              {new Date(metrics.lastScan).toLocaleTimeString('ar-SA')}
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              منذ دقائق
            </p>
          </CardContent>
        </Card>
      </div>

      {/* سجلات التدقيق */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                سجلات التدقيق الأمني
              </CardTitle>
              <CardDescription>
                تتبع جميع الأنشطة والأحداث الأمنية في النظام
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
              <Button variant="outline" size="sm" onClick={loadAuditData}>
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={exportAuditReport}>
                <Download className="h-4 w-4" />
                تصدير
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
                  <TableHead>الجدول</TableHead>
                  <TableHead>عنوان IP</TableHead>
                  <TableHead>الحالة</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      جاري التحميل...
                    </TableCell>
                  </TableRow>
                ) : auditLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      لا توجد سجلات
                    </TableCell>
                  </TableRow>
                ) : (
                  auditLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(log.created_at).toLocaleString('ar-SA')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {log.user_id ? log.user_id.substring(0, 8) + '...' : 'نظام'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {getActionDisplayName(log.action)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          {log.table_name || '-'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          {log.ip_address || '-'}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getActionBadge(log.action, log.new_values?.success)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}