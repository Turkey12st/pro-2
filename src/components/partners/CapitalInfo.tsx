
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Legend, 
  Tooltip
} from "recharts";
import { Coins, TrendingUp, Users, Building } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Partner {
  id: string;
  name: string;
  partner_type: string;
  ownership_percentage: number;
  share_value: number;
}

interface CapitalData {
  total_capital: number;
  individual_capital: number;
  corporate_capital: number;
  partner_count: number;
  partners: Partner[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1', '#a4de6c', '#d0ed57'];

export default function CapitalInfo() {
  const [capitalData, setCapitalData] = useState<CapitalData>({
    total_capital: 0,
    individual_capital: 0,
    corporate_capital: 0,
    partner_count: 0,
    partners: []
  });

  const { data: partners, isLoading } = useQuery({
    queryKey: ["partners"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("company_partners")
        .select("*");
      
      if (error) throw error;
      return data as any[]; // We'll transform this in useEffect
    }
  });

  useEffect(() => {
    if (partners) {
      // Transform partners data to ensure it has all required fields
      const transformedPartners: Partner[] = partners.map(p => ({
        id: p.id || p.created_at, // Use created_at as fallback ID
        name: p.name,
        partner_type: p.partner_type || 'individual',
        ownership_percentage: p.ownership_percentage,
        share_value: p.share_value || 0,
        contact_info: p.contact_info || {},
        documents: p.documents || [],
        created_at: p.created_at,
        updated_at: p.updated_at
      }));

      // Calculate data
      const total = transformedPartners.reduce((sum, partner) => sum + partner.share_value, 0);
      const individual = transformedPartners
        .filter(p => p.partner_type === 'individual')
        .reduce((sum, partner) => sum + partner.share_value, 0);
      const corporate = transformedPartners
        .filter(p => p.partner_type === 'company')
        .reduce((sum, partner) => sum + partner.share_value, 0);
      
      setCapitalData({
        total_capital: total,
        individual_capital: individual,
        corporate_capital: corporate,
        partner_count: transformedPartners.length,
        partners: transformedPartners
      });
    }
  }, [partners]);

  // إعداد بيانات الرسم البياني
  const chartData = capitalData.partners.map(partner => ({
    name: partner.name,
    value: partner.share_value,
    percentage: partner.ownership_percentage
  }));

  // تنسيق الأرقام
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ar-SA').format(num);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-[200px]" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-lg">
          <Coins className="mr-2 h-5 w-5" />
          توزيع رأس المال بين الشركاء
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg flex items-center">
            <TrendingUp className="h-10 w-10 text-blue-500 ml-4" />
            <div>
              <p className="text-sm text-muted-foreground">إجمالي رأس المال</p>
              <p className="text-xl font-bold">{formatNumber(capitalData.total_capital)} ريال</p>
            </div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg flex items-center">
            <Users className="h-10 w-10 text-green-500 ml-4" />
            <div>
              <p className="text-sm text-muted-foreground">رأس مال الأفراد</p>
              <p className="text-xl font-bold">{formatNumber(capitalData.individual_capital)} ريال</p>
              <p className="text-xs text-muted-foreground">
                {capitalData.total_capital > 0 ? 
                  `${((capitalData.individual_capital / capitalData.total_capital) * 100).toFixed(1)}%` : 
                  "0%"}
              </p>
            </div>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg flex items-center">
            <Building className="h-10 w-10 text-purple-500 ml-4" />
            <div>
              <p className="text-sm text-muted-foreground">رأس مال الشركات</p>
              <p className="text-xl font-bold">{formatNumber(capitalData.corporate_capital)} ريال</p>
              <p className="text-xs text-muted-foreground">
                {capitalData.total_capital > 0 ? 
                  `${((capitalData.corporate_capital / capitalData.total_capital) * 100).toFixed(1)}%` : 
                  "0%"}
              </p>
            </div>
          </div>
        </div>

        {chartData.length > 0 ? (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, percentage }) => `${name} (${percentage}%)`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [`${formatNumber(value)} ريال`, 'القيمة']}
                  contentStyle={{ textAlign: 'right', direction: 'rtl' }}
                />
                <Legend formatter={(value) => <span>{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-muted-foreground">لا توجد بيانات لعرضها</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
