
import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { formatDate, formatSalary } from '@/utils/formatters';
import { Edit, Mail, Phone, MapPin, Calendar, DollarSign, FileText } from 'lucide-react';
import { AttendanceManagement } from '@/components/hr/AttendanceManagement';
import { BenefitsManagement } from '@/components/hr/BenefitsManagement';
import { DeductionsManagement } from '@/components/hr/DeductionsManagement';
import { ViolationsManagement } from '@/components/hr/ViolationsManagement';
import AppLayout from '@/components/AppLayout';

export default function EmployeeProfile() {
  const { id } = useParams<{ id: string }>();

  const { data: employee, isLoading, error } = useQuery({
    queryKey: ['employee', id],
    queryFn: async () => {
      if (!id) throw new Error('معرف الموظف مطلوب');
      
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">جاري تحميل بيانات الموظف...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error || !employee) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-destructive mb-2">خطأ في تحميل البيانات</h2>
            <p className="text-muted-foreground">لم يتم العثور على بيانات الموظف</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  const getEmployeeTypeBadge = (type: string) => {
    switch (type) {
      case 'saudi':
        return <Badge className="bg-green-100 text-green-800">سعودي</Badge>;
      case 'expat':
        return <Badge className="bg-blue-100 text-blue-800">وافد</Badge>;
      default:
        return <Badge variant="outline">{type || "غير محدد"}</Badge>;
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        {/* Header Section */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4 space-x-reverse">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={employee.photo_url || ''} alt={employee.name} />
                  <AvatarFallback className="text-lg">
                    {employee.name?.charAt(0) || 'م'}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold">{employee.name}</h1>
                    {getEmployeeTypeBadge(employee.employee_type)}
                  </div>
                  <p className="text-muted-foreground text-lg">{employee.position}</p>
                  <p className="text-sm text-muted-foreground">{employee.department}</p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 ml-2" />
                تعديل البيانات
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{employee.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{employee.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">رقم الهوية: {employee.identity_number}</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">تاريخ الالتحاق: {formatDate(employee.joining_date)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">الراتب: {formatSalary(employee.salary)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm">الجنسية: {employee.nationality}</span>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium">نوع العقد:</span>
                  <span className="text-sm mr-2">{
                    employee.contract_type === 'full-time' ? 'دوام كامل' :
                    employee.contract_type === 'part-time' ? 'دوام جزئي' :
                    employee.contract_type === 'contract' ? 'عقد' : employee.contract_type
                  }</span>
                </div>
                {employee.branch && (
                  <div>
                    <span className="text-sm font-medium">الفرع:</span>
                    <span className="text-sm mr-2">{employee.branch}</span>
                  </div>
                )}
                {employee.employment_number && (
                  <div>
                    <span className="text-sm font-medium">رقم الموظف:</span>
                    <span className="text-sm mr-2">{employee.employment_number}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs Section */}
        <Tabs defaultValue="attendance" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="attendance">الحضور والانصراف</TabsTrigger>
            <TabsTrigger value="benefits">الاستحقاقات</TabsTrigger>
            <TabsTrigger value="deductions">الخصومات</TabsTrigger>
            <TabsTrigger value="violations">المخالفات</TabsTrigger>
          </TabsList>

          <TabsContent value="attendance">
            <AttendanceManagement employeeId={id} />
          </TabsContent>

          <TabsContent value="benefits">
            <BenefitsManagement employeeId={id} />
          </TabsContent>

          <TabsContent value="deductions">
            <DeductionsManagement employeeId={id} />
          </TabsContent>

          <TabsContent value="violations">
            <ViolationsManagement employeeId={id} />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
