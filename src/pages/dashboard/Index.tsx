
import React from "react";
import { Container } from "@/components/ui/container";
import { CompanyInfoCard } from "@/components/dashboard/CompanyInfoCard";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import DashboardTabs from "@/components/dashboard/DashboardTabs";
import { QuickNavMenu } from "@/components/dashboard/QuickNavMenu";
import { AutoSaveProvider } from "@/components/dashboard/AutoSaveProvider";
import { 
  Users, 
  FileText, 
  Building, 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  AlertTriangle, 
  Clock 
} from "lucide-react";

export default function DashboardPage() {
  // Sample data for quick stats
  const stats = [
    {
      title: "رأس المال",
      value: "1,000,000 ريال",
      change: "+5.2%",
      changeType: "increase",
      icon: <Building className="text-blue-500" />
    },
    {
      title: "عدد الموظفين",
      value: "24",
      change: "+2",
      changeType: "increase",
      icon: <Users className="text-green-500" />
    },
    {
      title: "المستندات",
      value: "16",
      change: "3 قيد الانتهاء",
      changeType: "warning",
      icon: <FileText className="text-amber-500" />
    },
    {
      title: "مستحقات الرواتب",
      value: "87,500 ريال",
      change: "5 أيام",
      changeType: "neutral",
      icon: <DollarSign className="text-purple-500" />
    }
  ];

  return (
    <AutoSaveProvider>
      <div className="space-y-6 p-4 sm:p-6 md:p-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">لوحة المعلومات</h1>
          <QuickNavMenu />
        </div>

        <DashboardStats stats={stats} />

        <div className="grid gap-4 md:grid-cols-12">
          <div className="md:col-span-3">
            <CompanyInfoCard />
          </div>
          
          <div className="md:col-span-9">
            <DashboardTabs />
          </div>
        </div>
      </div>
    </AutoSaveProvider>
  );
}
