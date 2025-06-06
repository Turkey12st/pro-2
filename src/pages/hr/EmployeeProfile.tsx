import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { EmployeeHRManagement } from "@/components/hr/EmployeeHRManagement";
import { EmployeeViolations } from "@/components/hr/EmployeeViolations";
import { EmployeeSalaries } from "@/components/hr/EmployeeSalaries";
import { EmployeeAttendance } from "@/components/hr/EmployeeAttendance";
import { EmployeeVacations } from "@/components/hr/EmployeeVacations";
import { EmployeeDocuments } from "@/components/hr/EmployeeDocuments";
import { EmployeeBenefits } from "@/components/hr/EmployeeBenefits";
import { EmployeeDeductions } from "@/components/hr/EmployeeDeductions";
import { AppLayout } from "@/components/AppLayout";
import { useEmployeeData } from "./hooks/useEmployeeProfileData";
import { 
  User, 
  IdCard, 
  Phone
} from "lucide-react";

export default function EmployeeProfile() {
  const { id } = useParams<{ id: string }>();
  const { employee, loading, error } = useEmployeeData(id!);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">جاري تحميل بيانات الموظف...</div>
        </div>
      </AppLayout>
    );
  }

  if (error || !employee) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-red-600">
            {error || "لم يتم العثور على بيانات الموظف"}
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        {/* Employee Header */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4 space-x-reverse">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                  {employee.photo_url ? (
                    <img 
                      src={employee.photo_url} 
                      alt={employee.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-8 h-8 text-gray-500" />
                  )}
                </div>
                <div>
                  <CardTitle className="text-2xl">{employee.name}</CardTitle>
                  <p className="text-lg text-muted-foreground">{employee.position}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline">{employee.department}</Badge>
                    <Badge variant={employee.contract_type === 'permanent' ? 'default' : 'secondary'}>
                      {employee.contract_type}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">رقم الموظف</p>
                <p className="font-mono">{employee.employment_number || employee.id}</p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Employee Details Tabs */}
        <Tabs defaultValue="personal" className="space-y-4">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="personal">البيانات الشخصية</TabsTrigger>
            <TabsTrigger value="hr">الموارد البشرية</TabsTrigger>
            <TabsTrigger value="attendance">الحضور</TabsTrigger>
            <TabsTrigger value="salaries">الرواتب</TabsTrigger>
            <TabsTrigger value="benefits">المزايا</TabsTrigger>
            <TabsTrigger value="violations">المخالفات</TabsTrigger>
            <TabsTrigger value="vacations">الإجازات</TabsTrigger>
            <TabsTrigger value="documents">المستندات</TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <IdCard className="h-5 w-5" />
                    المعلومات الأساسية
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">رقم الهوية</p>
                      <p className="font-mono">{employee.identity_number}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">الجنسية</p>
                      <p>{employee.nationality}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">تاريخ الميلاد</p>
                      <p>{employee.birth_date}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">تاريخ الالتحاق</p>
                      <p>{employee.joining_date}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    معلومات الاتصال
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">البريد الإلكتروني</p>
                    <p>{employee.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">رقم الهاتف</p>
                    <p>{employee.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">الفرع</p>
                    <p>{employee.branch || 'غير محدد'}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="hr">
            <EmployeeHRManagement employeeId={employee.id} employeeName={employee.name} />
          </TabsContent>

          <TabsContent value="attendance">
            <EmployeeAttendance employeeId={employee.id} />
          </TabsContent>

          <TabsContent value="salaries">
            <EmployeeSalaries employeeId={employee.id} />
          </TabsContent>

          <TabsContent value="benefits">
            <EmployeeBenefits employeeId={employee.id} />
          </TabsContent>

          <TabsContent value="violations">
            <EmployeeViolations employeeId={employee.id} />
          </TabsContent>

          <TabsContent value="vacations">
            <EmployeeVacations employeeId={employee.id} />
          </TabsContent>

          <TabsContent value="documents">
            <EmployeeDocuments employeeId={employee.id} documents={[]} />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
