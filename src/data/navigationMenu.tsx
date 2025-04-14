
import React from "react";
import {
  LayoutDashboard,
  Receipt,
  FileText,
  Users,
  Settings,
  Calendar as CalendarIcon,
  ListChecks,
  Store,
  Link,
  Scale,
  Building2,
} from "lucide-react";
import { MenuItem } from "@/types/navigation";

export function getNavigationMenu(): MenuItem[] {
  return [
    {
      name: "لوحة المعلومات",
      href: "/dashboard",
      icon: <LayoutDashboard className="h-4 w-4" />,
      group: "إدارة النظام"
    },
    {
      name: "المحاسبة",
      href: "/accounting",
      icon: <Receipt className="h-4 w-4" />,
      group: "المالية"
    },
    {
      name: "إدارة رأس المال",
      href: "/capital",
      icon: <Building2 className="h-4 w-4" />,
      group: "المالية"
    },
    {
      name: "المشاريع",
      href: "/projects",
      icon: <ListChecks className="h-4 w-4" />,
      group: "إدارة المشاريع"
    },
    {
      name: "المستندات",
      href: "/documents",
      icon: <FileText className="h-4 w-4" />,
      group: "إدارة النظام"
    },
    {
      name: "الموظفين",
      href: "/hr",
      icon: <Users className="h-4 w-4" />,
      group: "إدارة الموارد البشرية"
    },
    {
      name: "العملاء",
      href: "/clients",
      icon: <Store className="h-4 w-4" />,
      group: "إدارة العملاء"
    },
    {
      name: "الشركاء",
      href: "/partners",
      icon: <Link className="h-4 w-4" />,
      group: "إدارة النظام"
    },
    {
      name: "الزكاة والضرائب",
      href: "/zakat",
      icon: <Scale className="h-4 w-4" />,
      group: "المالية"
    },
    {
      name: "معلومات الشركة",
      href: "/company",
      icon: <Building2 className="h-4 w-4" />,
      group: "إدارة النظام"
    },
    {
      name: "التقويم",
      href: "/calendar",
      icon: <CalendarIcon className="h-4 w-4" />,
      group: "إدارة النظام"
    },
    {
      name: "الإعدادات",
      href: "/settings",
      icon: <Settings className="h-4 w-4" />,
      group: "إدارة النظام"
    }
  ];
}
