import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  BarChart,
  Building2,
  Calendar,
  Contact2,
  File,
  Gauge,
  LayoutDashboard,
  ListChecks,
  LucideIcon,
  Menu,
  Settings,
  ShoppingBag,
  User,
  Wallet,
  Files
} from "lucide-react"
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";

interface MenuItem {
  title: string;
  icon: LucideIcon;
  href: string;
  children?: MenuItem[];
}

export function AppNavigation() {
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  const isActive = (href: string): boolean => {
    return pathname === href;
  };

  const menuItems = [
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
      ],
    },
    {
      title: "المشاريع",
      icon: Building2,
      href: "/projects",
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
      ],
    },
    {
      title: "المالية",
      icon: BarChart,
      href: "/financial",
      children: [
        {
          title: "الإيرادات والمصروفات",
          icon: Wallet,
          href: "/financial/revenue-expenses",
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
    },
    {
      title: "الضرائب",
      icon: Gauge,
      href: "/taxes",
    },
    {
      title: "الوثائق",
      icon: Files,
      href: "/documents",
    },
  ];

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:w-[380px]">
        <SheetHeader className="space-y-2">
          <SheetTitle>القائمة</SheetTitle>
          <SheetDescription>
            استكشف خيارات النظام الأساسية للوصول السريع.
          </SheetDescription>
        </SheetHeader>
        <Separator className="my-4" />
        <div className="flex flex-col space-y-1">
          {menuItems.map((item) => (
            item.children ? (
              <Accordion type="single" collapsible key={item.title}>
                <AccordionItem value={item.title} className="border-none">
                  <AccordionTrigger className="group flex items-center justify-between py-2 text-sm font-medium transition-colors hover:underline">
                    <div className="flex items-center space-x-2">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pl-8">
                    <div className="flex flex-col space-y-2">
                      {item.children.map((child) => (
                        <Button
                          key={child.title}
                          variant="ghost"
                          className={`flex w-full items-center justify-start space-x-2 py-2 text-sm transition-colors ${isActive(child.href) ? 'text-primary' : 'hover:underline'}`}
                          onClick={() => router.push(child.href)}
                        >
                          <child.icon className="h-4 w-4" />
                          <span>{child.title}</span>
                        </Button>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            ) : (
              <Button
                key={item.title}
                variant="ghost"
                className={`flex w-full items-center justify-start space-x-2 py-2 text-sm transition-colors ${isActive(item.href) ? 'text-primary' : 'hover:underline'}`}
                onClick={() => router.push(item.href)}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.title}</span>
              </Button>
            )
          ))}
        </div>
        <Separator className="my-4" />
        {user ? (
          <div className="pb-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 w-full justify-start px-4">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.imageUrl} alt={user.firstName || "User Avatar"} />
                    <AvatarFallback>{user.firstName?.charAt(0) || user.username?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                  <span className="font-normal">
                    {user.firstName || user.username || "حسابي"}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>حسابي</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/settings")}>
                  <Settings className="mr-2 h-4 w-4" />
                  الإعدادات
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
