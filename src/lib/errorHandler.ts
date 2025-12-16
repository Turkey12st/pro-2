// نظام معالجة الأخطاء المتقدم
import { PostgrestError } from '@supabase/supabase-js';

export interface AppError {
  code: string;
  message: string;
  details?: string;
  recoverable: boolean;
  action?: () => void;
}

export type ErrorSeverity = 'info' | 'warning' | 'error' | 'critical';

// رموز الأخطاء المعروفة
export const ERROR_CODES = {
  // أخطاء الشبكة
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',
  CONNECTION_LOST: 'CONNECTION_LOST',
  
  // أخطاء قاعدة البيانات
  DB_CONNECTION_ERROR: 'DB_CONNECTION_ERROR',
  DB_QUERY_ERROR: 'DB_QUERY_ERROR',
  DB_CONSTRAINT_ERROR: 'DB_CONSTRAINT_ERROR',
  DB_PERMISSION_ERROR: 'DB_PERMISSION_ERROR',
  
  // أخطاء المصادقة
  AUTH_ERROR: 'AUTH_ERROR',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  UNAUTHORIZED: 'UNAUTHORIZED',
  
  // أخطاء التحقق
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  
  // أخطاء عامة
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  RATE_LIMIT: 'RATE_LIMIT',
} as const;

// رسائل الأخطاء بالعربية
const ERROR_MESSAGES: Record<string, string> = {
  [ERROR_CODES.NETWORK_ERROR]: 'خطأ في الاتصال بالشبكة. يرجى التحقق من اتصالك بالإنترنت.',
  [ERROR_CODES.TIMEOUT]: 'انتهت مهلة الطلب. يرجى المحاولة مرة أخرى.',
  [ERROR_CODES.CONNECTION_LOST]: 'تم فقدان الاتصال. جاري إعادة المحاولة...',
  [ERROR_CODES.DB_CONNECTION_ERROR]: 'خطأ في الاتصال بقاعدة البيانات.',
  [ERROR_CODES.DB_QUERY_ERROR]: 'خطأ في تنفيذ الاستعلام.',
  [ERROR_CODES.DB_CONSTRAINT_ERROR]: 'البيانات المدخلة تنتهك قيود قاعدة البيانات.',
  [ERROR_CODES.DB_PERMISSION_ERROR]: 'ليس لديك صلاحية للوصول إلى هذه البيانات.',
  [ERROR_CODES.AUTH_ERROR]: 'خطأ في المصادقة. يرجى تسجيل الدخول مرة أخرى.',
  [ERROR_CODES.SESSION_EXPIRED]: 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى.',
  [ERROR_CODES.UNAUTHORIZED]: 'غير مصرح لك بتنفيذ هذا الإجراء.',
  [ERROR_CODES.VALIDATION_ERROR]: 'البيانات المدخلة غير صالحة.',
  [ERROR_CODES.INVALID_INPUT]: 'المدخلات غير صحيحة.',
  [ERROR_CODES.UNKNOWN_ERROR]: 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.',
  [ERROR_CODES.RATE_LIMIT]: 'تجاوزت الحد المسموح من الطلبات. يرجى الانتظار.',
};

// تحديد نوع الخطأ من PostgrestError
export function parsePostgrestError(error: PostgrestError): AppError {
  const code = error.code || '';
  const message = error.message || '';
  
  // أخطاء RLS
  if (code === '42501' || message.includes('row-level security')) {
    return {
      code: ERROR_CODES.DB_PERMISSION_ERROR,
      message: ERROR_MESSAGES[ERROR_CODES.DB_PERMISSION_ERROR],
      details: error.details || error.hint,
      recoverable: false,
    };
  }
  
  // أخطاء القيود
  if (code === '23505' || code === '23503' || code === '23502') {
    return {
      code: ERROR_CODES.DB_CONSTRAINT_ERROR,
      message: ERROR_MESSAGES[ERROR_CODES.DB_CONSTRAINT_ERROR],
      details: error.details,
      recoverable: true,
    };
  }
  
  // أخطاء الاتصال
  if (message.includes('Failed to fetch') || message.includes('NetworkError')) {
    return {
      code: ERROR_CODES.NETWORK_ERROR,
      message: ERROR_MESSAGES[ERROR_CODES.NETWORK_ERROR],
      recoverable: true,
    };
  }
  
  return {
    code: ERROR_CODES.DB_QUERY_ERROR,
    message: ERROR_MESSAGES[ERROR_CODES.DB_QUERY_ERROR],
    details: error.message,
    recoverable: true,
  };
}

// تحديد نوع الخطأ من أي خطأ
export function parseError(error: unknown): AppError {
  // PostgrestError
  if (error && typeof error === 'object' && 'code' in error && 'message' in error) {
    return parsePostgrestError(error as PostgrestError);
  }
  
  // Error عادي
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    
    if (message.includes('failed to fetch') || message.includes('network')) {
      return {
        code: ERROR_CODES.NETWORK_ERROR,
        message: ERROR_MESSAGES[ERROR_CODES.NETWORK_ERROR],
        recoverable: true,
      };
    }
    
    if (message.includes('timeout') || message.includes('abort')) {
      return {
        code: ERROR_CODES.TIMEOUT,
        message: ERROR_MESSAGES[ERROR_CODES.TIMEOUT],
        recoverable: true,
      };
    }
    
    if (message.includes('unauthorized') || message.includes('401')) {
      return {
        code: ERROR_CODES.UNAUTHORIZED,
        message: ERROR_MESSAGES[ERROR_CODES.UNAUTHORIZED],
        recoverable: false,
      };
    }
    
    return {
      code: ERROR_CODES.UNKNOWN_ERROR,
      message: error.message || ERROR_MESSAGES[ERROR_CODES.UNKNOWN_ERROR],
      recoverable: true,
    };
  }
  
  return {
    code: ERROR_CODES.UNKNOWN_ERROR,
    message: ERROR_MESSAGES[ERROR_CODES.UNKNOWN_ERROR],
    recoverable: true,
  };
}

// الحصول على رسالة الخطأ
export function getErrorMessage(code: string): string {
  return ERROR_MESSAGES[code] || ERROR_MESSAGES[ERROR_CODES.UNKNOWN_ERROR];
}

// تسجيل الخطأ
export function logError(error: AppError, context?: string) {
  const timestamp = new Date().toISOString();
  const logData = {
    timestamp,
    context,
    ...error,
  };
  
  console.error('[Error Log]', logData);
  
  // يمكن إضافة إرسال إلى خدمة تتبع الأخطاء هنا
}

// دالة retry مع تأخير أسي
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error | undefined;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      const parsedError = parseError(error);
      
      // لا تعيد المحاولة للأخطاء غير القابلة للاسترداد
      if (!parsedError.recoverable) {
        throw lastError;
      }
      
      // تأخير أسي مع jitter
      const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
      
      console.log(`إعادة المحاولة ${attempt + 1}/${maxRetries} بعد ${Math.round(delay)}ms`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError || new Error('Maximum retries exceeded');
}

// مغلف آمن للدوال غير المتزامنة
export async function safeAsync<T>(
  fn: () => Promise<T>,
  fallback?: T
): Promise<{ data: T | undefined; error: AppError | null }> {
  try {
    const data = await fn();
    return { data, error: null };
  } catch (error) {
    const appError = parseError(error);
    logError(appError);
    return { data: fallback, error: appError };
  }
}
