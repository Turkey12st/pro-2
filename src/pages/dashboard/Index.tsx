import AppLayout from "@/components/AppLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { NotificationsList } from "@/components/dashboard/NotificationsList";
import { CashFlowChart } from "@/components/dashboard/CashFlowChart";
import { FinancialChart } from "@/components/dashboard/FinancialChart";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
  Pencil
} from "lucide-react";
import { useState } from "react";

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
    reserved_capital: 0
  });

  const [companyInfo, setCompanyInfo] = useState({
    company_name: "",
    company_type: "",
    establishment_date: "",
    commercial_registration: ""
  });

  const [partner, setPartner] = useState({
    name: "",
    ownership_percentage: 0
  });

  // جلب معلومات الشركة
  const { data: companyData } = useQuery({
    queryKey: ['company_info'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('company_info')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (error) throw error;
      return data[0];
    }
  });

  // جلب الشركاء
  const { data: partners } = useQuery({
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

  // جلب بيانات رأس المال
  const { data: capitalData } = useQuery({
    queryKey: ['capital_management'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('capital_management')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (error) throw error;
      return data[0];
    }
  });

  // جلب التدفقات النقدية
  const { data: cashFlow } = useQuery({
    queryKey: ['cash_flow'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cash_flow')
        .select('*')
        .order('transaction_date', { ascending: false })
        .limit(30);
      
      if (error) throw error;
      return data;
    }
  });

  // جلب البيانات المالية
  const { data: financials } = useQuery({
    queryKey: ['financials'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('financials')
        .select('*')
        .order('due_date', { ascending: true });
      
      if (error) throw error;
      return data;
    }
  });

  // جلب الوثائق
  const { data: documents } = useQuery({
    queryKey: ['company_documents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('company_documents')
        .select('*')
        .order('expiry_date', { ascending: true });
      
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
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ في الحفظ",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAddCapital = () => {
    addCapitalMutation.mutate(newCapital);
  };

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

  const handleAddCompanyInfo = () => {
    addCompanyInfoMutation.mutate(companyInfo);
  };

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
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ في الحفظ",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAddPartner = () => {
    addPartnerMutation.mutate(partner);
  };

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
              <div className="space-y-2">
                <p><strong>اسم الشركة:</strong> {companyData?.company_name || "غير محدد"}</p>
                <p><strong>نوع الشركة:</strong> {companyData?.company_type || "غير محدد"}</p>
                <p><strong>تاريخ التأسيس:</strong> {companyData?.establishment_date || "غير محدد"}</p>
                <p><strong>رقم السجل التجاري:</strong> {companyData?.commercial_registration || "غير محدد"}</p>
              </div>
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
              <div className="space-y-2">
                {partners?.map((partner) => (
                  <div key={partner.id} className="flex justify-between items-center">
                    <span>{partner.name}</span>
                    <span>{partner.ownership_percentage}%</span>
                  </div>
                ))}
              </div>
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
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>إضافة رأس مال جديد</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
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
                <Button 
                  onClick={handleAddCapital}
                  disabled={addCapitalMutation.isPending}
                >
                  {addCapitalMutation.isPending ? "جاري الحفظ..." : "حفظ"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Dialog forms */}
        <Dialog open={isCompanyInfoDialogOpen} onOpenChange={setIsCompanyInfoDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>تحديث معلومات الشركة</DialogTitle>
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
              <Button onClick={handleAddCompanyInfo}>حفظ المعلومات</Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isPartnerDialogOpen} onOpenChange={setIsPartnerDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>إضافة شريك جديد</DialogTitle>
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
              <Button onClick={handleAddPartner}>إضافة الشريك</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* بطاقات المؤشرات الرئيسية */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="رأس المال المتاح"
            value={`${capitalData?.available_capital?.toLocaleString()} ريال`}
            description={`من إجمالي ${capitalData?.total_capital?.toLocaleString()} ريال`}
            icon={Wallet}
          />

          <StatCard
            title="التدفقات النقدية (30 يوم)"
            value={`${cashFlow?.reduce((acc, curr) => 
              curr.type === 'inflow' ? acc + Number(curr.amount) : acc - Number(curr.amount), 0
            )?.toLocaleString()} ريال`}
            icon={TrendingUp}
            trend={{
              value: `${cashFlow?.filter(cf => cf.type === 'inflow')
                .reduce((acc, curr) => acc + Number(curr.amount), 0)
                ?.toLocaleString()} واردات`,
              icon: ArrowUpRight,
              className: "text-green-500"
            }}
          />

          <StatCard
            title="المستحقات المالية"
            value={`${financials?.filter(f => f.status === 'pending' && f.type === 'revenue')
              .reduce((acc, curr) => acc + Number(curr.amount), 0)
              ?.toLocaleString()} ريال`}
            description={`${financials?.filter(f => f.status === 'pending' && f.type === 'revenue').length} مستحق`}
            icon={DollarSign}
          />

          <StatCard
            title="الوثائق المنتهية"
            value={documents?.filter(doc => new Date(doc.expiry_date) < new Date()).length || 0}
            description="وثيقة تحتاج للتجديد"
            icon={FileCheck}
          />
        </div>

        {/* التنبيهات والمؤشرات */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <NotificationsList />
          <CashFlowChart />
        </div>

        <FinancialChart />
      </div>
    </AppLayout>
  );
}
