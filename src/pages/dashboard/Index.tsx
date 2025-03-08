
import React from "react";
import { Container } from "@/components/ui/container";
import CompanyInfoCard from "@/components/dashboard/CompanyInfoCard";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { DashboardTabs } from "@/components/dashboard/DashboardTabs";
import { 
  Bank, 
  Users, 
  FileText, 
  Wallet
} from "lucide-react";

export default function DashboardPage() {
  // Sample data for quick stats
  const stats = [
    {
      title: "رأس المال",
      value: "1,000,000 ريال",
      change: "+5.2%",
      changeType: "increase",
      icon: <Bank className="text-blue-500" />
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
      icon: <Wallet className="text-purple-500" />
    }
  ];

  // Sample financial data
  const financialData = {
    total_income: 450000,
    total_expenses: 327500,
    net_profit: 122500,
    profit_margin: 27.2
  };

  // Sample notifications
  const notifications = [
    {
      id: "1",
      title: "تجديد السجل التجاري",
      message: "يجب تجديد السجل التجاري قبل 15/06/2023",
      type: "warning",
      date: "2023-05-20T10:30:00"
    },
    {
      id: "2",
      title: "دفع مستحقات التأمينات",
      message: "تم دفع مستحقات التأمينات الاجتماعية لشهر مايو",
      type: "success",
      date: "2023-05-15T14:45:00"
    },
    {
      id: "3",
      title: "إضافة موظف جديد",
      message: "تم إضافة الموظف أحمد محمد إلى النظام",
      type: "info",
      date: "2023-05-10T09:15:00"
    },
    {
      id: "4",
      title: "تحديث بيانات الشركة",
      message: "تم تحديث بيانات الشركة بنجاح",
      type: "info",
      date: "2023-05-05T16:30:00"
    }
  ];

  // Sample documents
  const expiringDocuments = [
    {
      id: "1",
      title: "السجل التجاري",
      type: "commercial_registration",
      expiry_date: "2023-06-15",
      days_remaining: 25,
      status: "soon-expire"
    },
    {
      id: "2",
      title: "رخصة البلدية",
      type: "municipal_license",
      expiry_date: "2023-06-01",
      days_remaining: 11,
      status: "soon-expire"
    },
    {
      id: "3",
      title: "شهادة الزكاة",
      type: "zakat_certificate",
      expiry_date: "2023-07-10",
      days_remaining: 50,
      status: "active"
    }
  ];

  // Sample salary data
  const salarySummary = {
    total_salaries: 87500,
    payment_date: "2023-05-30",
    days_remaining: 5,
    employees_count: 24,
    status: "upcoming"
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 md:p-8">
      <DashboardStats stats={stats} />

      <div className="grid gap-4 md:grid-cols-12">
        <div className="md:col-span-3">
          <CompanyInfoCard companyId="1" />
        </div>
        
        <div className="md:col-span-9">
          <DashboardTabs 
            financialData={financialData}
            salarySummary={salarySummary}
            notifications={notifications}
            expiringDocuments={expiringDocuments}
          />
        </div>
      </div>
    </div>
  );
}
