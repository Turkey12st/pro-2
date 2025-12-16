// Hook لمعالجة الأخطاء في المكونات
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { parseError, logError, AppError, retryWithBackoff } from '@/lib/errorHandler';

interface UseErrorHandlerOptions {
  showToast?: boolean;
  logErrors?: boolean;
  context?: string;
}

interface UseErrorHandlerReturn {
  error: AppError | null;
  isError: boolean;
  handleError: (error: unknown) => AppError;
  clearError: () => void;
  wrapAsync: <T>(fn: () => Promise<T>) => Promise<{ data: T | null; error: AppError | null }>;
  retryAsync: <T>(fn: () => Promise<T>, maxRetries?: number) => Promise<T>;
}

export function useErrorHandler(options: UseErrorHandlerOptions = {}): UseErrorHandlerReturn {
  const { showToast = true, logErrors = true, context } = options;
  const [error, setError] = useState<AppError | null>(null);
  const { toast } = useToast();

  const handleError = useCallback((err: unknown): AppError => {
    const appError = parseError(err);
    
    setError(appError);
    
    if (logErrors) {
      logError(appError, context);
    }
    
    if (showToast) {
      toast({
        title: 'خطأ',
        description: appError.message,
        variant: 'destructive',
      });
    }
    
    return appError;
  }, [showToast, logErrors, context, toast]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const wrapAsync = useCallback(async <T>(
    fn: () => Promise<T>
  ): Promise<{ data: T | null; error: AppError | null }> => {
    clearError();
    
    try {
      const data = await fn();
      return { data, error: null };
    } catch (err) {
      const appError = handleError(err);
      return { data: null, error: appError };
    }
  }, [handleError, clearError]);

  const retryAsync = useCallback(async <T>(
    fn: () => Promise<T>,
    maxRetries: number = 3
  ): Promise<T> => {
    clearError();
    
    try {
      return await retryWithBackoff(fn, maxRetries);
    } catch (err) {
      handleError(err);
      throw err;
    }
  }, [handleError, clearError]);

  return {
    error,
    isError: error !== null,
    handleError,
    clearError,
    wrapAsync,
    retryAsync,
  };
}

// Hook للتعامل مع حالة التحميل والأخطاء
interface UseAsyncStateOptions<T> extends UseErrorHandlerOptions {
  initialData?: T;
}

interface UseAsyncStateReturn<T> extends UseErrorHandlerReturn {
  data: T | null;
  isLoading: boolean;
  execute: (fn: () => Promise<T>) => Promise<void>;
  reset: () => void;
}

export function useAsyncState<T>(
  options: UseAsyncStateOptions<T> = {}
): UseAsyncStateReturn<T> {
  const { initialData = null, ...errorOptions } = options;
  const [data, setData] = useState<T | null>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const errorHandler = useErrorHandler(errorOptions);

  const execute = useCallback(async (fn: () => Promise<T>) => {
    setIsLoading(true);
    errorHandler.clearError();
    
    try {
      const result = await fn();
      setData(result);
    } catch (err) {
      errorHandler.handleError(err);
    } finally {
      setIsLoading(false);
    }
  }, [errorHandler]);

  const reset = useCallback(() => {
    setData(initialData);
    setIsLoading(false);
    errorHandler.clearError();
  }, [initialData, errorHandler]);

  return {
    ...errorHandler,
    data,
    isLoading,
    execute,
    reset,
  };
}

export default useErrorHandler;
