import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home, Bug, Copy, Check } from 'lucide-react';
import { logError, parseError } from '@/lib/errorHandler';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  copied: boolean;
}

class GlobalErrorBoundaryClass extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, copied: false };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });

    // تسجيل الخطأ
    const parsedError = parseError(error);
    logError(parsedError, 'GlobalErrorBoundary');

    // استدعاء callback إذا موجود
    this.props.onError?.(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleCopyError = async () => {
    const { error, errorInfo } = this.state;
    const errorText = `
Error: ${error?.message || 'Unknown error'}
Stack: ${error?.stack || 'No stack trace'}
Component Stack: ${errorInfo?.componentStack || 'No component stack'}
Timestamp: ${new Date().toISOString()}
URL: ${window.location.href}
User Agent: ${navigator.userAgent}
    `.trim();

    try {
      await navigator.clipboard.writeText(errorText);
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 2000);
    } catch {
      console.error('فشل في نسخ الخطأ');
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { error, errorInfo, copied } = this.state;
      const isDev = import.meta.env.DEV;

      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4" dir="rtl">
          <Card className="w-full max-w-lg shadow-lg">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-full bg-destructive/10">
                  <AlertTriangle className="h-10 w-10 text-destructive" />
                </div>
              </div>
              <CardTitle className="text-xl">حدث خطأ في النظام</CardTitle>
              <CardDescription className="mt-2">
                نعتذر عن هذا الخطأ غير المتوقع. يمكنك المحاولة مرة أخرى أو العودة للصفحة الرئيسية.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* عرض تفاصيل الخطأ للمطورين */}
              {isDev && error && (
                <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Bug className="h-4 w-4" />
                      تفاصيل الخطأ (للمطورين)
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={this.handleCopyError}
                      className="h-8"
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="font-medium text-destructive">Error:</span>
                      <pre className="mt-1 whitespace-pre-wrap text-muted-foreground overflow-auto max-h-24">
                        {error.message}
                      </pre>
                    </div>
                    
                    {error.stack && (
                      <details className="cursor-pointer">
                        <summary className="font-medium">Stack Trace</summary>
                        <pre className="mt-1 whitespace-pre-wrap text-muted-foreground overflow-auto max-h-32 text-[10px]">
                          {error.stack}
                        </pre>
                      </details>
                    )}
                    
                    {errorInfo?.componentStack && (
                      <details className="cursor-pointer">
                        <summary className="font-medium">Component Stack</summary>
                        <pre className="mt-1 whitespace-pre-wrap text-muted-foreground overflow-auto max-h-32 text-[10px]">
                          {errorInfo.componentStack}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              )}
              
              {/* أزرار الإجراءات */}
              <div className="flex flex-col gap-2">
                <Button onClick={this.handleReset} className="w-full">
                  <RefreshCw className="h-4 w-4 ml-2" />
                  إعادة المحاولة
                </Button>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button onClick={this.handleReload} variant="outline">
                    <RefreshCw className="h-4 w-4 ml-2" />
                    إعادة تحميل الصفحة
                  </Button>
                  <Button onClick={this.handleGoHome} variant="outline">
                    <Home className="h-4 w-4 ml-2" />
                    الصفحة الرئيسية
                  </Button>
                </div>
              </div>
              
              {/* نص مساعد */}
              <p className="text-xs text-center text-muted-foreground">
                إذا استمرت المشكلة، يرجى التواصل مع الدعم الفني
              </p>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export function GlobalErrorBoundary({ children, fallback, onError }: Props) {
  return (
    <GlobalErrorBoundaryClass fallback={fallback} onError={onError}>
      {children}
    </GlobalErrorBoundaryClass>
  );
}

// HOC لإضافة error boundary للمكونات
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return function WrappedComponent(props: P) {
    return (
      <GlobalErrorBoundary fallback={fallback}>
        <Component {...props} />
      </GlobalErrorBoundary>
    );
  };
}
