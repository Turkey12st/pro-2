
import { 
  BarChart, 
  Building2, 
  Calculator, 
  Calendar, 
  Contact2, 
  File, 
  Gauge, 
  LayoutDashboard, 
  ListChecks, 
  Menu, 
  Settings, 
  ShoppingBag, 
  User, 
  Wallet, 
  Files,
  Calculator as CalculatorIcon,
  FileCog,
  Search,
  Clock
} from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/useToast";
import { LucideIcon } from "lucide-react";

interface MenuItem {
  title: string;
  icon: LucideIcon;
  href: string;
  children?: MenuItem[];
  new?: boolean;
}

export function AppNavigation() {
  const [isMounted, setIsMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const [pathname, setPathname] = useState("/");
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null); // Simplified user state

  useEffect(() => {
    setIsMounted(true);
    setPathname(location.pathname);
    
    // Mock user data for UI rendering
    setUser({
      firstName: "مستخدم",
      imageUrl: "",
      username: "مستخدم النظام"
    });
  }, [location]);

  useEffect(() => {
    setPathname(location.pathname);
  }, [location.pathname]);

  if (!isMounted) {
    return null;
  }

  const isActive = (href: string): boolean => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  const menuItems: MenuItem[] = [
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

  const handleMenuClick = (href: string) => {
    navigate(href);
    if (window.innerWidth < 768) {
      setIsOpen(false);
    }
  };

  return (
    <>
      <div className="flex flex-col h-full">
        <div className="p-4">
          <div className="flex items-center gap-2 mb-8">
            <img src="/logo-color.png" alt="شعار التطبيق" className="h-8" />
            <h1 className="text-xl font-bold">نظام إدارة الأعمال</h1>
          </div>

          <div className="space-y-1">
            {menuItems.map((item) => (
              item.children ? (
                <Accordion type="single" collapsible key={item.title} defaultValue={isActive(item.href) ? item.title : undefined}>
                  <AccordionItem value={item.title} className="border-none">
                    <AccordionTrigger className="py-2 text-sm font-medium hover:bg-muted px-3 rounded-md">
                      <div className="flex items-center gap-2">
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                        {item.new && (
                          <span className="bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full">جديد</span>
                        )}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-0">
                      <div className="flex flex-col space-y-1 mr-6 border-r pr-2">
                        {item.children.map((child) => (
                          <Button
                            key={child.title}
                            variant="ghost"
                            className={`justify-start px-2 py-1.5 h-auto text-sm ${isActive(child.href) ? 'bg-muted text-primary font-medium' : ''}`}
                            onClick={() => handleMenuClick(child.href)}
                          >
                            <child.icon className="h-4 w-4 mr-2" />
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
                  className={`w-full justify-start mb-1 ${isActive(item.href) ? 'bg-muted text-primary font-medium' : ''}`}
                  onClick={() => handleMenuClick(item.href)}
                >
                  <item.icon className="h-4 w-4 ml-2" />
                  <span>{item.title}</span>
                  {item.new && (
                    <span className="bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full mr-2">جديد</span>
                  )}
                </Button>
              )
            ))}
          </div>
        </div>

        <div className="mt-auto p-4">
          <Separator className="my-4" />
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => {
              toast({
                title: "مرحبًا بك!",
                description: "شكرًا لاستخدامك نظام إدارة الأعمال!",
              });
            }}
          >
            <Settings className="h-4 w-4 ml-2" />
            <span>الإعدادات</span>
          </Button>

          {user && (
            <div className="mt-4 p-3 bg-muted rounded-md">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.imageUrl} alt={user.firstName || user.username || "مستخدم"} />
                  <AvatarFallback>{user.firstName?.charAt(0) || user.username?.charAt(0) || "م"}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{user.firstName || user.username || "مستخدم النظام"}</p>
                  <p className="text-xs text-muted-foreground">مرحبًا بك!</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* القائمة لشاشات الجوال */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[85%] sm:w-[380px]">
          <SheetHeader className="space-y-2">
            <SheetTitle>القائمة الرئيسية</SheetTitle>
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
                    <AccordionTrigger className="py-2 text-sm font-medium">
                      <div className="flex items-center gap-2">
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
                            className={`flex w-full items-center justify-start gap-2 py-2 text-sm transition-colors ${isActive(child.href) ? 'text-primary' : 'hover:bg-muted'}`}
                            onClick={() => handleMenuClick(child.href)}
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
                  className={`flex w-full items-center justify-start gap-2 py-2 text-sm transition-colors ${isActive(item.href) ? 'text-primary' : 'hover:bg-muted'}`}
                  onClick={() => handleMenuClick(item.href)}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                  {item.new && (
                    <span className="bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full mr-2">جديد</span>
                  )}
                </Button>
              )
            ))}
          </div>
          <Separator className="my-4" />
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 w-full justify-start px-4">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.imageUrl} alt={user.firstName || "مستخدم"} />
                    <AvatarFallback>{user.firstName?.charAt(0) || user.username?.charAt(0) || "م"}</AvatarFallback>
                  </Avatar>
                  <span className="font-normal">
                    {user.firstName || user.username || "حسابي"}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-white">
                <DropdownMenuLabel>حسابي</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleMenuClick("/settings")} className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  الإعدادات
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
        </SheetContent>
      </Sheet>
    </>
  );
}
