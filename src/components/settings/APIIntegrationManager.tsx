import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Webhook, 
  Settings, 
  Plus, 
  Trash2, 
  TestTube, 
  Activity,
  ExternalLink,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { APIIntegrationService, APIIntegrationConfig } from '@/services/apiIntegrationService';
import { useToast } from '@/hooks/use-toast';

export function APIIntegrationManager() {
  const [integrations, setIntegrations] = useState<APIIntegrationConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [testingIntegration, setTestingIntegration] = useState<string | null>(null);
  const { toast } = useToast();

  const [newIntegration, setNewIntegration] = useState({
    name: '',
    type: 'webhook' as const,
    endpoint: '',
    apiKey: '',
    headers: '{}',
    events: [] as string[],
    isActive: true,
    configuration: '{}'
  });

  const availableEvents = [
    'employee_create',
    'employee_update', 
    'employee_delete',
    'salary_processed',
    'project_create',
    'project_update',
    'project_complete',
    'financial_transaction',
    'attendance_recorded',
    'document_uploaded'
  ];

  const loadIntegrations = async () => {
    try {
      setLoading(true);
      const data = await APIIntegrationService.getIntegrations();
      setIntegrations(data);
    } catch (error) {
      toast({
        title: 'خطأ في تحميل التكاملات',
        description: 'حدث خطأ أثناء تحميل إعدادات التكامل',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddIntegration = async () => {
    try {
      if (!newIntegration.name || !newIntegration.endpoint) {
        toast({
          title: 'بيانات ناقصة',
          description: 'يرجى إدخال اسم التكامل والـ endpoint',
          variant: 'destructive',
        });
        return;
      }

      const id = await APIIntegrationService.saveIntegration({
        ...newIntegration,
        headers: newIntegration.headers ? JSON.parse(newIntegration.headers) : {},
        configuration: newIntegration.configuration ? JSON.parse(newIntegration.configuration) : {}
      });

      toast({
        title: 'تم إضافة التكامل',
        description: 'تم حفظ إعدادات التكامل بنجاح',
      });

      setNewIntegration({
        name: '',
        type: 'webhook',
        endpoint: '',
        apiKey: '',
        headers: '{}',
        events: [],
        isActive: true,
        configuration: '{}'
      });
      setShowAddForm(false);
      loadIntegrations();
    } catch (error) {
      toast({
        title: 'خطأ في إضافة التكامل',
        description: 'حدث خطأ أثناء حفظ التكامل',
        variant: 'destructive',
      });
    }
  };

  const handleTestIntegration = async (integration: APIIntegrationConfig) => {
    try {
      setTestingIntegration(integration.id);
      const success = await APIIntegrationService.testIntegration(integration);
      
      if (success) {
        toast({
          title: 'نجح الاختبار',
          description: `تم الاتصال بنجاح مع ${integration.name}`,
        });
      } else {
        toast({
          title: 'فشل الاختبار',
          description: `فشل الاتصال مع ${integration.name}`,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'خطأ في الاختبار',
        description: 'حدث خطأ أثناء اختبار التكامل',
        variant: 'destructive',
      });
    } finally {
      setTestingIntegration(null);
    }
  };

  const setupQuickIntegration = async (type: 'n8n' | 'zapier') => {
    const webhookUrl = prompt(`أدخل رابط الـ Webhook الخاص بـ ${type.toUpperCase()}:`);
    if (!webhookUrl) return;

    try {
      let id: string;
      const defaultEvents = ['employee_create', 'salary_processed', 'project_update'];
      
      if (type === 'n8n') {
        id = await APIIntegrationService.setupN8NWebhook(webhookUrl, defaultEvents);
      } else {
        id = await APIIntegrationService.setupZapierWebhook(webhookUrl, defaultEvents);
      }

      toast({
        title: 'تم إعداد التكامل',
        description: `تم إعداد ${type.toUpperCase()} بنجاح`,
      });

      loadIntegrations();
    } catch (error) {
      toast({
        title: 'خطأ في الإعداد',
        description: `فشل إعداد ${type.toUpperCase()}`,
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    loadIntegrations();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>جاري تحميل إعدادات التكامل...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            إدارة تكاملات API
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <Button onClick={() => setupQuickIntegration('n8n')} className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4" />
              إعداد N8N سريع
            </Button>
            <Button onClick={() => setupQuickIntegration('zapier')} variant="outline" className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4" />
              إعداد Zapier سريع
            </Button>
            <Button onClick={() => setShowAddForm(true)} variant="outline" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              إضافة تكامل مخصص
            </Button>
          </div>

          {showAddForm && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>إضافة تكامل جديد</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="integration-name">اسم التكامل</Label>
                    <Input
                      id="integration-name"
                      value={newIntegration.name}
                      onChange={(e) => setNewIntegration({...newIntegration, name: e.target.value})}
                      placeholder="مثل: N8N Automation"
                    />
                  </div>
                  <div>
                    <Label htmlFor="integration-type">نوع التكامل</Label>
                    <Select value={newIntegration.type} onValueChange={(value: any) => setNewIntegration({...newIntegration, type: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="webhook">Webhook</SelectItem>
                        <SelectItem value="rest_api">REST API</SelectItem>
                        <SelectItem value="n8n">N8N</SelectItem>
                        <SelectItem value="zapier">Zapier</SelectItem>
                        <SelectItem value="custom">مخصص</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="endpoint">رابط الـ Endpoint</Label>
                  <Input
                    id="endpoint"
                    value={newIntegration.endpoint}
                    onChange={(e) => setNewIntegration({...newIntegration, endpoint: e.target.value})}
                    placeholder="https://example.com/webhook"
                  />
                </div>

                <div>
                  <Label htmlFor="api-key">API Key (اختياري)</Label>
                  <Input
                    id="api-key"
                    type="password"
                    value={newIntegration.apiKey}
                    onChange={(e) => setNewIntegration({...newIntegration, apiKey: e.target.value})}
                    placeholder="Bearer token أو API key"
                  />
                </div>

                <div>
                  <Label>الأحداث المراد مزامنتها</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {availableEvents.map(event => (
                      <div key={event} className="flex items-center space-x-2">
                        <Checkbox
                          id={event}
                          checked={newIntegration.events.includes(event)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setNewIntegration({
                                ...newIntegration,
                                events: [...newIntegration.events, event]
                              });
                            } else {
                              setNewIntegration({
                                ...newIntegration,
                                events: newIntegration.events.filter(e => e !== event)
                              });
                            }
                          }}
                        />
                        <Label htmlFor={event} className="text-sm">{event}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={newIntegration.isActive}
                    onCheckedChange={(checked) => setNewIntegration({...newIntegration, isActive: checked})}
                  />
                  <Label>تفعيل التكامل</Label>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleAddIntegration}>
                    حفظ التكامل
                  </Button>
                  <Button variant="outline" onClick={() => setShowAddForm(false)}>
                    إلغاء
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-4">
            {integrations.length === 0 ? (
              <div className="text-center py-8">
                <Webhook className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">لا توجد تكاملات API مُعدة حالياً</p>
              </div>
            ) : (
              integrations.map(integration => (
                <Card key={integration.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          {integration.isActive ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                          <h3 className="font-medium">{integration.name}</h3>
                        </div>
                        <Badge variant="outline">{integration.type}</Badge>
                        <div className="text-sm text-gray-500">
                          {integration.events.length} أحداث
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTestIntegration(integration)}
                          disabled={testingIntegration === integration.id}
                        >
                          {testingIntegration === integration.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <TestTube className="h-4 w-4" />
                          )}
                          اختبار
                        </Button>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="mt-4 text-sm text-gray-600">
                      <p>الـ Endpoint: {integration.endpoint}</p>
                      {integration.lastSync && (
                        <p>آخر مزامنة: {new Date(integration.lastSync).toLocaleString('ar-SA')}</p>
                      )}
                    </div>

                    <div className="mt-3 flex flex-wrap gap-1">
                      {integration.events.map(event => (
                        <Badge key={event} variant="secondary" className="text-xs">
                          {event}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}