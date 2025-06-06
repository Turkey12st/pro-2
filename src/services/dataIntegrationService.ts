
import { supabase } from "@/integrations/supabase/client";

// خدمة لضمان ترابط البيانات عبر النظام
export class DataIntegrationService {
  // التحقق من سلامة البيانات وإنشاء الروابط المطلوبة
  static async ensureDataIntegrity() {
    try {
      await this.ensureClientProjectRelations();
      await this.ensureEmployeeTaskRelations();
      await this.ensurePartnerCapitalRelations();
      await this.ensureProjectProgressSync();
    } catch (error) {
      console.error('Error ensuring data integrity:', error);
    }
  }

  // ربط المشاريع بالعملاء
  static async ensureClientProjectRelations() {
    // الحصول على المشاريع التي لا تحتوي على عميل
    const { data: projectsWithoutClient } = await supabase
      .from('projects')
      .select('id')
      .is('client_id', null);

    if (projectsWithoutClient && projectsWithoutClient.length > 0) {
      // الحصول على عميل افتراضي أو إنشاء واحد
      let { data: defaultClient } = await supabase
        .from('clients')
        .select('id')
        .limit(1)
        .single();

      if (!defaultClient) {
        // إنشاء عميل افتراضي
        const { data: newClient } = await supabase
          .from('clients')
          .insert([{
            name: 'عميل افتراضي',
            type: 'company',
            email: 'default@company.com'
          }])
          .select('id')
          .single();
        
        defaultClient = newClient;
      }

      if (defaultClient) {
        // ربط المشاريع بالعميل الافتراضي
        for (const project of projectsWithoutClient) {
          await supabase
            .from('projects')
            .update({ client_id: defaultClient.id })
            .eq('id', project.id);
        }
      }
    }
  }

  // ربط المهام بالموظفين
  static async ensureEmployeeTaskRelations() {
    const { data: tasksWithoutAssignee } = await supabase
      .from('project_tasks')
      .select('id')
      .is('assignee_id', null);

    if (tasksWithoutAssignee && tasksWithoutAssignee.length > 0) {
      const { data: employees } = await supabase
        .from('employees')
        .select('id');

      if (employees && employees.length > 0) {
        for (const task of tasksWithoutAssignee) {
          const randomEmployee = employees[Math.floor(Math.random() * employees.length)];
          await supabase
            .from('project_tasks')
            .update({ assignee_id: randomEmployee.id })
            .eq('id', task.id);
        }
      }
    }
  }

  // ضمان ترابط رأس المال مع الشركاء
  static async ensurePartnerCapitalRelations() {
    const { data: partners } = await supabase
      .from('company_partners')
      .select('capital_amount');

    if (partners) {
      const totalCapital = partners.reduce((sum, partner) => 
        sum + (Number(partner.capital_amount) || 0), 0);

      // تحديث جدول إدارة رأس المال
      await supabase
        .from('capital_management')
        .upsert([{
          fiscal_year: new Date().getFullYear(),
          total_capital: totalCapital,
          available_capital: totalCapital * 0.8, // 80% متاح
          reserved_capital: totalCapital * 0.2,  // 20% محجوز
          last_updated: new Date().toISOString()
        }]);
    }
  }

  // مزامنة تقدم المشاريع
  static async ensureProjectProgressSync() {
    const { data: projects } = await supabase
      .from('projects')
      .select('id');

    if (projects) {
      for (const project of projects) {
        // حساب التقدم بناءً على المهام المكتملة
        const { data: tasks } = await supabase
          .from('project_tasks')
          .select('status')
          .eq('project_id', project.id);

        if (tasks && tasks.length > 0) {
          const completedTasks = tasks.filter(task => task.status === 'completed').length;
          const progress = Math.round((completedTasks / tasks.length) * 100);

          await supabase
            .from('projects')
            .update({ 
              progress,
              total_tasks: tasks.length,
              completed_tasks: completedTasks
            })
            .eq('id', project.id);
        }
      }
    }
  }

  // إنشاء بيانات أساسية للاختبار
  static async createSampleData() {
    try {
      await this.createSamplePartners();
      await this.createSampleEmployees();
      await this.createSampleClients();
      await this.createSampleProjects();
    } catch (error) {
      console.error('Error creating sample data:', error);
    }
  }

  private static async createSamplePartners() {
    const { data: existingPartners } = await supabase
      .from('company_partners')
      .select('id')
      .limit(1);

    if (!existingPartners || existingPartners.length === 0) {
      await supabase
        .from('company_partners')
        .insert([
          {
            name: 'أحمد محمد السعودي',
            nationality: 'سعودي',
            identity_number: '1234567890',
            partner_type: 'individual',
            ownership_percentage: 60,
            share_value: 600000,
            position: 'الشريك المؤسس',
            contact_info: {
              email: 'ahmed@company.com',
              phone: '+966501234567'
            }
          },
          {
            name: 'شركة الاستثمار التقني',
            partner_type: 'company',
            ownership_percentage: 40,
            share_value: 400000,
            position: 'شريك استثماري',
            contact_info: {
              email: 'info@techinvest.com',
              phone: '+966507654321'
            }
          }
        ]);
    }
  }

  private static async createSampleEmployees() {
    const { data: existingEmployees } = await supabase
      .from('employees')
      .select('id')
      .limit(1);

    if (!existingEmployees || existingEmployees.length === 0) {
      await supabase
        .from('employees')
        .insert([
          {
            name: 'محمد أحمد',
            identity_number: '2234567890',
            nationality: 'سعودي',
            position: 'مطور برمجيات',
            department: 'التقنية',
            contract_type: 'دوام كامل',
            email: 'mohammed@company.com',
            phone: '+966502345678',
            birth_date: '1990-01-15',
            joining_date: '2023-01-01',
            salary: 8000,
            employee_type: 'saudi'
          }
        ]);
    }
  }

  private static async createSampleClients() {
    const { data: existingClients } = await supabase
      .from('clients')
      .select('id')
      .limit(1);

    if (!existingClients || existingClients.length === 0) {
      await supabase
        .from('clients')
        .insert([
          {
            name: 'وزارة التقنية',
            type: 'government',
            cr_number: '1010123456',
            email: 'contact@tech.gov.sa',
            phone: '+966112345678',
            contact_person: 'سعد الأحمد'
          }
        ]);
    }
  }

  private static async createSampleProjects() {
    const { data: existingProjects } = await supabase
      .from('projects')
      .select('id')
      .limit(1);

    if (!existingProjects || existingProjects.length === 0) {
      // الحصول على العميل والموظف لربطهما
      const { data: client } = await supabase
        .from('clients')
        .select('id')
        .limit(1)
        .single();

      const { data: employee } = await supabase
        .from('employees')
        .select('id')
        .limit(1)
        .single();

      if (client && employee) {
        await supabase
          .from('projects')
          .insert([
            {
              title: 'نظام إدارة الوثائق الحكومية',
              description: 'تطوير نظام شامل لإدارة الوثائق الحكومية الإلكترونية',
              status: 'in_progress',
              priority: 'high',
              start_date: '2024-01-01',
              end_date: '2024-12-31',
              budget: 500000,
              client_id: client.id,
              manager_id: employee.id,
              progress: 25
            }
          ]);
      }
    }
  }
}
