
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, DollarSign, Building, Briefcase, TrendingUp } from 'lucide-react';
import { useDataIntegration } from '@/hooks/useDataIntegration';

export function IntegratedDashboardStats() {
  const { data, loading } = useDataIntegration();

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-24 bg-gray-200 rounded animate-pulse"></div>
        ))}
      </div>
    );
  }

  const stats = [
    {
      title: "إجمالي الموظفين",
      value: data.totalEmployees.toString(),
      change: "+المحدث تلقائياً",
      changeType: "neutral" as const,
      icon: <Users className="text-blue-500" />
    },
    {
      title: "إجمالي الرواتب",
      value: `${data.totalSalaries.toLocaleString()} ريال`,
      change: "شهرياً",
      changeType: "neutral" as const,
      icon: <DollarSign className="text-green-500" />
    },
    {
      title: "رأس المال",
      value: `${data.totalCapital.toLocaleString()} ريال`,
      change: "حسب الشركاء",
      changeType: "neutral" as const,
      icon: <Building className="text-purple-500" />
    },
    {
      title: "المشاريع النشطة",
      value: data.totalProjects.toString(),
      change: "مشروع",
      changeType: "neutral" as const,
      icon: <Briefcase className="text-amber-500" />
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            {stat.icon}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.change}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
