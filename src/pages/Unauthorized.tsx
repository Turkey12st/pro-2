import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldX, Home, ArrowRight } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4" dir="rtl">
      <Card className="w-full max-w-md text-center shadow-lg">
        <CardHeader className="space-y-4">
          <div className="mx-auto w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center">
            <ShieldX className="h-10 w-10 text-destructive" />
          </div>
          <CardTitle className="text-2xl font-bold">غير مصرح لك بالوصول</CardTitle>
          <CardDescription className="text-base">
            ليس لديك الصلاحيات الكافية للوصول إلى هذه الصفحة.
            إذا كنت تعتقد أن هذا خطأ، يرجى التواصل مع مدير النظام.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3">
            <Button asChild className="w-full">
              <Link to="/dashboard">
                <Home className="ml-2 h-4 w-4" />
                العودة للوحة التحكم
              </Link>
            </Button>
            
            <Button variant="outline" asChild className="w-full">
              <Link to="/main">
                <ArrowRight className="ml-2 h-4 w-4" />
                الصفحة الرئيسية
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
