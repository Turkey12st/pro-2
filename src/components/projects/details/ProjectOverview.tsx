
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { 
  Calendar, 
  DollarSign, 
  Users, 
  Clock, 
  Target,
  MapPin,
  User,
  Building
} from "lucide-react";

interface Project {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  start_date: string;
  end_date?: string;
  budget?: number;
  progress?: number;
  manager_id?: string;
  client_id?: string;
  team_members?: any[];
  stakeholders?: any[];
  estimated_hours?: number;
  actual_hours?: number;
  estimated_cost?: number;
  actual_cost?: number;
  revenue?: number;
  profit?: number;
  tags?: string[];
  notes?: string;
  created_at: string;
}

interface Client {
  id: string;
  name: string;
  type: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    country?: string;
  };
}

interface ProjectOverviewProps {
  project: Project;
  client?: Client;
}

export function ProjectOverview({ project, client }: ProjectOverviewProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'on-hold':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR'
    }).format(amount);
  };

  return (
    <div className="grid gap-6">
      {/* معلومات المشروع الأساسية */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              تفاصيل المشروع
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">اسم المشروع</p>
              <p className="font-medium">{project.title}</p>
            </div>
            {project.description && (
              <div>
                <p className="text-sm text-muted-foreground">الوصف</p>
                <p className="text-sm">{project.description}</p>
              </div>
            )}
            <div className="flex gap-2">
              <Badge className={getStatusColor(project.status)}>
                {project.status === 'completed' ? 'مكتمل' :
                 project.status === 'in-progress' ? 'جاري' :
                 project.status === 'on-hold' ? 'متوقف' :
                 project.status === 'cancelled' ? 'ملغي' : 'مخطط'}
              </Badge>
              <Badge className={getPriorityColor(project.priority)}>
                {project.priority === 'high' ? 'عالية' :
                 project.priority === 'medium' ? 'متوسطة' : 'منخفضة'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              الجدول الزمني
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">تاريخ البداية</p>
              <p className="font-medium">
                {format(new Date(project.start_date), 'PPP', { locale: ar })}
              </p>
            </div>
            {project.end_date && (
              <div>
                <p className="text-sm text-muted-foreground">تاريخ النهاية</p>
                <p className="font-medium">
                  {format(new Date(project.end_date), 'PPP', { locale: ar })}
                </p>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground mb-2">التقدم</p>
              <Progress value={project.progress || 0} className="w-full" />
              <p className="text-sm text-center mt-1">{project.progress || 0}%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* المعلومات المالية */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            المعلومات المالية
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">الميزانية</p>
              <p className="text-lg font-semibold">
                {project.budget ? formatCurrency(project.budget) : 'غير محدد'}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">التكلفة المقدرة</p>
              <p className="text-lg font-semibold">
                {project.estimated_cost ? formatCurrency(project.estimated_cost) : 'غير محدد'}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">التكلفة الفعلية</p>
              <p className="text-lg font-semibold">
                {project.actual_cost ? formatCurrency(project.actual_cost) : 'غير محدد'}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">الربح</p>
              <p className="text-lg font-semibold">
                {project.profit ? formatCurrency(project.profit) : 'غير محدد'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* معلومات العميل */}
      {client && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              معلومات العميل
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">اسم العميل</p>
                <p className="font-medium">{client.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">نوع العميل</p>
                <p className="font-medium">{client.type}</p>
              </div>
              {client.contact_person && (
                <div>
                  <p className="text-sm text-muted-foreground">الشخص المسؤول</p>
                  <p className="font-medium">{client.contact_person}</p>
                </div>
              )}
              {client.email && (
                <div>
                  <p className="text-sm text-muted-foreground">البريد الإلكتروني</p>
                  <p className="font-medium" dir="ltr">{client.email}</p>
                </div>
              )}
              {client.phone && (
                <div>
                  <p className="text-sm text-muted-foreground">رقم الهاتف</p>
                  <p className="font-medium" dir="ltr">{client.phone}</p>
                </div>
              )}
              {client.address && typeof client.address === 'object' && !Array.isArray(client.address) && (
                <div className="md:col-span-2">
                  <p className="text-sm text-muted-foreground">العنوان</p>
                  <p className="font-medium">
                    {client.address.street && `${client.address.street}, `}
                    {client.address.city && `${client.address.city}, `}
                    {client.address.country && client.address.country}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ساعات العمل */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            ساعات العمل
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">الساعات المقدرة</p>
              <p className="text-lg font-semibold">
                {project.estimated_hours || 0} ساعة
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">الساعات الفعلية</p>
              <p className="text-lg font-semibold">
                {project.actual_hours || 0} ساعة
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* فريق العمل */}
      {project.team_members && project.team_members.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              فريق العمل
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {project.team_members.map((member: any, index: number) => (
                <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                  <User className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{member.name || `عضو ${index + 1}`}</p>
                    <p className="text-sm text-muted-foreground">{member.role || 'غير محدد'}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* العلامات والملاحظات */}
      {(project.tags?.length || project.notes) && (
        <Card>
          <CardHeader>
            <CardTitle>معلومات إضافية</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {project.tags && project.tags.length > 0 && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">العلامات</p>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag, index) => (
                    <Badge key={index} variant="outline">{tag}</Badge>
                  ))}
                </div>
              </div>
            )}
            {project.notes && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">الملاحظات</p>
                <p className="text-sm bg-muted p-3 rounded-lg">{project.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
