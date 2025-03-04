
import {
  LayoutDashboard,
  Wallet,
  Users,
  Calculator,
  FileText,
  Building,
  Calendar,
  Settings,
  UserSquare2,
  FolderKanban,
  Briefcase,
  BookOpen,
  Mail,
  BarChart3,
  Landmark,
  FileBarChart,
  CircleDollarSign,
  Receipt,
  FileCog,
  ShieldCheck,
  BadgeCheck,
} from "lucide-react";
import { MenuItem } from "@/types/navigation";

export function getNavigationMenu(): MenuItem[] {
  return [
    {
      title: "لوحة المعلومات",
      icon: LayoutDashboard,
      href: "/dashboard",
      group: "الرئيسية",
    },
    {
      title: "المحاسبة",
      icon: Wallet,
      href: "/accounting",
      group: "المالية",
      children: [
        {
          title: "القيود اليومية",
          icon: FileText,
          href: "/accounting",
        },
        {
          title: "التقارير المالية",
          icon: BarChart3,
          href: "/financial",
        },
        {
          title: "إدارة رأس المال",
          icon: Landmark,
          href: "/capital",
        },
      ],
    },
    {
      title: "إدارة الشركاء",
      icon: Briefcase,
      href: "/partners",
      group: "المالية",
    },
    {
      title: "الزكاة والضرائب",
      icon: Calculator,
      href: "/zakat",
      group: "المالية",
      children: [
        {
          title: "حاسبة الزكاة",
          icon: CircleDollarSign,
          href: "/zakat",
        },
        {
          title: "تقارير ضريبية",
          icon: FileBarChart,
          href: "/tax-reports",
        },
        {
          title: "السجلات الضريبية",
          icon: Receipt,
          href: "/tax-records",
        },
      ],
    },
    {
      title: "الموارد البشرية",
      icon: Users,
      href: "/hr",
      group: "التشغيل",
      children: [
        {
          title: "الموظفين",
          icon: Users,
          href: "/hr",
        },
        {
          title: "كشف الرواتب",
          icon: Receipt,
          href: "/payroll",
        },
      ],
    },
    {
      title: "إدارة المشاريع",
      icon: FolderKanban,
      href: "/projects",
      group: "التشغيل",
    },
    {
      title: "إدارة العملاء",
      icon: UserSquare2,
      href: "/clients",
      group: "التشغيل",
    },
    {
      title: "المستندات",
      icon: FileText,
      href: "/documents",
      group: "الشركة",
    },
    {
      title: "معلومات الشركة",
      icon: Building,
      href: "/company",
      group: "الشركة",
      children: [
        {
          title: "المعلومات الأساسية",
          icon: BadgeCheck,
          href: "/company",
        },
        {
          title: "شهادات وتراخيص",
          icon: ShieldCheck,
          href: "/documents",
        },
      ],
    },
    {
      title: "التقويم",
      icon: Calendar,
      href: "/calendar",
      group: "أدوات",
    },
    {
      title: "إدارة النظام",
      icon: Settings,
      href: "/settings",
      group: "النظام",
      disabled: false,
    },
  ];
}
