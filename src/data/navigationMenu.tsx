
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
  Home,
  Shield,
} from "lucide-react";
import { MenuItem } from "@/types/navigation";

export function getNavigationMenu(): MenuItem[] {
  return [
    {
      name: "لوحة المعلومات",
      href: "/dashboard",
      icon: LayoutDashboard,
      group: "إدارة النظام"
    },
    {
      name: "الصفحة الرئيسية",
      href: "/main",
      icon: Home,
      group: "إدارة النظام"
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
      name: "المشاريع",
      href: "/projects",
      icon: ListChecks,
      group: "إدارة المشاريع"
    },
    {
      name: "المستندات",
      href: "/documents",
      icon: FileText,
      group: "إدارة النظام"
    },
    {
      name: "الموظفين",
      href: "/hr",
      icon: Users,
      group: "إدارة الموارد البشرية"
    },
    {
      name: "العملاء",
      href: "/clients",
      icon: Store,
      group: "إدارة العملاء"
    },
    {
      name: "الشركاء",
      href: "/partners",
      icon: Link,
      group: "إدارة النظام"
    },
    {
      name: "معلومات الشركة",
      href: "/company",
      icon: Building2,
      group: "إدارة النظام"
    },
    {
      name: "التقويم",
      href: "/calendar",
      icon: CalendarIcon,
      group: "إدارة النظام"
    },
    {
      name: "الإعدادات",
      href: "/settings",
      icon: Settings,
      group: "إدارة النظام"
    },
    {
      name: "لوحة الإدارة",
      href: "/admin",
      icon: Shield,
      group: "إدارة النظام"
    }
  ];
}
