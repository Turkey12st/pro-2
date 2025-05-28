import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Employee, mapDbEmployeeToEmployee } from "@/types/hr";
import AppLayout from "@/components/AppLayout";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ChevronRight, ArrowLeft, UserRound, FileText, Calendar, Clock, BellIcon, AlertCircle, BadgeCheck, Settings } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { formatSalary } from "@/utils/formatters";
import { EmployeeDocuments } from "@/components/hr/EmployeeDocuments";
import { EmployeeSalaries } from "@/components/hr/EmployeeSalaries";
import { EmployeeDeductions } from "@/components/hr/EmployeeDeductions";
import { EmployeeBenefits } from "@/components/hr/EmployeeBenefits";
import { EmployeeVacations } from "@/components/hr/EmployeeVacations";
import { EmployeeAttendance } from "@/components/hr/EmployeeAttendance";
import { EmployeeViolations } from "@/components/hr/EmployeeViolations";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export default function EmployeeProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("info");

  const { data: employee, isLoading, error } = useQuery({
    queryKey: ["employee", id],
    queryFn: async () => {
      if (!id) throw new Error("No employee ID provided");
      
      const { data, error } = await supabase
        .from("employees")
        .select("*")
        .eq("id", id)
        .single();
      
      if (error) throw error;
      if (!data) throw new Error("Employee not found");
      
      return mapDbEmployeeToEmployee(data);
    },
  });

  if (error) {
    toast({
      title: "خطأ في تحميل بيانات الموظف",
      description: "حدث خطأ أثناء محاولة تحميل بيانات الموظف",
      variant: "destructive",
    });
  }

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 space-x-reverse">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate("/hr")}
              className="flex items-center"
            >
              <ArrowLeft className="h-4 w-4 ml-2" />
              <span>العودة</span>
            </Button>
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold tracking-tight">
                {isLoading ? <Skeleton className="h-8 w-40" /> : employee?.name || "بيانات الموظف"}
              </h1>
              <div className="flex items-center text-sm text-muted-foreground">
                <span>الموارد البشرية</span>
                <ChevronRight className="h-4 w-4 mx-1" />
                <span>الموظفين</span>
                <ChevronRight className="h-4 w-4 mx-1" />
                <span>{isLoading ? <Skeleton className="h-4 w-20" /> : employee?.name}</span>
              </div>
            </div>
          </div>
          <div className="flex space-x-2 space-x-reverse">
            <Button 
              variant="outline" 
              onClick={() => navigate(`/hr/employees/edit/${id}`)}
            >
              تعديل البيانات
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid gap-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
        ) : (
          <>
            <EmployeeHeaderCard employee={employee} />
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="overflow-x-auto flex-nowrap mb-4">
                <TabsTrigger value="info" className="flex items-center gap-2">
                  <UserRound className="h-4 w-4" />
                  <span>المعلومات الشخصية</span>
                </TabsTrigger>
                <TabsTrigger value="documents" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span>المستندات</span>
                </TabsTrigger>
                <TabsTrigger value="hr-management" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  <span>إدارة الموارد البشرية</span>
                </TabsTrigger>
                <TabsTrigger value="salaries" className="flex items-center gap-2">
                  <BadgeCheck className="h-4 w-4" />
                  <span>الرواتب</span>
                </TabsTrigger>
                <TabsTrigger value="vacations" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>الإجازات</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="info" className="space-y-4">
                <EmployeeDetailsCards employee={employee} />
              </TabsContent>
              
              <TabsContent value="documents">
                <EmployeeDocuments employeeId={id} documents={employee?.documents || []} />
              </TabsContent>
              
              <TabsContent value="hr-management">
                <EmployeeHRManagement 
                  employeeId={id!} 
                  employeeName={employee?.name || ''} 
                />
              </TabsContent>
              
              <TabsContent value="salaries">
                <EmployeeSalaries employeeId={id} employee={employee} />
              </TabsContent>
              
              <TabsContent value="vacations">
                <EmployeeVacations employeeId={id} />
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </AppLayout>
  );
}

interface EmployeeHeaderCardProps {
  employee?: Employee;
}

function EmployeeHeaderCard({ employee }: EmployeeHeaderCardProps) {
  if (!employee) return null;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
          <div className="flex-shrink-0">
            {employee.photoUrl ? (
              <img 
                src={employee.photoUrl} 
                alt={employee.name} 
                className="h-32 w-32 rounded-full object-cover border-4 border-background" 
              />
            ) : (
              <div className="h-32 w-32 rounded-full bg-muted flex items-center justify-center border-4 border-background">
                <UserRound className="h-16 w-16 text-muted-foreground" />
              </div>
            )}
          </div>
          
          <div className="flex-1 text-center md:text-right">
            <h2 className="text-2xl font-bold">{employee.name}</h2>
            <p className="text-muted-foreground">{employee.position || "غير محدد"}</p>
            <p className="text-muted-foreground">{employee.department || "غير محدد"}</p>
            
            <div className="mt-2 flex flex-wrap justify-center md:justify-start gap-2">
              <Badge variant="outline">{employee.nationality || "غير محدد"}</Badge>
              <Badge variant="outline">{employee.contractType || "غير محدد"}</Badge>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row gap-6 md:mr-auto">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">الراتب الشهري</p>
              <p className="text-2xl font-semibold">{formatSalary(employee.salary || 0)}</p>
            </div>
            
            <Separator orientation="vertical" className="hidden md:block h-auto" />
            
            <div className="text-center">
              <p className="text-sm text-muted-foreground">تاريخ التعيين</p>
              <p className="text-lg font-semibold">
                {employee.joiningDate ? format(new Date(employee.joiningDate), "yyyy/MM/dd") : "غير محدد"}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface EmployeeDetailsCardsProps {
  employee: Employee;
}

function EmployeeDetailsCards({ employee }: EmployeeDetailsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">المعلومات الشخصية</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">الاسم</p>
              <p>{employee.name || "غير محدد"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">رقم الهوية</p>
              <p>{employee.identityNumber || "غير محدد"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">تاريخ الميلاد</p>
              <p>{employee.birthDate ? format(new Date(employee.birthDate), "yyyy/MM/dd") : "غير محدد"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">الجنسية</p>
              <p>{employee.nationality || "غير محدد"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">البريد الإلكتروني</p>
              <p dir="ltr" className="text-right">{employee.email || "غير محدد"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">رقم الهاتف</p>
              <p dir="ltr" className="text-right">{employee.phone || "غير محدد"}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">معلومات الوظيفة</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">المسمى الوظيفي</p>
              <p>{employee.position || "غير محدد"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">القسم</p>
              <p>{employee.department || "غير محدد"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">الفرع</p>
              <p>{employee.branch || "غير محدد"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">نوع العقد</p>
              <p>{employee.contractType === "full-time" ? "دوام كامل" : 
                  employee.contractType === "part-time" ? "دوام جزئي" : 
                  employee.contractType === "contract" ? "عقد" : "غير محدد"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">الرقم الوظيفي</p>
              <p>{employee.employmentNumber || "غير محدد"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">تاريخ التعيين</p>
              <p>{employee.joiningDate ? format(new Date(employee.joiningDate), "yyyy/MM/dd") : "غير محدد"}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">التفاصيل المالية</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">الراتب الأساسي</p>
              <p>{formatSalary(employee.baseSalary || 0)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">بدل السكن</p>
              <p>{formatSalary(employee.housingAllowance || 0)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">بدل المواصلات</p>
              <p>{formatSalary(employee.transportationAllowance || 0)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">إجمالي الراتب</p>
              <p className="font-semibold">{formatSalary(employee.salary || 0)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">اشتراك التأمينات</p>
              <p>{formatSalary(employee.gosiSubscription || 0)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">مساهمة الموظف في التأمينات</p>
              <p>{formatSalary(employee.employeeGosiContribution || 0)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">التكاليف الإضافية</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">مساهمة الشركة في التأمينات</p>
              <p>{formatSalary(employee.companyGosiContribution || 0)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">تكلفة التأمين الطبي</p>
              <p>{formatSalary(employee.medicalInsuranceCost || 0)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">رسوم التأشيرة</p>
              <p>{formatSalary(employee.visaFees || 0)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">رسوم النقل</p>
              <p>{formatSalary(employee.transferFees || 0)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">رسوم العمل</p>
              <p>{formatSalary(employee.laborFees || 0)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
