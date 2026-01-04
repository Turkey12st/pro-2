import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface RequestBody {
  action: 'list' | 'create' | 'delete';
  email?: string;
  password?: string;
  userId?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create admin client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Verify caller is authenticated
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.log('No authorization header provided');
      return new Response(
        JSON.stringify({ error: 'غير مصرح - لا يوجد رمز مصادقة' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the user from the JWT token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      console.log('Auth error or no user:', authError);
      return new Response(
        JSON.stringify({ error: 'غير مصرح - رمز غير صالح' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user has admin or owner role
    const { data: userRole, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (roleError) {
      console.log('Role fetch error:', roleError);
    }

    const allowedRoles = ['admin', 'owner'];
    if (!userRole || !allowedRoles.includes(userRole.role)) {
      console.log('User role not allowed:', userRole?.role);
      return new Response(
        JSON.stringify({ error: 'غير مصرح - ليس لديك صلاحية الوصول' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const body: RequestBody = await req.json();
    console.log('Received action:', body.action);

    switch (body.action) {
      case 'list': {
        const { data, error } = await supabaseAdmin.auth.admin.listUsers();
        if (error) {
          console.log('List users error:', error);
          throw error;
        }
        return new Response(
          JSON.stringify({ users: data.users }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'create': {
        if (!body.email || !body.password) {
          return new Response(
            JSON.stringify({ error: 'البريد الإلكتروني وكلمة المرور مطلوبان' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Validate password strength
        if (body.password.length < 8) {
          return new Response(
            JSON.stringify({ error: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { data: newUser, error } = await supabaseAdmin.auth.admin.createUser({
          email: body.email,
          password: body.password,
          email_confirm: true
        });

        if (error) {
          console.log('Create user error:', error);
          throw error;
        }

        return new Response(
          JSON.stringify({ user: newUser.user }),
          { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'delete': {
        if (!body.userId) {
          return new Response(
            JSON.stringify({ error: 'معرف المستخدم مطلوب' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Prevent self-deletion
        if (body.userId === user.id) {
          return new Response(
            JSON.stringify({ error: 'لا يمكنك حذف حسابك الخاص' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { error } = await supabaseAdmin.auth.admin.deleteUser(body.userId);
        if (error) {
          console.log('Delete user error:', error);
          throw error;
        }

        return new Response(
          JSON.stringify({ success: true }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: 'إجراء غير معروف' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('Admin users function error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'حدث خطأ في الخادم' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
