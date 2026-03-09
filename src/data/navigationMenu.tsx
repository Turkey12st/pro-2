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
} from "lucide-react";
import { MenuItem } from "@/types/navigation";

export function getNavigationMenu(): MenuItem[] {
  return [
    {
      name: "لوحة المعلومات",
      href: "/dashboard",
      icon: LayoutDashboard,
      group: "الرئيسية"
    },
    {
      name: "المحاسبة",
      href: "/accounting",
      icon: Receipt,
      group: "المالية"
    },
    {
      name: "التقارير المالية",
      href: "/financial",
      icon: TrendingUp,
      group: "المالية"
    },
    {
      name: "إدارة رأس المال",
      href: "/capital",
      icon: Building2,
      group: "المالية"
    },
    {
      name: "المطابقة البنكية",
      href: "/bank-reconciliation",
      icon: Landmark,
      group: "المالية"
    },
    {
      name: "الموظفين",
      href: "/hr",
      icon: Users,
      group: "الموارد البشرية"
    },
    {
      name: "المشاريع",
      href: "/projects",
      icon: ListChecks,
      group: "العمليات"
    },
    {
      name: "العملاء",
      href: "/clients",
      icon: Store,
      group: "العمليات"
    },
    {
      name: "الشركاء",
      href: "/partners",
      icon: Link,
      group: "العمليات"
    },
    {
      name: "المستندات",
      href: "/documents",
      icon: FileText,
      group: "النظام"
    },
    {
      name: "معلومات الشركة",
      href: "/company",
      icon: Building2,
      group: "النظام"
    },
    {
      name: "التقويم",
      href: "/calendar",
      icon: CalendarIcon,
      group: "النظام"
    },
    {
      name: "الإعدادات",
      href: "/settings",
      icon: Settings,
      group: "النظام"
    },
    {
      name: "لوحة الإدارة",
      href: "/admin",
      icon: Shield,
      group: "النظام"
    }
  ];
}
