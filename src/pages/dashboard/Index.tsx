
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
import { 
  Wallet,
  TrendingUp,
  DollarSign,
  FileCheck,
  ArrowUpRight,
  Plus
} from "lucide-react";
import { useState } from "react";

export default function DashboardPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newCapital, setNewCapital] = useState({
    fiscal_year: new Date().getFullYear(),
    total_capital: 0,
    available_capital: 0,
    reserved_capital: 0
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
    mutationFn: async (newCapitalData) => {
      const { data, error } = await supabase
        .from('capital_management')
        .insert([newCapitalData])
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['capital_management']);
      toast({
        title: "تم الحفظ بنجاح",
        description: "تم إضافة بيانات رأس المال الجديدة",
      });
      setIsDialogOpen(false);
    },
    onError: (error) => {
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

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-6 p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">لوحة التحكم</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
                  disabled={addCapitalMutation.isLoading}
                >
                  {addCapitalMutation.isLoading ? "جاري الحفظ..." : "حفظ"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

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
