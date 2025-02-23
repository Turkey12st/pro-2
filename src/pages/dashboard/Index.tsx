
import AppLayout from "@/components/AppLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { NotificationsList } from "@/components/dashboard/NotificationsList";
import { CashFlowChart } from "@/components/dashboard/CashFlowChart";
import { FinancialChart } from "@/components/dashboard/FinancialChart";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Wallet,
  TrendingUp,
  DollarSign,
  FileCheck,
  ArrowUpRight,
  Plus,
  Building2,
  Users,
  Pencil,
  AlertCircle
} from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function DashboardPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCapitalDialogOpen, setIsCapitalDialogOpen] = useState(false);
  const [isCompanyInfoDialogOpen, setIsCompanyInfoDialogOpen] = useState(false);
  const [isPartnerDialogOpen, setIsPartnerDialogOpen] = useState(false);
  
  const [newCapital, setNewCapital] = useState({
    fiscal_year: new Date().getFullYear(),
    total_capital: 0,
    available_capital: 0,
    reserved_capital: 0,
    notes: ""
  });

  const [companyInfo, setCompanyInfo] = useState({
    company_name: "",
    company_type: "",
    establishment_date: "",
    commercial_registration: ""
  });

  const [partner, setPartner] = useState({
    name: "",
    ownership_percentage: 0,
    partner_type: "individual",
    share_value: 0,
    contact_info: {
      email: "",
      phone: ""
    }
  });

  // جلب معلومات الشركة
  const { data: companyData, isLoading: isLoadingCompany } = useQuery({
    queryKey: ['company_info'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('company_info')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    }
  });

  // جلب الشركاء
  const { data: partners, isLoading: isLoadingPartners } = useQuery({
    queryKey: ['company_partners'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('company_partners')
        .select('*')
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data;
    }
  });

  // جلب الموظفين
  const { data: employees, isLoading: isLoadingEmployees } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data;
    }
  });

  // جلب بيانات رأس المال
  const { data: capitalData, isLoading: isLoadingCapital } = useQuery({
    queryKey: ['capital_management'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('capital_management')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    }
  });

  // إضافة رأس مال جديد
  const addCapitalMutation = useMutation({
    mutationFn: async (newCapitalData: typeof newCapital) => {
      const { data, error } = await supabase
        .from('capital_management')
        .insert([newCapitalData])
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['capital_management'] });
      toast({
        title: "تم الحفظ بنجاح",
        description: "تم إضافة بيانات رأس المال الجديدة",
      });
      setIsCapitalDialogOpen(false);
      setNewCapital({
        fiscal_year: new Date().getFullYear(),
        total_capital: 0,
        available_capital: 0,
        reserved_capital: 0,
        notes: ""
      });
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ في الحفظ",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // إضافة معلومات الشركة
  const addCompanyInfoMutation = useMutation({
    mutationFn: async (info: typeof companyInfo) => {
      const { data, error } = await supabase
        .from('company_info')
        .insert([info])
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company_info'] });
      toast({
        title: "تم الحفظ بنجاح",
        description: "تم تحديث معلومات الشركة",
      });
      setIsCompanyInfoDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ في الحفظ",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // إضافة شريك جديد
  const addPartnerMutation = useMutation({
    mutationFn: async (newPartner: typeof partner) => {
      const { data, error } = await supabase
        .from('company_partners')
        .insert([newPartner])
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company_partners'] });
      toast({
        title: "تم الحفظ بنجاح",
        description: "تم إضافة الشريك بنجاح",
      });
      setIsPartnerDialogOpen(false);
      setPartner({
        name: "",
        ownership_percentage: 0,
        partner_type: "individual",
        share_value: 0,
        contact_info: {
          email: "",
          phone: ""
        }
      });
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ في الحفظ",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-6 p-6">
        {/* معلومات الشركة */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  معلومات الشركة
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsCompanyInfoDialogOpen(true)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingCompany ? (
                <div className="text-center py-4">جاري التحميل...</div>
              ) : companyData ? (
                <div className="space-y-2">
                  <p><strong>اسم الشركة:</strong> {companyData.company_name}</p>
                  <p><strong>نوع الشركة:</strong> {companyData.company_type}</p>
                  <p><strong>تاريخ التأسيس:</strong> {companyData.establishment_date}</p>
                  <p><strong>رقم السجل التجاري:</strong> {companyData.commercial_registration}</p>
                </div>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    لا توجد معلومات للشركة. قم بإضافة المعلومات الأساسية.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  الشركاء
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsPartnerDialogOpen(true)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingPartners ? (
                <div className="text-center py-4">جاري التحميل...</div>
              ) : partners && partners.length > 0 ? (
                <div className="space-y-2">
                  {partners.map((partner) => (
                    <div key={partner.id} className="flex justify-between items-center">
                      <span>{partner.name}</span>
                      <span>{partner.ownership_percentage}%</span>
                    </div>
                  ))}
                </div>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    لا يوجد شركاء مسجلين. قم بإضافة الشركاء.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">لوحة التحكم</h1>
          <Dialog open={isCapitalDialogOpen} onOpenChange={setIsCapitalDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                إضافة رأس مال جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>إضافة رأس مال جديد</DialogTitle>
                <DialogDescription>
                  أدخل بيانات رأس المال الجديد. تأكد من صحة المبالغ المدخلة.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>السنة المالية</Label>
                    <Input
                      type="number"
                      value={newCapital.fiscal_year}
                      onChange={(e) => setNewCapital(prev => ({
                        ...prev,
                        fiscal_year: parseInt(e.target.value)
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>إجمالي رأس المال</Label>
                    <Input
                      type="number"
                      value={newCapital.total_capital}
                      onChange={(e) => setNewCapital(prev => ({
                        ...prev,
                        total_capital: parseFloat(e.target.value)
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>رأس المال المتاح</Label>
                    <Input
                      type="number"
                      value={newCapital.available_capital}
                      onChange={(e) => setNewCapital(prev => ({
                        ...prev,
                        available_capital: parseFloat(e.target.value)
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>رأس المال المحجوز</Label>
                    <Input
                      type="number"
                      value={newCapital.reserved_capital}
                      onChange={(e) => setNewCapital(prev => ({
                        ...prev,
                        reserved_capital: parseFloat(e.target.value)
                      }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>ملاحظات</Label>
                  <Input
                    value={newCapital.notes}
                    onChange={(e) => setNewCapital(prev => ({
                      ...prev,
                      notes: e.target.value
                    }))}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  onClick={() => addCapitalMutation.mutate(newCapital)}
                  disabled={addCapitalMutation.isPending}
                >
                  {addCapitalMutation.isPending ? "جاري الحفظ..." : "حفظ"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* بطاقات المؤشرات الرئيسية */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="رأس المال المتاح"
            value={capitalData ? `${capitalData.available_capital?.toLocaleString()} ريال` : "0 ريال"}
            description={capitalData ? `من إجمالي ${capitalData.total_capital?.toLocaleString()} ريال` : "لا يوجد بيانات"}
            icon={Wallet}
          />

          <StatCard
            title="الموظفين"
            value={employees?.length || 0}
            description="إجمالي عدد الموظفين"
            icon={Users}
          />

          <StatCard
            title="الشركاء"
            value={partners?.length || 0}
            description="إجمالي عدد الشركاء"
            icon={Users}
            trend={{
              value: partners?.reduce((acc, curr) => acc + Number(curr.ownership_percentage), 0)?.toFixed(2) + "% موزعة",
              icon: ArrowUpRight,
              className: "text-green-500"
            }}
          />

          <StatCard
            title="التأمينات الاجتماعية"
            value={employees?.reduce((acc, curr) => acc + (curr.gosi_subscription || 0), 0)?.toLocaleString() + " ريال"}
            description="إجمالي التأمينات الشهرية"
            icon={FileCheck}
          />
        </div>

        {/* التنبيهات والمؤشرات */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <NotificationsList />
          <CashFlowChart />
        </div>

        <FinancialChart />

        {/* نموذج تحديث معلومات الشركة */}
        <Dialog open={isCompanyInfoDialogOpen} onOpenChange={setIsCompanyInfoDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>تحديث معلومات الشركة</DialogTitle>
              <DialogDescription>
                قم بتحديث المعلومات الأساسية للشركة
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>اسم الشركة</Label>
                <Input
                  value={companyInfo.company_name}
                  onChange={(e) => setCompanyInfo(prev => ({
                    ...prev,
                    company_name: e.target.value
                  }))}
                />
              </div>
              <div className="space-y-2">
                <Label>نوع الشركة</Label>
                <Input
                  value={companyInfo.company_type}
                  onChange={(e) => setCompanyInfo(prev => ({
                    ...prev,
                    company_type: e.target.value
                  }))}
                />
              </div>
              <div className="space-y-2">
                <Label>تاريخ التأسيس</Label>
                <Input
                  type="date"
                  value={companyInfo.establishment_date}
                  onChange={(e) => setCompanyInfo(prev => ({
                    ...prev,
                    establishment_date: e.target.value
                  }))}
                />
              </div>
              <div className="space-y-2">
                <Label>رقم السجل التجاري</Label>
                <Input
                  value={companyInfo.commercial_registration}
                  onChange={(e) => setCompanyInfo(prev => ({
                    ...prev,
                    commercial_registration: e.target.value
                  }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                onClick={() => addCompanyInfoMutation.mutate(companyInfo)}
                disabled={addCompanyInfoMutation.isPending}
              >
                {addCompanyInfoMutation.isPending ? "جاري الحفظ..." : "حفظ المعلومات"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* نموذج إضافة شريك جديد */}
        <Dialog open={isPartnerDialogOpen} onOpenChange={setIsPartnerDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>إضافة شريك جديد</DialogTitle>
              <DialogDescription>
                أدخل بيانات الشريك الجديد
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>اسم الشريك</Label>
                <Input
                  value={partner.name}
                  onChange={(e) => setPartner(prev => ({
                    ...prev,
                    name: e.target.value
                  }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>نسبة الملكية (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={partner.ownership_percentage}
                    onChange={(e) => setPartner(prev => ({
                      ...prev,
                      ownership_percentage: parseFloat(e.target.value)
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>قيمة الحصة</Label>
                  <Input
                    type="number"
                    value={partner.share_value}
                    onChange={(e) => setPartner(prev => ({
                      ...prev,
                      share_value: parseFloat(e.target.value)
                    }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>البريد الإلكتروني</Label>
                  <Input
                    type="email"
                    value={partner.contact_info.email}
                    onChange={(e) => setPartner(prev => ({
                      ...prev,
                      contact_info: {
                        ...prev.contact_info,
                        email: e.target.value
                      }
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>رقم الهاتف</Label>
                  <Input
                    type="tel"
                    value={partner.contact_info.phone}
                    onChange={(e) => setPartner(prev => ({
                      ...prev,
                      contact_info: {
                        ...prev.contact_info,
                        phone: e.target.value
                      }
                    }))}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button 
                onClick={() => addPartnerMutation.mutate(partner)}
                disabled={addPartnerMutation.isPending}
              >
                {addPartnerMutation.isPending ? "جاري الحفظ..." : "إضافة الشريك"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
