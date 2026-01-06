import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function verifyUserRole(supabase: any, userId: string, allowedRoles: string[]): Promise<boolean> {
  const { data: userRole, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .single();

  if (error || !userRole) {
    console.log('No role found for user:', userId);
    return false;
  }

  return allowedRoles.includes(userRole.role);
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // التحقق من المصادقة
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.log('No authorization header provided');
      return new Response(
        JSON.stringify({ error: 'المصادقة مطلوبة' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // التحقق من صحة التوكن
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      console.log('Invalid token:', authError?.message);
      return new Response(
        JSON.stringify({ error: 'رمز المصادقة غير صالح' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // التحقق من صلاحيات HR
    const allowedRoles = ['admin', 'owner', 'hr_manager'];
    const hasPermission = await verifyUserRole(supabaseClient, user.id, allowedRoles);
    
    if (!hasPermission) {
      console.log('User does not have HR role:', user.id);
      return new Response(
        JSON.stringify({ error: 'ليس لديك صلاحية للوصول إلى بيانات التأمينات الاجتماعية' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { action, employeeId, gosiNumber } = await req.json();

    console.log('GOSI Integration request:', { action, employeeId, gosiNumber, userId: user.id });

    // تسجيل العملية في سجل الأمان
    await supabaseClient
      .from('security_audit_log')
      .insert({
        user_id: user.id,
        action: `gosi_${action}`,
        resource_type: 'gosi_integration',
        resource_id: employeeId,
        details: { action, gosiNumber }
      });

    switch (action) {
      case 'sync_employee':
        return await syncEmployeeWithGOSI(supabaseClient, employeeId, gosiNumber);
        
      case 'sync_all_employees':
        return await syncAllEmployeesWithGOSI(supabaseClient);
        
      case 'get_gosi_status':
        return await getGOSIStatus(supabaseClient, employeeId);
        
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
    }
  } catch (error) {
    console.error('GOSI Integration error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function syncEmployeeWithGOSI(supabaseClient: any, employeeId: string, gosiNumber: string) {
  try {
    // محاكاة استدعاء API التأمينات الاجتماعية
    const mockGOSIResponse = {
      success: true,
      data: {
        employee_id: employeeId,
        gosi_number: gosiNumber,
        subscription_status: 'active',
        subscription_date: '2024-01-15',
        contribution_rate: 22,
        last_contribution_date: '2024-12-01',
        outstanding_balance: 0,
        coverage_details: {
          occupational_hazards: true,
          unemployment: true,
          old_age_disability_death: true
        }
      }
    };

    // تحديث جدول gosi_integration
    const { data: gosiIntegration, error: gosiError } = await supabaseClient
      .from('gosi_integration')
      .upsert({
        employee_id: employeeId,
        gosi_number: gosiNumber,
        subscription_date: mockGOSIResponse.data.subscription_date,
        last_sync: new Date().toISOString(),
        sync_status: mockGOSIResponse.success ? 'success' : 'failed',
        api_response: mockGOSIResponse
      }, { onConflict: 'employee_id' });

    if (gosiError) {
      throw new Error(`Database error: ${gosiError.message}`);
    }

    // تحديث بيانات الموظف بمعلومات التأمينات
    const { error: employeeError } = await supabaseClient
      .from('employees')
      .update({
        gosi_subscription: mockGOSIResponse.data.contribution_rate,
        employee_gosi_contribution: 10,
        company_gosi_contribution: 12,
        gosi_details: {
          gosi_number: gosiNumber,
          subscription_date: mockGOSIResponse.data.subscription_date,
          coverage_details: mockGOSIResponse.data.coverage_details
        }
      })
      .eq('id', employeeId);

    if (employeeError) {
      throw new Error(`Employee update error: ${employeeError.message}`);
    }

    console.log('GOSI sync successful for employee:', employeeId);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'تم مزامنة بيانات الموظف مع التأمينات الاجتماعية بنجاح',
        data: mockGOSIResponse.data
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error syncing with GOSI:', error);
    
    await supabaseClient
      .from('gosi_integration')
      .upsert({
        employee_id: employeeId,
        gosi_number: gosiNumber,
        last_sync: new Date().toISOString(),
        sync_status: 'failed',
        api_response: { error: error.message }
      }, { onConflict: 'employee_id' });

    return new Response(
      JSON.stringify({
        success: false,
        error: 'فشل في مزامنة البيانات مع التأمينات الاجتماعية',
        details: error.message
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
}

async function syncAllEmployeesWithGOSI(supabaseClient: any) {
  try {
    const { data: employees, error: employeesError } = await supabaseClient
      .from('employees')
      .select('id, name, identity_number');

    if (employeesError) {
      throw new Error(`Error fetching employees: ${employeesError.message}`);
    }

    const results = [];
    
    for (const employee of employees) {
      const mockGosiNumber = `GOSI${employee.identity_number}`;
      
      try {
        const result = await syncEmployeeWithGOSI(supabaseClient, employee.id, mockGosiNumber);
        results.push({
          employee_id: employee.id,
          employee_name: employee.name,
          status: 'success'
        });
      } catch (error) {
        results.push({
          employee_id: employee.id,
          employee_name: employee.name,
          status: 'failed',
          error: error.message
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'تم إكمال مزامنة جميع الموظفين مع التأمينات الاجتماعية',
        results: results
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error syncing all employees with GOSI:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'فشل في مزامنة الموظفين مع التأمينات الاجتماعية',
        details: error.message
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
}

async function getGOSIStatus(supabaseClient: any, employeeId: string) {
  try {
    const { data: gosiData, error } = await supabaseClient
      .from('gosi_integration')
      .select('*')
      .eq('employee_id', employeeId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Database error: ${error.message}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: gosiData || null,
        message: gosiData ? 'تم العثور على بيانات التأمينات' : 'لم يتم العثور على بيانات التأمينات لهذا الموظف'
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error getting GOSI status:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'فشل في جلب بيانات التأمينات الاجتماعية',
        details: error.message
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
}
