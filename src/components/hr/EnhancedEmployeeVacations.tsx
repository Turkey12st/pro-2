import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { format, differenceInDays, parseISO } from "date-fns";
import { Calendar, Plus, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface EnhancedEmployeeVacationsProps {
  employeeId?: string;
}

interface VacationBalance {
  annual_days_total: number;
  annual_days_used: number;
  annual_days_remaining: number;
  sick_days_total: number;
  sick_days_used: number;
  sick_days_remaining: number;
  emergency_days_total: number;
  emergency_days_used: number;
  emergency_days_remaining: number;
  last_calculation_date: string;
}

interface VacationRequest {
  id: string;
  vacation_type: string;
  start_date: string;
  end_date: string;
  days_count: number;
  reason?: string;
  status: string;
  approved_by?: string;
  approved_date?: string;
  notes?: string;
  created_at: string;
}

export function EnhancedEmployeeVacations({ employeeId }: EnhancedEmployeeVacationsProps) {
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // جلب رصيد الإجازات
  const { data: vacationBalance } = useQuery({
    queryKey: ["vacation-balance", employeeId],
    queryFn: async () => {
      if (!employeeId) return null;
      
      const { data, error } = await supabase
        .from("vacation_balance")
        .select("*")
        .eq("employee_id", employeeId)
        .single();
        
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!employeeId,
  });

  // جلب طلبات الإجازات
  const { data: vacationRequests, isLoading } = useQuery({
    queryKey: ["vacation-requests", employeeId],
    queryFn: async () => {
      if (!employeeId) return [];
      
      const { data, error } = await supabase
        .from("vacation_requests")
        .select("*")
        .eq("employee_id", employeeId)
        .order("created_at", { ascending: false });
        
      if (error) throw error;
      return data || [];
    },
    enabled: !!employeeId,
  });

  // جلب تاريخ التعيين لحساب الاستحقاق
  const { data: employee } = useQuery({
    queryKey: ["employee-joining-date", employeeId],
    queryFn: async () => {
      if (!employeeId) return null;
      
      const { data, error } = await supabase
        .from("employees")
        .select("joining_date, name")
        .eq("id", employeeId)
        .single();
        
      if (error) throw error;
      return data;
    },
    enabled: !!employeeId,
  });

  const getVacationTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      'annual': 'سنوية',
      'sick': 'مرضية', 
      'emergency': 'اضطرارية',
      'maternity': 'أمومة',
      'paternity': 'أبوة',
      'hajj': 'حج',
      'study': 'دراسية'
    };
    return types[type] || type;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">قيد المراجعة</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">موافق عليها</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">مرفوضة</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const calculateYearsSinceJoining = () => {
    if (!employee?.joining_date) return 0;
    const joiningDate = parseISO(employee.joining_date);
    const now = new Date();
    return differenceInDays(now, joiningDate) / 365;
  };

  const getAnnualVacationEntitlement = () => {
    const yearsWorked = calculateYearsSinceJoining();
    if (yearsWorked < 1) return Math.floor(yearsWorked * 21);
    // نظام العمل السعودي: 21 يوماً، و30 يوماً بعد إتمام 5 سنوات خدمة
    return yearsWorked >= 5 ? 30 : 21;
  };

  const [newRequest, setNewRequest] = useState({
    vacation_type: "annual",
    start_date: "",
    end_date: "",
    reason: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitRequest = async () => {
    if (!employeeId) {
      toast({ variant: "destructive", title: "تعذر الإرسال", description: "لم يتم تحديد الموظف" });
      return;
    }
    if (!newRequest.start_date || !newRequest.end_date) {
      toast({ variant: "destructive", title: "بيانات ناقصة", description: "يرجى تحديد تاريخ البداية والنهاية" });
      return;
    }
    const days = differenceInDays(parseISO(newRequest.end_date), parseISO(newRequest.start_date)) + 1;
    if (days <= 0) {
      toast({ variant: "destructive", title: "تواريخ غير صحيحة", description: "تاريخ النهاية يجب أن يكون بعد تاريخ البداية" });
      return;
    }
    try {
      setIsSubmitting(true);
      const { error } = await supabase.from("vacation_requests").insert({
        employee_id: employeeId,
        vacation_type: newRequest.vacation_type,
        start_date: newRequest.start_date,
        end_date: newRequest.end_date,
        days_count: days,
        reason: newRequest.reason || null,
        status: "pending",
      } as any);
      if (error) throw error;
      toast({ title: "تم إرسال الطلب", description: `طلب إجازة لمدة ${days} يوم بانتظار الاعتماد` });
      setIsRequestDialogOpen(false);
      setNewRequest({ vacation_type: "annual", start_date: "", end_date: "", reason: "" });
      queryClient.invalidateQueries({ queryKey: ["vacation-requests", employeeId] });
    } catch (e: any) {
      toast({ variant: "destructive", title: "خطأ", description: e?.message || "فشل إرسال الطلب" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const VacationBalanceCard = ({ title, total, used, remaining, color }: {
    title: string;
    total: number;
    used: number;
    remaining: number;
    color: string;
  }) => (
    <div className="bg-gray-50 p-4 rounded-lg">
      <h4 className="font-medium text-gray-900 mb-2">{title}</h4>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>المستخدم: {used} يوم</span>
          <span>المتبقي: {remaining} يوم</span>
        </div>
        <Progress 
          value={(used / total) * 100} 
          className="h-2"
          style={{"--progress-foreground": color} as React.CSSProperties}
        />
        <div className="text-xs text-gray-600">
          الإجمالي: {total} يوم
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* رصيد الإجازات */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            رصيد الإجازات
          </CardTitle>
        </CardHeader>
        <CardContent>
          {vacationBalance ? (
            <div className="grid md:grid-cols-3 gap-4">
              <VacationBalanceCard
                title="الإجازات السنوية"
                total={vacationBalance.annual_days_total}
                used={vacationBalance.annual_days_used}
                remaining={vacationBalance.annual_days_remaining}
                color="hsl(142 76% 36%)"
              />
              <VacationBalanceCard
                title="الإجازات المرضية"
                total={vacationBalance.sick_days_total}
                used={vacationBalance.sick_days_used}
                remaining={vacationBalance.sick_days_remaining}
                color="hsl(221 83% 53%)"
              />
              <VacationBalanceCard
                title="الإجازات الاضطرارية"
                total={vacationBalance.emergency_days_total}
                used={vacationBalance.emergency_days_used}
                remaining={vacationBalance.emergency_days_remaining}
                color="hsl(25 95% 53%)"
              />
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted-foreground">لم يتم حساب رصيد الإجازات بعد</p>
            </div>
          )}
          
          {employee && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">معلومات الاستحقاق</h4>
              <div className="text-sm text-blue-800 space-y-1">
                <p><strong>تاريخ التعيين:</strong> {format(parseISO(employee.joining_date), "yyyy/MM/dd")}</p>
                <p><strong>سنوات الخدمة:</strong> {calculateYearsSinceJoining().toFixed(1)} سنة</p>
                <p><strong>الاستحقاق السنوي:</strong> {getAnnualVacationEntitlement()} يوم</p>
                <p className="text-xs mt-2">
                  حسب نظام العمل السعودي: 21 يوم سنوياً بعد إكمال السنة الأولى
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* سجل طلبات الإجازات */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            سجل طلبات الإجازات
          </CardTitle>
          <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" disabled={!employeeId}>
                <Plus className="h-4 w-4 me-2" />
                طلب إجازة جديدة
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[480px]">
              <DialogHeader>
                <DialogTitle>طلب إجازة جديدة</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>نوع الإجازة</Label>
                  <Select
                    value={newRequest.vacation_type}
                    onValueChange={(v) => setNewRequest((p) => ({ ...p, vacation_type: v }))}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="annual">سنوية</SelectItem>
                      <SelectItem value="sick">مرضية</SelectItem>
                      <SelectItem value="emergency">اضطرارية</SelectItem>
                      <SelectItem value="maternity">أمومة</SelectItem>
                      <SelectItem value="paternity">أبوة</SelectItem>
                      <SelectItem value="hajj">حج</SelectItem>
                      <SelectItem value="study">دراسية</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>من تاريخ</Label>
                    <Input type="date" value={newRequest.start_date} onChange={(e) => setNewRequest((p) => ({ ...p, start_date: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>إلى تاريخ</Label>
                    <Input type="date" value={newRequest.end_date} onChange={(e) => setNewRequest((p) => ({ ...p, end_date: e.target.value }))} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>السبب (اختياري)</Label>
                  <Textarea value={newRequest.reason} onChange={(e) => setNewRequest((p) => ({ ...p, reason: e.target.value }))} />
                </div>
                <Button className="w-full" onClick={handleSubmitRequest} disabled={isSubmitting}>
                  {isSubmitting ? "جارٍ الإرسال..." : "إرسال الطلب"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {!isLoading && vacationRequests && vacationRequests.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>النوع</TableHead>
                  <TableHead>تاريخ البداية</TableHead>
                  <TableHead>تاريخ النهاية</TableHead>
                  <TableHead>عدد الأيام</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>معتمد من</TableHead>
                  <TableHead>ملاحظات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vacationRequests.map((request: VacationRequest) => (
                  <TableRow key={request.id}>
                    <TableCell>{getVacationTypeLabel(request.vacation_type)}</TableCell>
                    <TableCell>{format(parseISO(request.start_date), "yyyy/MM/dd")}</TableCell>
                    <TableCell>{format(parseISO(request.end_date), "yyyy/MM/dd")}</TableCell>
                    <TableCell>{request.days_count} يوم</TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell>{request.approved_by || "-"}</TableCell>
                    <TableCell>{request.notes || "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-muted-foreground">لا توجد طلبات إجازات مسجلة</p>
              <p className="text-sm text-muted-foreground mt-2">
                اضغط على "طلب إجازة جديدة" لإضافة طلب جديد
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}