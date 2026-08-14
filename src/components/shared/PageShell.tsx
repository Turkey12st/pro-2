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

/** غلاف متجاوب موحّد للعناوين والإجراءات ومحتوى صفحات النظام. */
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
      className={cn(
        fullWidth
          ? "w-full min-w-0 px-3 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8"
          : "page-container",
        "min-w-0 space-y-5 sm:space-y-7",
        className,
      )}
    >
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="breadcrumb" className="flex min-w-0 flex-wrap items-center gap-1 text-xs text-muted-foreground">
          {breadcrumbs.map((crumb, i) => (
            <React.Fragment key={`${crumb.label}-${i}`}>
              {i > 0 && <ChevronLeft className="h-3.5 w-3.5 shrink-0 opacity-60" />}
              {crumb.href ? (
                <Link to={crumb.href} className="max-w-[12rem] truncate transition-colors hover:text-foreground sm:max-w-none">
                  {crumb.label}
                </Link>
              ) : (
                <span className="max-w-[12rem] truncate font-medium text-foreground sm:max-w-none">{crumb.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      <header className="flex min-w-0 flex-col gap-4 border-b border-border/60 pb-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-start gap-3 sm:gap-4">
          {Icon && (
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl gradient-primary shadow-primary sm:h-12 sm:w-12">
              <Icon className="h-5 w-5 text-primary-foreground sm:h-6 sm:w-6" />
            </div>
          )}
          <div className="min-w-0 space-y-1">
            <h1 className="text-balance text-xl font-bold leading-tight text-foreground sm:text-2xl lg:text-3xl">{title}</h1>
            {description && <p className="max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">{description}</p>}
          </div>
        </div>

        {actions && <div className="flex w-full flex-wrap items-center gap-2 lg:w-auto lg:justify-end">{actions}</div>}
      </header>

      <div className="min-w-0 space-y-5 animate-fade-in sm:space-y-7">{children}</div>
    </div>
  );
}

export default PageShell;
