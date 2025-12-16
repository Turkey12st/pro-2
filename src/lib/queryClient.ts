// إعداد React Query مع معالجة الأخطاء المتقدمة
import { QueryClient, QueryClientProvider as BaseQueryClientProvider } from '@tanstack/react-query';
import { parseError, logError, ERROR_CODES } from './errorHandler';
import React from 'react';

// إعدادات إعادة المحاولة
const retryConfig = {
  maxRetries: 3,
  retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
  shouldRetry: (error: unknown): boolean => {
    const parsedError = parseError(error);
    return parsedError.recoverable;
  },
};

// معالج الأخطاء العام
function handleQueryError(error: unknown) {
  const parsedError = parseError(error);
  logError(parsedError, 'React Query');
  
  // يمكن إضافة عرض إشعار هنا
  if (parsedError.code === ERROR_CODES.SESSION_EXPIRED) {
    // إعادة توجيه لتسجيل الدخول
    window.location.href = '/login';
  }
}

// إنشاء QueryClient مع الإعدادات المحسنة
export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // التخزين المؤقت
        staleTime: 5 * 60 * 1000, // 5 دقائق
        gcTime: 30 * 60 * 1000, // 30 دقيقة (كان cacheTime)
        
        // إعادة المحاولة
        retry: (failureCount, error) => {
          if (failureCount >= retryConfig.maxRetries) return false;
          return retryConfig.shouldRetry(error);
        },
        retryDelay: retryConfig.retryDelay,
        
        // السلوك
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
        refetchOnMount: true,
        
        // معالجة الأخطاء
        throwOnError: false,
      },
      mutations: {
        retry: (failureCount, error) => {
          if (failureCount >= 2) return false;
          return retryConfig.shouldRetry(error);
        },
        retryDelay: retryConfig.retryDelay,
        
        onError: handleQueryError,
      },
    },
  });
}

// QueryClient singleton
let queryClientInstance: QueryClient | null = null;

export function getQueryClient(): QueryClient {
  if (!queryClientInstance) {
    queryClientInstance = createQueryClient();
  }
  return queryClientInstance;
}

// مزود QueryClient
interface QueryClientProviderProps {
  children: React.ReactNode;
}

export function QueryClientProvider({ children }: QueryClientProviderProps) {
  const [client] = React.useState(() => getQueryClient());
  
  return React.createElement(BaseQueryClientProvider, { client }, children);
}
