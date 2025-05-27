
import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, LayoutDashboard, Receipt, Users, FileText, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function QuickNavMenu() {
  const navigate = useNavigate();

  const quickActions = [
    {
      label: "لوحة المعلومات",
      icon: LayoutDashboard,
      href: "/dashboard",
      description: "العودة للوحة الرئيسية"
    },
    {
      label: "المحاسبة",
      icon: Receipt,
      href: "/accounting",
      description: "إدارة الحسابات والقيود"
    },
    {
      label: "الموظفين",
      icon: Users,
      href: "/hr",
      description: "إدارة الموارد البشرية"
    },
    {
      label: "المستندات",
      icon: FileText,
      href: "/documents",
      description: "إدارة الملفات والمستندات"
    },
    {
      label: "رأس المال",
      icon: Building2,
      href: "/capital",
      description: "إدارة رأس المال والاستثمارات"
    }
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Menu className="h-4 w-4" />
          الانتقال السريع
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>الانتقال السريع</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {quickActions.map((action) => (
          <DropdownMenuItem
            key={action.href}
            onClick={() => navigate(action.href)}
            className="flex items-center gap-2 cursor-pointer"
          >
            <action.icon className="h-4 w-4" />
            <div className="flex flex-col">
              <span className="font-medium">{action.label}</span>
              <span className="text-xs text-muted-foreground">{action.description}</span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
