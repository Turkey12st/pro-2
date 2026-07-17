import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowUpRight, LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

export interface KpiCardProps {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  icon?: LucideIcon;
  tone?: "default" | "success" | "warning" | "danger" | "info";
  href?: string;
  loading?: boolean;
  className?: string;
}

const toneStyles: Record<NonNullable<KpiCardProps["tone"]>, string> = {
  default: "bg-muted/40 text-foreground",
  success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  danger: "bg-destructive/10 text-destructive",
  info: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
};

export function KpiCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "default",
  href,
  loading,
  className,
}: KpiCardProps) {
  const content = (
    <Card
      className={cn(
        "surface-card group relative h-full overflow-hidden transition-all",
        href && "cursor-pointer hover:border-primary/40 hover:shadow-md",
        className
      )}
    >
      <CardContent className="p-4 sm:p-5 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <p className="text-xs sm:text-sm font-medium text-muted-foreground line-clamp-2">
            {label}
          </p>
          {Icon && (
            <div
              className={cn(
                "h-9 w-9 rounded-xl flex items-center justify-center shrink-0",
                toneStyles[tone]
              )}
            >
              <Icon className="h-4.5 w-4.5" />
            </div>
          )}
        </div>
        <div className="min-h-[2rem]">
          {loading ? (
            <div className="h-7 w-24 rounded bg-muted animate-pulse" />
          ) : (
            <p className="text-2xl sm:text-3xl font-bold text-foreground tabular-nums">
              {value}
            </p>
          )}
        </div>
        {hint && (
          <p className="text-xs text-muted-foreground line-clamp-1">{hint}</p>
        )}
        {href && (
          <ArrowUpRight className="absolute bottom-3 end-3 h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
      </CardContent>
    </Card>
  );

  return href ? <Link to={href}>{content}</Link> : content;
}

export default KpiCard;