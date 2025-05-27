
import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Clock, Calendar } from "lucide-react";
import { differenceInDays } from "date-fns";

interface SalaryAlertsProps {
  paymentDate: string;
  totalSalaries: number;
}

export function SalaryAlerts({ paymentDate, totalSalaries }: SalaryAlertsProps) {
  const today = new Date();
  const payment = new Date(paymentDate);
  const daysRemaining = differenceInDays(payment, today);

  const getAlertConfig = () => {
    if (daysRemaining <= 1) {
      return {
        variant: "destructive" as const,
        icon: AlertCircle,
        title: "تنبيه عاجل - رواتب مستحقة!",
        description: daysRemaining === 0 ? "رواتب مستحقة اليوم!" : "رواتب مستحقة غداً!",
        className: "border-red-500 bg-red-50 text-red-900",
        iconColor: "text-red-600"
      };
    } else if (daysRemaining <= 3) {
      return {
        variant: "destructive" as const,
        icon: AlertCircle,
        title: "تنبيه مهم - رواتب قريبة!",
        description: `رواتب مستحقة خلال ${daysRemaining} أيام`,
        className: "border-orange-500 bg-orange-50 text-orange-900",
        iconColor: "text-orange-600"
      };
    } else if (daysRemaining <= 5) {
      return {
        variant: "default" as const,
        icon: Clock,
        title: "تذكير - رواتب قادمة",
        description: `رواتب مستحقة خلال ${daysRemaining} أيام`,
        className: "border-yellow-500 bg-yellow-50 text-yellow-900",
        iconColor: "text-yellow-600"
      };
    } else if (daysRemaining <= 10) {
      return {
        variant: "default" as const,
        icon: Calendar,
        title: "إشعار - رواتب قادمة",
        description: `رواتب مستحقة خلال ${daysRemaining} أيام`,
        className: "border-blue-500 bg-blue-50 text-blue-900",
        iconColor: "text-blue-600"
      };
    }
    return null;
  };

  const alertConfig = getAlertConfig();

  if (!alertConfig) return null;

  const Icon = alertConfig.icon;

  return (
    <Alert variant={alertConfig.variant} className={alertConfig.className}>
      <Icon className={`h-4 w-4 ${alertConfig.iconColor}`} />
      <AlertTitle>{alertConfig.title}</AlertTitle>
      <AlertDescription>
        {alertConfig.description}
        <br />
        <span className="font-semibold">
          إجمالي المبلغ: {totalSalaries.toLocaleString()} ريال
        </span>
      </AlertDescription>
    </Alert>
  );
}
