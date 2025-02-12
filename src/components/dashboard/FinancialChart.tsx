
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip
} from "recharts";

export function FinancialChart() {
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

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle className="text-primary flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          تحليل الأداء المالي
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          {financials && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={financials}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="due_date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="amount" fill="#4f46e5" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
