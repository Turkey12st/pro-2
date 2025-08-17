import { supabase } from '@/integrations/supabase/client';

export interface APIIntegrationConfig {
  id: string;
  name: string;
  type: 'webhook' | 'rest_api' | 'n8n' | 'zapier' | 'custom';
  endpoint: string;
  apiKey?: string;
  headers?: Record<string, string>;
  isActive: boolean;
  events: string[];
  lastSync?: string;
  configuration: Record<string, any>;
}

export interface DataSyncPayload {
  event: string;
  timestamp: string;
  data: any;
  source: string;
  metadata?: Record<string, any>;
}

export class APIIntegrationService {
  // حفظ إعداد التكامل
  static async saveIntegration(config: Omit<APIIntegrationConfig, 'id'>): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('api_integrations')
        .insert({
          name: config.name,
          type: config.type,
          endpoint: config.endpoint,
          api_key_encrypted: config.apiKey,
          headers: config.headers || {},
          is_active: config.isActive,
          events: config.events,
          configuration: config.configuration
        })
        .select()
        .single();

      if (error) throw error;
      return data.id;
    } catch (error) {
      console.error('خطأ في حفظ إعدادات التكامل:', error);
      throw error;
    }
  }

  // جلب جميع التكاملات
  static async getIntegrations(): Promise<APIIntegrationConfig[]> {
    try {
      const { data, error } = await supabase
        .from('api_integrations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map(item => ({
        id: item.id,
        name: item.name,
        type: item.type,
        endpoint: item.endpoint,
        apiKey: item.api_key_encrypted,
        headers: item.headers,
        isActive: item.is_active,
        events: item.events,
        lastSync: item.last_sync,
        configuration: item.configuration
      }));
    } catch (error) {
      console.error('خطأ في جلب التكاملات:', error);
      throw error;
    }
  }

  // إرسال البيانات إلى التكاملات النشطة
  static async syncData(event: string, data: any, metadata?: Record<string, any>): Promise<void> {
    try {
      const integrations = await this.getIntegrations();
      const activeIntegrations = integrations.filter(
        integration => integration.isActive && integration.events.includes(event)
      );

      if (activeIntegrations.length === 0) {
        console.log(`لا توجد تكاملات نشطة للحدث: ${event}`);
        return;
      }

      const payload: DataSyncPayload = {
        event,
        timestamp: new Date().toISOString(),
        data,
        source: 'ERP_SYSTEM',
        metadata
      };

      // إرسال البيانات لكل تكامل نشط
      const syncPromises = activeIntegrations.map(integration => 
        this.sendToIntegration(integration, payload)
      );

      await Promise.allSettled(syncPromises);
      console.log(`تم إرسال البيانات لـ ${activeIntegrations.length} تكامل`);

    } catch (error) {
      console.error('خطأ في مزامنة البيانات:', error);
      throw error;
    }
  }

  // إرسال البيانات لتكامل محدد
  private static async sendToIntegration(
    integration: APIIntegrationConfig, 
    payload: DataSyncPayload
  ): Promise<void> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...integration.headers
      };

      if (integration.apiKey) {
        headers['Authorization'] = `Bearer ${integration.apiKey}`;
      }

      const response = await fetch(integration.endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // تحديث وقت آخر مزامنة
      await supabase
        .from('api_integrations')
        .update({ last_sync: new Date().toISOString() })
        .eq('id', integration.id);

      console.log(`تم إرسال البيانات بنجاح إلى: ${integration.name}`);

    } catch (error) {
      console.error(`خطأ في إرسال البيانات إلى ${integration.name}:`, error);
      
      // تسجيل الخطأ
      await supabase
        .from('integration_logs')
        .insert({
          integration_id: integration.id,
          event: payload.event,
          status: 'error',
          error_message: error instanceof Error ? error.message : 'Unknown error',
          payload: payload
        });
    }
  }

  // اختبار التكامل
  static async testIntegration(integration: APIIntegrationConfig): Promise<boolean> {
    try {
      const testPayload: DataSyncPayload = {
        event: 'test_connection',
        timestamp: new Date().toISOString(),
        data: { message: 'Test connection from ERP system' },
        source: 'ERP_SYSTEM',
        metadata: { test: true }
      };

      await this.sendToIntegration(integration, testPayload);
      return true;
    } catch (error) {
      console.error('فشل اختبار التكامل:', error);
      return false;
    }
  }

  // إرسال بيانات الموظفين
  static async syncEmployeeData(employee: any, action: 'create' | 'update' | 'delete'): Promise<void> {
    await this.syncData(`employee_${action}`, employee, {
      department: employee.department,
      position: employee.position,
      action
    });
  }

  // إرسال بيانات الرواتب
  static async syncSalaryData(salaryRecord: any): Promise<void> {
    await this.syncData('salary_processed', salaryRecord, {
      employee_id: salaryRecord.employee_id,
      payment_date: salaryRecord.payment_date,
      amount: salaryRecord.total_salary
    });
  }

  // إرسال بيانات المشاريع
  static async syncProjectData(project: any, action: 'create' | 'update' | 'complete'): Promise<void> {
    await this.syncData(`project_${action}`, project, {
      status: project.status,
      budget: project.budget,
      progress: project.progress,
      action
    });
  }

  // إرسال البيانات المالية
  static async syncFinancialData(journalEntry: any): Promise<void> {
    await this.syncData('financial_transaction', journalEntry, {
      entry_type: journalEntry.entry_type,
      total_debit: journalEntry.total_debit,
      total_credit: journalEntry.total_credit,
      status: journalEntry.status
    });
  }

  // إعداد N8N webhook
  static async setupN8NWebhook(webhookUrl: string, events: string[]): Promise<string> {
    const config: Omit<APIIntegrationConfig, 'id'> = {
      name: 'N8N Automation',
      type: 'n8n',
      endpoint: webhookUrl,
      isActive: true,
      events,
      configuration: {
        autoRetry: true,
        timeout: 30000,
        batchSize: 1
      }
    };

    return await this.saveIntegration(config);
  }

  // إعداد Zapier webhook
  static async setupZapierWebhook(webhookUrl: string, events: string[]): Promise<string> {
    const config: Omit<APIIntegrationConfig, 'id'> = {
      name: 'Zapier Integration',
      type: 'zapier',
      endpoint: webhookUrl,
      isActive: true,
      events,
      configuration: {
        format: 'zapier',
        includeMetadata: true
      }
    };

    return await this.saveIntegration(config);
  }

  // الحصول على إحصائيات التكامل
  static async getIntegrationStats(integrationId: string): Promise<{
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    lastSync: string | null;
  }> {
    try {
      const { data, error } = await supabase
        .from('integration_logs')
        .select('status, created_at')
        .eq('integration_id', integrationId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const totalRequests = data.length;
      const successfulRequests = data.filter(log => log.status === 'success').length;
      const failedRequests = data.filter(log => log.status === 'error').length;
      const lastSync = data[0]?.created_at || null;

      return {
        totalRequests,
        successfulRequests,
        failedRequests,
        lastSync
      };
    } catch (error) {
      console.error('خطأ في جلب إحصائيات التكامل:', error);
      throw error;
    }
  }
}