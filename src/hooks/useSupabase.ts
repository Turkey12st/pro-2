// وظائف مساعدة محسنة للتعامل مع قاعدة البيانات
import { supabase } from '@/integrations/supabase/client';
import { parseError, logError, AppError, retryWithBackoff } from '@/lib/errorHandler';

// معالجة أخطاء قاعدة البيانات
export const handleDatabaseError = (error: unknown): string => {
  const appError = parseError(error);
  logError(appError, 'Database Operation');
  return appError.message;
};

// التحقق من صحة البيانات قبل الإرسال
export const validateData = (data: Record<string, any>, requiredFields: string[]): string[] => {
  const errors: string[] = [];
  
  for (const field of requiredFields) {
    const value = data[field];
    if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '')) {
      errors.push(`الحقل ${field} مطلوب`);
    }
  }
  
  return errors;
};

// التحقق من صحة البريد الإلكتروني
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// التحقق من صحة رقم الهاتف السعودي
export const validateSaudiPhone = (phone: string): boolean => {
  const phoneRegex = /^(05|5)(0|1|2|3|4|5|6|7|8|9)([0-9]{7})$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

// التحقق من صحة رقم الهوية السعودية
export const validateSaudiId = (id: string): boolean => {
  if (!id || id.length !== 10) return false;
  const idRegex = /^[12][0-9]{9}$/;
  return idRegex.test(id);
};

// إضافة خصائص للملف المرفق
export const addAttachmentMetadata = (journalEntry: any, attachmentUrl?: string) => {
  if (attachmentUrl) {
    return {
      ...journalEntry,
      attachment_url: attachmentUrl
    };
  }
  return journalEntry;
};

// تنفيذ استعلام آمن مع retry
export async function safeQuery<T>(
  queryFn: () => Promise<{ data: T | null; error: any }>,
  options: { maxRetries?: number; context?: string } = {}
): Promise<{ data: T | null; error: AppError | null }> {
  const { maxRetries = 3, context = 'Unknown' } = options;
  
  try {
    const result = await retryWithBackoff(async () => {
      const { data, error } = await queryFn();
      if (error) throw error;
      return data;
    }, maxRetries);
    
    return { data: result, error: null };
  } catch (error) {
    const appError = parseError(error);
    logError(appError, context);
    return { data: null, error: appError };
  }
}

// تنفيذ عملية insert آمنة
export async function safeInsert<T>(
  table: string,
  data: Record<string, any>,
  options: { returnData?: boolean; context?: string } = {}
): Promise<{ data: T | null; error: AppError | null }> {
  const { returnData = true, context = `Insert ${table}` } = options;
  
  return safeQuery<T>(
    async () => {
      const query = supabase.from(table as any).insert(data);
      if (returnData) {
        return query.select().single();
      }
      return query as any;
    },
    { context }
  );
}

// تنفيذ عملية update آمنة
export async function safeUpdate<T>(
  table: string,
  id: string,
  data: Record<string, any>,
  options: { context?: string } = {}
): Promise<{ data: T | null; error: AppError | null }> {
  const { context = `Update ${table}` } = options;
  
  return safeQuery<T>(
    async () => {
      return supabase
        .from(table as any)
        .update(data)
        .eq('id', id)
        .select()
        .single();
    },
    { context }
  );
}

// تنفيذ عملية delete آمنة
export async function safeDelete(
  table: string,
  id: string,
  options: { context?: string } = {}
): Promise<{ success: boolean; error: AppError | null }> {
  const { context = `Delete ${table}` } = options;
  
  try {
    const { error } = await supabase
      .from(table as any)
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    const appError = parseError(error);
    logError(appError, context);
    return { success: false, error: appError };
  }
}

// تصدير الـ supabase client
export { supabase };
