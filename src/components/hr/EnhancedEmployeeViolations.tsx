import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Plus, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface EnhancedEmployeeViolationsProps {
  employeeId?: string;
}

interface ViolationType {
  id: string;
  category: string;
  violation_name: string;
  severity_level: number;
  first_violation_penalty: string;
  second_violation_penalty: string;
  third_violation_penalty: string;
  deduction_percentage: number;
  legal_reference: string;
}

interface Violation {
  id: string;
  employee_id: string;
  type: string;
  description: string;
  severity: string;
  status: string;
  action_taken: string;
  date: string;
  created_at: string;
}

export function EnhancedEmployeeViolations({ employeeId }: EnhancedEmployeeViolationsProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedViolationType, setSelectedViolationType] = useState<ViolationType | null>(null);
  const [newViolation, setNewViolation] = useState({
    violation_type_id: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    custom_action: ''
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // جلب أنواع المخالفات
  const { data: violationTypes } = useQuery({
    queryKey: ["violation-types"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("violation_types")
        .select("*")
        .eq("is_active", true)
        .order("category", { ascending: true });
        
      if (error) throw error;
      return data || [];
    },
  });

  // جلب مخالفات الموظف
  const { data: violations, isLoading } = useQuery({
    queryKey: ["employee-violations", employeeId],
    queryFn: async () => {
      if (!employeeId) return [];
      
      const { data, error } = await supabase
        .from("employee_violations")
        .select("*")
        .eq("employee_id", employeeId)
        .order("date", { ascending: false });
        
      if (error) throw error;
      return data || [];
    },
    enabled: !!employeeId,
  });

  // عد المخالفات السابقة لنفس النوع
  const getPreviousViolationsCount = (violationType: string) => {
    if (!violations) return 0;
    return violations.filter((v: Violation) => v.type === violationType).length;
  };

  const handleViolationTypeChange = (typeId: string) => {
    const type = violationTypes?.find((vt: ViolationType) => vt.id === typeId);
    setSelectedViolationType(type || null);
    setNewViolation({...newViolation, violation_type_id: typeId});
  };

  const getRecommendedAction = () => {
    if (!selectedViolationType) return '';
    
    const previousCount = getPreviousViolationsCount(selectedViolationType.violation_name);
    
    switch (previousCount) {
      case 0:
        return selectedViolationType.first_violation_penalty;
      case 1:
        return selectedViolationType.second_violation_penalty;
      case 2:
      default:
        return selectedViolationType.third_violation_penalty;
    }
  };

  const handleAddViolation = async () => {
    if (!employeeId || !selectedViolationType || !newViolation.description) {
      toast({
        title: "خطأ في البيانات",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive"
      });
      return;
    }

    try {
      const recommendedAction = getRecommendedAction();
      const actionTaken = newViolation.custom_action || recommendedAction;
      
      // إضافة المخالفة
      const { error: violationError } = await supabase
        .from('employee_violations')
        .insert({
          employee_id: employeeId,
          type: selectedViolationType.violation_name,
          description: newViolation.description,
          severity: selectedViolationType.severity_level === 1 ? 'low' : 
                   selectedViolationType.severity_level === 2 ? 'medium' : 'high',
          action_taken: actionTaken,
          date: newViolation.date,
          status: 'active'
        });

      if (violationError) throw violationError;

      // إضافة خصم من الراتب إذا كان مطلوباً
      if (selectedViolationType.deduction_percentage > 0) {
        const { error: deductionError } = await supabase
          .from('salary_deductions')
          .insert({
            employee_id: employeeId,
            amount: selectedViolationType.deduction_percentage, // يتم حساب المبلغ الفعلي لاحقاً
            reason: `خصم نتيجة مخالفة: ${selectedViolationType.violation_name}`,
            date: newViolation.date,
            auto_generated: true
          });

        if (deductionError) {
          console.error('Error creating salary deduction:', deductionError);
        }
      }

      toast({
        title: "تم إضافة المخالفة بنجاح",
        description: `تم تسجيل المخالفة وتطبيق الإجراء: ${actionTaken}`
      });

      setIsAddDialogOpen(false);
      setNewViolation({
        violation_type_id: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        custom_action: ''
      });
      setSelectedViolationType(null);

      queryClient.invalidateQueries({ queryKey: ["employee-violations", employeeId] });
    } catch (error: any) {
      toast({
        title: "خطأ في إضافة المخالفة",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'low':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">خفيفة</Badge>;
      case 'medium':
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-200">متوسطة</Badge>;
      case 'high':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">شديدة</Badge>;
      default:
        return <Badge variant="outline">{severity}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">نشطة</Badge>;
      case 'resolved':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">محلولة</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          المخالفات والإجراءات التأديبية
        </CardTitle>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              إضافة مخالفة
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>إضافة مخالفة جديدة</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">نوع المخالفة</label>
                <Select value={newViolation.violation_type_id} onValueChange={handleViolationTypeChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر نوع المخالفة" />
                  </SelectTrigger>
                  <SelectContent>
                    {violationTypes?.map((type: ViolationType) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.category} - {type.violation_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedViolationType && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">معلومات المخالفة</h4>
                  <div className="text-sm text-blue-800 space-y-1">
                    <p><strong>الفئة:</strong> {selectedViolationType.category}</p>
                    <p><strong>مستوى الخطورة:</strong> {
                      selectedViolationType.severity_level === 1 ? 'خفيف' :
                      selectedViolationType.severity_level === 2 ? 'متوسط' : 'شديد'
                    }</p>
                    <p><strong>المرجع القانوني:</strong> {selectedViolationType.legal_reference}</p>
                    <p><strong>الإجراء المقترح:</strong> {getRecommendedAction()}</p>
                    {selectedViolationType.deduction_percentage > 0 && (
                      <p><strong>نسبة الخصم:</strong> {selectedViolationType.deduction_percentage}%</p>
                    )}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">وصف المخالفة</label>
                <Textarea
                  value={newViolation.description}
                  onChange={(e) => setNewViolation({...newViolation, description: e.target.value})}
                  placeholder="اكتب تفاصيل المخالفة وظروفها..."
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">تاريخ المخالفة</label>
                <Input
                  type="date"
                  value={newViolation.date}
                  onChange={(e) => setNewViolation({...newViolation, date: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">إجراء مخصص (اختياري)</label>
                <Input
                  value={newViolation.custom_action}
                  onChange={(e) => setNewViolation({...newViolation, custom_action: e.target.value})}
                  placeholder="إذا كنت تريد إجراءً مختلفاً عن المقترح"
                />
              </div>

              <Button onClick={handleAddViolation} className="w-full">
                تسجيل المخالفة
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {!isLoading && violations && violations.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>التاريخ</TableHead>
                <TableHead>نوع المخالفة</TableHead>
                <TableHead>الوصف</TableHead>
                <TableHead>الخطورة</TableHead>
                <TableHead>الإجراء المتخذ</TableHead>
                <TableHead>الحالة</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {violations.map((violation: Violation) => (
                <TableRow key={violation.id}>
                  <TableCell>{format(new Date(violation.date), "yyyy/MM/dd")}</TableCell>
                  <TableCell>{violation.type}</TableCell>
                  <TableCell className="max-w-xs">
                    <div className="truncate" title={violation.description}>
                      {violation.description}
                    </div>
                  </TableCell>
                  <TableCell>{getSeverityBadge(violation.severity)}</TableCell>
                  <TableCell>{violation.action_taken}</TableCell>
                  <TableCell>{getStatusBadge(violation.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-muted-foreground">لا توجد مخالفات مسجلة لهذا الموظف</p>
            <p className="text-sm text-muted-foreground mt-2">
              هذا أمر جيد! يمكنك إضافة مخالفة جديدة إذا لزم الأمر
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}