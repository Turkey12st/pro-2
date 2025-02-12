
import AppLayout from "@/components/AppLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { NotificationsList } from "@/components/dashboard/NotificationsList";
import { CashFlowChart } from "@/components/dashboard/CashFlowChart";
import { FinancialChart } from "@/components/dashboard/FinancialChart";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  Wallet,
  TrendingUp,
  DollarSign,
  FileCheck,
  ArrowUpRight
} from "lucide-react";

export default function DashboardPage() {
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

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-6 p-6">
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
