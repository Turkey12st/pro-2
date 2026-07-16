import React from "react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

export interface PageShellBreadcrumb {
  label: string;
  href?: string;
}

export interface PageShellProps {
  title: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  actions?: React.ReactNode;
  breadcrumbs?: PageShellBreadcrumb[];
  children: React.ReactNode;
  /** إزالة الحاوية الافتراضية إذا احتاج المحتوى عرضاً كاملاً */
  fullWidth?: boolean;
  className?: string;
}

/**
 * غلاف موحد لجميع صفحات النظام:
 * - عنوان + وصف + أيقونة
 * - أزرار إجراءات على اليسار (RTL: اليسار البصري)
 * - Breadcrumbs اختياري
 * - مسافات وعرض متسقان
 */
export function PageShell({
  title,
  description,
  icon: Icon,
  actions,
  breadcrumbs,
  children,
  fullWidth = false,
  className,
}: PageShellProps) {
  return (
    <div
      dir="rtl"
      className={cn(
        fullWidth ? "w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8" : "page-container",
        "space-y-6 sm:space-y-8",
        className
      )}
    >
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav
          aria-label="breadcrumb"
          className="flex items-center gap-1 text-xs text-muted-foreground"
        >
          {breadcrumbs.map((crumb, i) => (
            <React.Fragment key={i}>
              {i > 0 && <ChevronLeft className="h-3.5 w-3.5 opacity-60" />}
              {crumb.href ? (
                <Link
                  to={crumb.href}
                  className="hover:text-foreground transition-colors"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-foreground font-medium">{crumb.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      <header className="flex flex-col gap-4 pb-4 border-b border-border/50 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4 min-w-0">
          {Icon && (
            <div className="w-12 h-12 shrink-0 rounded-2xl gradient-primary shadow-primary flex items-center justify-center">
              <Icon className="h-6 w-6 text-primary-foreground" />
            </div>
          )}
          <div className="min-w-0 space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground truncate">
              {title}
            </h1>
            {description && (
              <p className="text-sm sm:text-base text-muted-foreground">
                {description}
              </p>
            )}
          </div>
        </div>
        {actions && (
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {actions}
          </div>
        )}
      </header>

      <div className="space-y-6 sm:space-y-8 animate-fade-in">{children}</div>
    </div>
  );
}

export default PageShell;