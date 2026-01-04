import { supabase } from "@/integrations/supabase/client";

interface AdminUser {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at?: string;
  user_metadata?: any;
}

interface ListUsersResponse {
  users: AdminUser[];
}

interface CreateUserResponse {
  user: AdminUser;
}

interface DeleteUserResponse {
  success: boolean;
}

/**
 * List all users - requires admin role
 */
export async function listUsers(): Promise<AdminUser[]> {
  const { data: session } = await supabase.auth.getSession();
  
  if (!session.session) {
    throw new Error('يجب تسجيل الدخول');
  }

  const { data, error } = await supabase.functions.invoke<ListUsersResponse>('admin-users', {
    body: { action: 'list' },
    headers: {
      Authorization: `Bearer ${session.session.access_token}`
    }
  });

  if (error) {
    console.error('Error listing users:', error);
    throw new Error(error.message || 'فشل في تحميل المستخدمين');
  }

  return data?.users || [];
}

/**
 * Create a new user - requires admin role
 */
export async function createUser(email: string, password: string): Promise<AdminUser> {
  const { data: session } = await supabase.auth.getSession();
  
  if (!session.session) {
    throw new Error('يجب تسجيل الدخول');
  }

  const { data, error } = await supabase.functions.invoke<CreateUserResponse>('admin-users', {
    body: { action: 'create', email, password },
    headers: {
      Authorization: `Bearer ${session.session.access_token}`
    }
  });

  if (error) {
    console.error('Error creating user:', error);
    throw new Error(error.message || 'فشل في إنشاء المستخدم');
  }

  if (!data?.user) {
    throw new Error('فشل في إنشاء المستخدم');
  }

  return data.user;
}

/**
 * Delete a user - requires admin role
 */
export async function deleteUser(userId: string): Promise<void> {
  const { data: session } = await supabase.auth.getSession();
  
  if (!session.session) {
    throw new Error('يجب تسجيل الدخول');
  }

  const { data, error } = await supabase.functions.invoke<DeleteUserResponse>('admin-users', {
    body: { action: 'delete', userId },
    headers: {
      Authorization: `Bearer ${session.session.access_token}`
    }
  });

  if (error) {
    console.error('Error deleting user:', error);
    throw new Error(error.message || 'فشل في حذف المستخدم');
  }

  if (!data?.success) {
    throw new Error('فشل في حذف المستخدم');
  }
}
