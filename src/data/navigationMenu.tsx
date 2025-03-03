
import { 
  BarChart, 
  Building2, 
  Calculator, 
  Calendar, 
  Contact2, 
  File, 
  LayoutDashboard, 
  ListChecks, 
  ShoppingBag, 
  User, 
  Wallet, 
  Files,
  Calculator as CalculatorIcon,
  Search,
  Clock,
  Settings
} from "lucide-react";
import { MenuItem } from "@/types/navigation";

export const getNavigationMenu = (): MenuItem[] => [
  {
    title: "الرئيسية",
    icon: LayoutDashboard,
    href: "/",
  },
  {
    title: "المحاسبة",
    icon: Wallet,
    href: "/accounting",
    children: [
      {
        title: "القيود المحاسبية",
        icon: ListChecks,
        href: "/accounting/journal-entries",
      },
      {
        title: "الإيرادات والمصروفات",
        icon: BarChart,
        href: "/accounting/revenue-expenses",
      },
      {
        title: "التقارير المالية",
        icon: File,
        href: "/accounting/reports",
      },
    ],
  },
  {
    title: "المشاريع",
    icon: Building2,
    href: "/projects",
    children: [
      {
        title: "قائمة المشاريع",
        icon: ListChecks,
        href: "/projects",
      },
      {
        title: "تقارير المشاريع",
        icon: File,
        href: "/projects/reports",
      },
    ],
  },
  {
    title: "الموارد البشرية",
    icon: User,
    href: "/hr",
    children: [
      {
        title: "الموظفين",
        icon: Contact2,
        href: "/hr/employees",
      },
      {
        title: "الرواتب",
        icon: Wallet,
        href: "/hr/salaries",
      },
      {
        title: "حاسبة التكاليف",
        icon: Calculator,
        href: "/hr/cost-calculator",
      },
    ],
  },
  {
    title: "المالية",
    icon: BarChart,
    href: "/financial",
    children: [
      {
        title: "التدفقات النقدية",
        icon: Wallet,
        href: "/financial/cash-flow",
      },
      {
        title: "الميزانية",
        icon: File,
        href: "/financial/budget",
      },
      {
        title: "التقارير المالية",
        icon: BarChart,
        href: "/financial/reports",
      },
    ],
  },
  {
    title: "العملاء",
    icon: ShoppingBag,
    href: "/clients",
  },
  {
    title: "التقارير",
    icon: File,
    href: "/reports",
    children: [
      {
        title: "تقارير مالية",
        icon: BarChart,
        href: "/reports/financial",
      },
      {
        title: "تقارير الموارد البشرية",
        icon: User,
        href: "/reports/hr",
      },
      {
        title: "تقارير المشاريع",
        icon: Building2,
        href: "/reports/projects",
      },
    ],
  },
  {
    title: "الزكاة والضرائب",
    icon: Calculator,
    href: "/zakat",
    new: true,
  },
  {
    title: "الوثائق",
    icon: Files,
    href: "/documents",
  },
  {
    title: "الأدوات",
    icon: Settings,
    href: "/tools",
    children: [
      {
        title: "جدولة المهام",
        icon: Calendar,
        href: "/tools/scheduler",
      },
      {
        title: "حاسبة القروض",
        icon: CalculatorIcon,
        href: "/tools/loan-calculator",
      },
      {
        title: "مخطط الأعمال",
        icon: Search,
        href: "/tools/business-planner",
      },
      {
        title: "سجل الأنشطة",
        icon: Clock,
        href: "/tools/activity-log",
      },
    ],
  },
];
