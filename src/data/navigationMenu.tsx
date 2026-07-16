import {
  LayoutDashboard,
  Receipt,
  FileText,
  Users,
  Settings,
  CalendarIcon,
  ListChecks,
  Store,
  Link,
  Building2,
  TrendingUp,
  Shield,
  Landmark,
  UserCircle,
  Briefcase,
  DollarSign,
  Bell,
} from "lucide-react";
import { MenuItem } from "@/types/navigation";
import type { TFunction } from "i18next";

export function getNavigationMenu(t?: TFunction): MenuItem[] {
  const tr = (key: string, fallback: string) => (t ? t(key) : fallback);
  const groups = {
    overview: tr("nav.groupOverview", "نظرة عامة"),
    finance: tr("nav.groupFinance", "المحاسبة والمالية"),
    hr: tr("nav.groupHR", "الموارد البشرية"),
    ops: tr("nav.groupOperations", "العمليات"),
    system: tr("nav.groupSystem", "النظام"),
  };

  return [
    { name: tr("nav.dashboard", "لوحة المعلومات"), href: "/dashboard", icon: LayoutDashboard, group: groups.overview },

    { name: tr("nav.accounting", "المحاسبة"), href: "/accounting", icon: Receipt, group: groups.finance },
    { name: tr("nav.financial", "التقارير المالية"), href: "/financial", icon: TrendingUp, group: groups.finance },
    { name: tr("nav.capital", "إدارة رأس المال"), href: "/capital", icon: Building2, group: groups.finance },
    { name: tr("nav.bankReconciliation", "المطابقة البنكية"), href: "/bank-reconciliation", icon: Landmark, group: groups.finance },
    { name: tr("nav.commissions", "العمولات"), href: "/commissions", icon: DollarSign, group: groups.finance },

    { name: tr("nav.hr", "الموظفون والحضور"), href: "/hr", icon: Users, group: groups.hr },

    { name: tr("nav.projects", "المشاريع"), href: "/projects", icon: ListChecks, group: groups.ops },
    { name: tr("nav.clients", "العملاء"), href: "/clients", icon: Store, group: groups.ops },
    { name: tr("nav.partners", "الشركاء"), href: "/partners", icon: Link, group: groups.ops },
    { name: tr("nav.tenders", "المناقصات"), href: "/tenders", icon: Briefcase, group: groups.ops },

    { name: tr("nav.documents", "المستندات"), href: "/documents", icon: FileText, group: groups.system },
    { name: tr("nav.company", "معلومات الشركة"), href: "/company", icon: Building2, group: groups.system },
    { name: tr("nav.calendar", "التقويم"), href: "/calendar", icon: CalendarIcon, group: groups.system },
    { name: tr("nav.notifications", "الإشعارات والأتمتة"), href: "/notifications", icon: Bell, group: groups.system },
    { name: tr("nav.settings", "الإعدادات"), href: "/settings", icon: Settings, group: groups.system },
    { name: tr("nav.admin", "لوحة الإدارة"), href: "/admin", icon: Shield, group: groups.system },
  ];
}
