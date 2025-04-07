
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
  Building2, // Add Building2 for Capital Management
} from "lucide-react";
import { MenuItem } from "@/types/navigation";

export function getNavigationMenu(): MenuItem[] {
  return [
    {
      name: "لوحة المعلومات",
      href: "/dashboard",
      icon: React.createElement(LayoutDashboard, { className: "h-4 w-4" }),
      group: "إدارة النظام"
    },
    {
      name: "المحاسبة",
      href: "/accounting",
      icon: React.createElement(Receipt, { className: "h-4 w-4" }),
      group: "المالية"
    },
    {
      name: "إدارة رأس المال",
      href: "/capital",
      icon: React.createElement(Building2, { className: "h-4 w-4" }),
      group: "المالية"
    },
    {
      name: "المشاريع",
      href: "/projects",
      icon: React.createElement(ListChecks, { className: "h-4 w-4" }),
      group: "إدارة المشاريع"
    },
    {
      name: "المستندات",
      href: "/documents",
      icon: React.createElement(FileText, { className: "h-4 w-4" }),
      group: "إدارة النظام"
    },
    {
      name: "الموظفين",
      href: "/hr",
      icon: React.createElement(Users, { className: "h-4 w-4" }),
      group: "إدارة الموارد البشرية"
    },
    {
      name: "العملاء",
      href: "/clients",
      icon: React.createElement(Store, { className: "h-4 w-4" }),
      group: "إدارة العملاء"
    },
    {
      name: "الشركاء",
      href: "/partners",
      icon: React.createElement(Link, { className: "h-4 w-4" }),
      group: "إدارة النظام"
    },
    {
      name: "الزكاة والضرائب",
      href: "/zakat",
      icon: React.createElement(Scale, { className: "h-4 w-4" }),
      group: "المالية"
    },
    {
      name: "معلومات الشركة",
      href: "/company",
      icon: React.createElement(Building2, { className: "h-4 w-4" }),
      group: "إدارة النظام"
    },
    {
      name: "التقويم",
      href: "/calendar",
      icon: React.createElement(CalendarIcon, { className: "h-4 w-4" }),
      group: "إدارة النظام"
    },
    {
      name: "الإعدادات",
      href: "/settings",
      icon: React.createElement(Settings, { className: "h-4 w-4" }),
      group: "إدارة النظام"
    }
  ];
}
