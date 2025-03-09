
import React from "react";
import { StatCard } from "@/components/dashboard/StatCard";
import { Building, Users, FileText, Wallet, TrendingUp, TrendingDown, AlertCircle, Clock } from "lucide-react";

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
  // Helper function to get the appropriate trend icon based on change type
  const getTrendIcon = (changeType: string) => {
    switch (changeType) {
      case "increase":
        return TrendingUp;
      case "decrease":
        return TrendingDown;
      case "warning":
        return AlertCircle;
      default:
        return Clock;
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, i) => (
        <StatCard
          key={i}
          title={stat.title}
          value={stat.value}
          description={stat.change}
          icon={stat.icon}
          trend={{
            value: stat.change,
            icon: getTrendIcon(stat.changeType),
            className: 
              stat.changeType === "increase" 
                ? "text-green-600" 
                : stat.changeType === "decrease" 
                  ? "text-red-600" 
                  : stat.changeType === "warning" 
                    ? "text-amber-600" 
                    : "text-muted-foreground"
          }}
        />
      ))}
    </div>
  );
}
