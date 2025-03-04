
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
  Settings,
  BookOpen,
  HelpCircle,
  ChevronRight,
  DollarSign
} from "lucide-react";
import { MenuItem } from "@/types/navigation";

export const getNavigationMenu = (): MenuItem[] => [
  {
    title: "الرئيسية",
    icon: LayoutDashboard,
    href: "/",
    group: "نظرة عامة"
  },
  {
    title: "المحاسبة",
    icon: Wallet,
    href: "/accounting",
    group: "العمليات المالية",
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
    group: "العمليات الأساسية",
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
    group: "العمليات الأساسية",
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
    group: "العمليات المالية",
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
    group: "العمليات الأساسية",
  },
  {
    title: "التقارير",
    icon: File,
    href: "/reports",
    group: "التحليل والتقارير",
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
    group: "العمليات المالية"
  },
  {
    title: "الوثائق",
    icon: Files,
    href: "/documents",
    group: "التحليل والتقارير"
  },
  {
    title: "الأدوات",
    icon: Settings,
    href: "/tools",
    group: "الأدوات والإعدادات",
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
  {
    title: "المساعدة",
    icon: HelpCircle,
    href: "/help",
    group: "الأدوات والإعدادات",
    children: [
      {
        title: "دليل المستخدم",
        icon: BookOpen,
        href: "/help/user-guide",
      },
      {
        title: "أسئلة شائعة",
        icon: HelpCircle,
        href: "/help/faq",
      },
    ],
  },
];
