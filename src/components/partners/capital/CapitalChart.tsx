
import React from "react";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Legend, 
  Tooltip
} from "recharts";
import { formatNumber } from "@/utils/formatters";

interface ChartDataItem {
  name: string;
  value: number;
  percentage: number;
}

interface CapitalChartProps {
  chartData: ChartDataItem[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1', '#a4de6c', '#d0ed57'];

export function CapitalChart({ chartData }: CapitalChartProps) {
  if (chartData.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <p className="text-muted-foreground">لا توجد بيانات لعرضها</p>
      </div>
    );
  }

  return (
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
  );
}
