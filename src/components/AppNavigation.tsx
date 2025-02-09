
import { Building2, Users, Calculator, FolderKanban, UserSquare2, LineChart, Wallet, FileText } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

const navigation = [
  {
    name: "إدارة الشركة",
    href: "/",
    icon: Building2,
  },
  {
    name: "المحاسبة",
    href: "/accounting",
    icon: Calculator,
  },
  {
    name: "الموارد البشرية",
    href: "/hr",
    icon: Users,
  },
  {
    name: "المشاريع",
    href: "/projects",
    icon: FolderKanban,
  },
  {
    name: "العملاء",
    href: "/clients",
    icon: UserSquare2,
  },
  {
    name: "التقارير المالية",
    href: "/financial",
    icon: FileText,
  },
  {
    name: "الزكاة والضرائب",
    href: "/zakat",
    icon: Wallet,
  },
  {
    name: "لوحة المعلومات",
    href: "/dashboard",
    icon: LineChart,
  },
];

export default function AppNavigation() {
  return (
    <nav className="space-y-1 px-2">
      {navigation.map((item) => (
        <NavLink
          key={item.name}
          to={item.href}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-x-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent"
            )
          }
        >
          <item.icon className="h-5 w-5" />
          {item.name}
        </NavLink>
      ))}
    </nav>
  );
}
