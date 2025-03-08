
import React from "react";
import { StatCard } from "@/components/dashboard/StatCard";
import { Bank, Users, FileText, Wallet } from "lucide-react";

interface DashboardStatsProps {
  stats: Array<{
    title: string;
    value: string;
    change: string;
    changeType: string;
    icon: React.ReactNode;
  }>
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, i) => (
        <StatCard
          key={i}
          title={stat.title}
          value={stat.value}
          description={stat.change}
          icon={stat.icon}
          trend={
            stat.changeType === "increase" 
              ? { value: stat.change, icon: stat.icon, className: "text-green-600" }
              : stat.changeType === "decrease" 
                ? { value: stat.change, icon: stat.icon, className: "text-red-600" }
                : stat.changeType === "warning" 
                  ? { value: stat.change, icon: stat.icon, className: "text-amber-600" }
                  : { value: stat.change, icon: stat.icon, className: "text-muted-foreground" }
          }
        />
      ))}
    </div>
  );
}
