
import { Card, CardContent } from "@/components/ui/card";
import { Users2, Wallet, ShieldCheck, UserPlus } from "lucide-react";
import { formatNumber } from "@/lib/utils";

interface HRDashboardCardsProps {
  totalEmployees: number;
  newEmployeesCount: number;
  totalSalaries: number;
  totalGosi: number;
}

export function HRDashboardCards({
  totalEmployees,
  newEmployeesCount,
  totalSalaries,
  totalGosi
}: HRDashboardCardsProps) {
  const cards = [
    {
      title: "إجمالي الموظفين",
      value: totalEmployees,
      suffix: "موظف",
      icon: Users2,
      description: `${newEmployeesCount > 0 ? `+${newEmployeesCount} جديد` : 'لا يوجد جديد'}`,
      iconBg: "bg-primary/10",
      iconColor: "text-primary"
    },
    {
      title: "موظفون جدد",
      value: newEmployeesCount,
      suffix: "هذا الشهر",
      icon: UserPlus,
      description: "انضموا هذا الشهر",
      iconBg: "bg-info/10",
      iconColor: "text-info"
    },
    {
      title: "إجمالي الرواتب",
      value: formatNumber(totalSalaries),
      suffix: "ريال",
      icon: Wallet,
      description: "المستحقات الشهرية",
      iconBg: "bg-success/10",
      iconColor: "text-success"
    },
    {
      title: "التأمينات الاجتماعية",
      value: formatNumber(totalGosi),
      suffix: "ريال",
      icon: ShieldCheck,
      description: "اشتراكات التأمينات",
      iconBg: "bg-warning/10",
      iconColor: "text-warning"
    }
  ];

  return (
    <div className="dashboard-grid">
      {cards.map((card, index) => (
        <Card key={index} className="stat-card group">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="stat-label">{card.title}</p>
                <div className="flex items-baseline gap-2">
                  <span className="stat-value">{card.value}</span>
                  <span className="text-sm text-muted-foreground">{card.suffix}</span>
                </div>
                <p className="text-xs text-muted-foreground">{card.description}</p>
              </div>
              <div className={`p-3 rounded-xl ${card.iconBg} transition-transform group-hover:scale-110`}>
                <card.icon className={`h-5 w-5 ${card.iconColor}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
