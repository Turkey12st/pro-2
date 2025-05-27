
import { supabase } from "@/integrations/supabase/client";

export interface EmailOptions {
  to: string[];
  subject: string;
  html: string;
  type?: 'alert' | 'notification' | 'report';
}

export class EmailService {
  static async sendEmail({ to, subject, html, type = 'notification' }: EmailOptions) {
    try {
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: { to, subject, html, type }
      });

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  static async sendSalaryAlert(employeeName: string, amount: number, dueDate: string) {
    return this.sendEmail({
      to: ['hr@company.com', 'finance@company.com'],
      subject: 'تنبيه: استحقاق راتب موظف',
      html: `
        <h2>تنبيه استحقاق راتب</h2>
        <p><strong>اسم الموظف:</strong> ${employeeName}</p>
        <p><strong>مبلغ الراتب:</strong> ${amount.toLocaleString()} ريال</p>
        <p><strong>تاريخ الاستحقاق:</strong> ${dueDate}</p>
        <p style="color: #dc2626; font-weight: bold;">يرجى المراجعة واتخاذ الإجراء المناسب</p>
      `,
      type: 'alert'
    });
  }

  static async sendDocumentExpiryAlert(documentTitle: string, expiryDate: string, daysRemaining: number) {
    const urgencyColor = daysRemaining <= 7 ? '#dc2626' : daysRemaining <= 30 ? '#f59e0b' : '#10b981';
    
    return this.sendEmail({
      to: ['admin@company.com', 'legal@company.com'],
      subject: `تنبيه: انتهاء صلاحية ${documentTitle}`,
      html: `
        <h2>تنبيه انتهاء صلاحية مستند</h2>
        <p><strong>اسم المستند:</strong> ${documentTitle}</p>
        <p><strong>تاريخ انتهاء الصلاحية:</strong> ${expiryDate}</p>
        <p style="color: ${urgencyColor}; font-weight: bold;">
          متبقي ${daysRemaining} يوم على انتهاء الصلاحية
        </p>
        <p>يرجى تجديد المستند قبل انتهاء صلاحيته</p>
      `,
      type: 'alert'
    });
  }

  static async sendGovernmentIntegrationReport(system: string, results: any) {
    return this.sendEmail({
      to: ['admin@company.com', 'compliance@company.com'],
      subject: `تقرير التكامل مع ${system}`,
      html: `
        <h2>تقرير التكامل الحكومي</h2>
        <p><strong>النظام:</strong> ${system}</p>
        <p><strong>حالة التكامل:</strong> ${results.success ? 'نجح' : 'فشل'}</p>
        <p><strong>الرسالة:</strong> ${results.message}</p>
        ${results.data ? `<p><strong>البيانات:</strong> ${JSON.stringify(results.data, null, 2)}</p>` : ''}
        <p><strong>التاريخ:</strong> ${new Date().toLocaleDateString('ar-SA')}</p>
      `,
      type: 'report'
    });
  }
}
