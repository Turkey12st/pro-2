
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    icon: LucideIcon;
    className?: string;
  };
}

export function StatCard({ title, value, description, icon, trend }: StatCardProps) {
  // Render the icon dynamically
  const renderIcon = () => {
    if (React.isValidElement(icon)) {
      return icon;
    }
    return null;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {renderIcon()}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
        {trend && trend.icon && (
          <div className="flex items-center pt-1">
            {React.createElement(trend.icon, { className: `h-4 w-4 ${trend.className}` })}
            <span className={`text-sm mr-1 ${trend.className}`}>
              {trend.value}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
