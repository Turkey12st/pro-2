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

export function getNavigationMenu(): MenuItem[] {
  return [
    // 1) نظرة عامة
    { name: "لوحة المعلومات", href: "/dashboard", icon: LayoutDashboard, group: "نظرة عامة" },

    // 2) المحاسبة والمالية
    { name: "المحاسبة", href: "/accounting", icon: Receipt, group: "المحاسبة والمالية" },
    { name: "التقارير المالية", href: "/financial", icon: TrendingUp, group: "المحاسبة والمالية" },
    { name: "إدارة رأس المال", href: "/capital", icon: Building2, group: "المحاسبة والمالية" },
    { name: "المطابقة البنكية", href: "/bank-reconciliation", icon: Landmark, group: "المحاسبة والمالية" },
    { name: "العمولات", href: "/commissions", icon: DollarSign, group: "المحاسبة والمالية" },

    // 3) الموارد البشرية
    { name: "الموظفون والحضور", href: "/hr", icon: Users, group: "الموارد البشرية" },

    // 4) العمليات
    { name: "المشاريع", href: "/projects", icon: ListChecks, group: "العمليات" },
    { name: "العملاء", href: "/clients", icon: Store, group: "العمليات" },
    { name: "الشركاء", href: "/partners", icon: Link, group: "العمليات" },
    { name: "المناقصات", href: "/tenders", icon: Briefcase, group: "العمليات" },

    // 5) النظام
    { name: "المستندات", href: "/documents", icon: FileText, group: "النظام" },
    { name: "معلومات الشركة", href: "/company", icon: Building2, group: "النظام" },
    { name: "التقويم", href: "/calendar", icon: CalendarIcon, group: "النظام" },
    { name: "الإشعارات والأتمتة", href: "/notifications", icon: Bell, group: "النظام" },
    { name: "الإعدادات", href: "/settings", icon: Settings, group: "النظام" },
    { name: "لوحة الإدارة", href: "/admin", icon: Shield, group: "النظام" },
  ];
}
