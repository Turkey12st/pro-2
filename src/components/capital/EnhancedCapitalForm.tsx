import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { formatSalary } from "@/utils/formatters";
import { format } from "date-fns";
import { Building2, TrendingUp, TrendingDown, Users, Plus, History } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export function EnhancedCapitalForm() {
  const [isMovementDialogOpen, setIsMovementDialogOpen] = useState(false);
  const [isPartnersDialogOpen, setIsPartnersDialogOpen] = useState(false);
  const [newMovement, setNewMovement] = useState({
    movement_type: '',
    amount: 0,
    reason: '',
    description: '',
    movement_date: new Date().toISOString().split('T')[0]
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // جلب بيانات رأس المال الحالي
  const { data: capitalData, isLoading: capitalLoading } = useQuery({
    queryKey: ["capital-management"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("capital_management")
        .select("*")
        .order("fiscal_year", { ascending: false })
        .limit(1)
        .single();
        
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
  });

  // جلب حركات رأس المال
  const { data: movements } = useQuery({
    queryKey: ["capital-movements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("capital_movements")
        .select("*")
        .order("movement_date", { ascending: false })
        .limit(10);
        
      if (error) throw error;
      return data || [];
    },
  });

  // جلب توزيع الشركاء
  const { data: partnersDistribution } = useQuery({
    queryKey: ["partners-distribution"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("partner_capital_distribution")
        .select("*")
        .order("ownership_percentage", { ascending: false });
        
      if (error) throw error;
      return data || [];
    },
  });

  const handleCapitalMovement = async () => {
    if (!newMovement.movement_type || !newMovement.amount || !newMovement.reason) {
      toast({
        title: "خطأ في البيانات",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive"
      });
      return;
    }

    try {
      // إضافة حركة رأس المال
      const { error: movementError } = await supabase
        .from('capital_movements')
        .insert({
          movement_type: newMovement.movement_type,
          amount: newMovement.amount,
          reason: newMovement.reason,
          description: newMovement.description,
          movement_date: newMovement.movement_date
        });

      if (movementError) throw movementError;

      // تحديث رأس المال
      if (capitalData) {
        const newTotalCapital = newMovement.movement_type === 'increase' 
          ? capitalData.total_capital + newMovement.amount
          : capitalData.total_capital - newMovement.amount;

        const { error: capitalError } = await supabase
          .from('capital_management')
          .update({
            total_capital: newTotalCapital,
            available_capital: newTotalCapital * 0.8, // مثال: 80% متاح
            last_movement_date: newMovement.movement_date
          })
          .eq('fiscal_year', capitalData.fiscal_year);

        if (capitalError) throw capitalError;
      }

      toast({
        title: "تم تحديث رأس المال بنجاح",
        description: `تم ${newMovement.movement_type === 'increase' ? 'زيادة' : 'تخفيض'} رأس المال بمبلغ ${formatSalary(newMovement.amount)}`
      });

      setIsMovementDialogOpen(false);
      setNewMovement({
        movement_type: '',
        amount: 0,
        reason: '',
        description: '',
        movement_date: new Date().toISOString().split('T')[0]
      });

      queryClient.invalidateQueries({ queryKey: ["capital-management"] });
      queryClient.invalidateQueries({ queryKey: ["capital-movements"] });
    } catch (error: any) {
      toast({
        title: "خطأ في تحديث رأس المال",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getMovementTypeIcon = (type: string) => {
    return type === 'increase' ? (
      <TrendingUp className="h-4 w-4 text-green-600" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-600" />
    );
  };

  const getMovementTypeBadge = (type: string) => {
    return type === 'increase' ? (
      <Badge className="bg-green-100 text-green-800 hover:bg-green-200">زيادة</Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800 hover:bg-red-200">تخفيض</Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* بطاقة رأس المال الحالي */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            إدارة رأس المال
          </CardTitle>
        </CardHeader>
        <CardContent>
          {capitalData ? (
            <div className="space-y-4">
              {/* الإحصائيات الأساسية */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600">إجمالي رأس المال</p>
                      <p className="text-2xl font-bold text-blue-900">
                        {formatSalary(capitalData.total_capital)}
                      </p>
                    </div>
                    <Building2 className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600">رأس المال المتاح</p>
                      <p className="text-2xl font-bold text-green-900">
                        {formatSalary(capitalData.available_capital)}
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  </div>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-yellow-600">رأس المال المحجوز</p>
                      <p className="text-2xl font-bold text-yellow-900">
                        {formatSalary(capitalData.reserved_capital)}
                      </p>
                    </div>
                    <Users className="h-8 w-8 text-yellow-600" />
                  </div>
                </div>
              </div>

              {/* معلومات إضافية */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">معلومات إضافية</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">السنة المالية:</span>
                    <span className="font-medium ml-2">{capitalData.fiscal_year}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">تاريخ بداية رأس المال:</span>
                    <span className="font-medium ml-2">
                      {capitalData.start_date ? format(new Date(capitalData.start_date), "yyyy/MM/dd") : "غير محدد"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">آخر حركة:</span>
                    <span className="font-medium ml-2">
                      {capitalData.last_movement_date ? format(new Date(capitalData.last_movement_date), "yyyy/MM/dd") : "لا توجد حركات"}
                    </span>
                  </div>
                </div>
              </div>

              {/* أزرار الإجراءات */}
              <div className="flex gap-2">
                <Dialog open={isMovementDialogOpen} onOpenChange={setIsMovementDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      حركة رأس مال
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>إضافة حركة رأس مال</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">نوع الحركة</label>
                        <Select value={newMovement.movement_type} onValueChange={(value) => setNewMovement({...newMovement, movement_type: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر نوع الحركة" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="increase">زيادة رأس المال</SelectItem>
                            <SelectItem value="decrease">تخفيض رأس المال</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">المبلغ</label>
                        <Input
                          type="number"
                          value={newMovement.amount}
                          onChange={(e) => setNewMovement({...newMovement, amount: parseFloat(e.target.value) || 0})}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">السبب</label>
                        <Input
                          value={newMovement.reason}
                          onChange={(e) => setNewMovement({...newMovement, reason: e.target.value})}
                          placeholder="سبب الزيادة أو التخفيض"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">التاريخ</label>
                        <Input
                          type="date"
                          value={newMovement.movement_date}
                          onChange={(e) => setNewMovement({...newMovement, movement_date: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">الوصف (اختياري)</label>
                        <Textarea
                          value={newMovement.description}
                          onChange={(e) => setNewMovement({...newMovement, description: e.target.value})}
                          placeholder="تفاصيل إضافية عن الحركة"
                          rows={3}
                        />
                      </div>
                      <Button onClick={handleCapitalMovement} className="w-full">
                        تنفيذ الحركة
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog open={isPartnersDialogOpen} onOpenChange={setIsPartnersDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Users className="h-4 w-4 mr-2" />
                      توزيع الشركاء
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl">
                    <DialogHeader>
                      <DialogTitle>توزيع رأس المال على الشركاء</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      {partnersDistribution && partnersDistribution.length > 0 ? (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>اسم الشريك</TableHead>
                              <TableHead>نسبة الملكية</TableHead>
                              <TableHead>مبلغ رأس المال</TableHead>
                              <TableHead>عدد الحصص</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {partnersDistribution.map((partner: any) => (
                              <TableRow key={partner.id}>
                                <TableCell className="font-medium">{partner.partner_name}</TableCell>
                                <TableCell>{partner.ownership_percentage}%</TableCell>
                                <TableCell>{formatSalary(partner.capital_amount)}</TableCell>
                                <TableCell>{partner.share_count}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      ) : (
                        <div className="text-center py-8">
                          <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                          <p className="text-muted-foreground">لا توجد بيانات توزيع للشركاء</p>
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Building2 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-muted-foreground">لم يتم إعداد بيانات رأس المال بعد</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* سجل حركات رأس المال */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            سجل حركات رأس المال
          </CardTitle>
        </CardHeader>
        <CardContent>
          {movements && movements.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>التاريخ</TableHead>
                  <TableHead>النوع</TableHead>
                  <TableHead>المبلغ</TableHead>
                  <TableHead>السبب</TableHead>
                  <TableHead>الوصف</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movements.map((movement: any) => (
                  <TableRow key={movement.id}>
                    <TableCell>{format(new Date(movement.movement_date), "yyyy/MM/dd")}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getMovementTypeIcon(movement.movement_type)}
                        {getMovementTypeBadge(movement.movement_type)}
                      </div>
                    </TableCell>
                    <TableCell className={movement.movement_type === 'increase' ? 'text-green-600' : 'text-red-600'}>
                      {movement.movement_type === 'increase' ? '+' : '-'}{formatSalary(movement.amount)}
                    </TableCell>
                    <TableCell>{movement.reason}</TableCell>
                    <TableCell>{movement.description || "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <History className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-muted-foreground">لا توجد حركات رأس مال مسجلة</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}