
import { SidebarProvider, Sidebar, SidebarContent, SidebarTrigger } from "@/components/ui/sidebar";
import { Menu, User, Settings, LogOut, LayoutDashboard } from "lucide-react";
import { useState } from "react";
import { AppNavigation } from "./AppNavigation";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { getNavigationMenu } from "@/data/navigationMenu";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [user] = useState({
    name: "مستخدم النظام",
    email: "user@example.com",
    imageUrl: ""
  });
  const { toast } = useToast();
  const navigate = useNavigate();
  const menuItems = getNavigationMenu();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "تم تسجيل الخروج",
        description: "تم تسجيل خروجك بنجاح",
      });
      navigate("/auth/login");
    } catch (error) {
      console.error("Error during logout:", error);
      toast({
        title: "حدث خطأ",
        description: "لم نتمكن من تسجيل خروجك. الرجاء المحاولة مرة أخرى.",
        variant: "destructive",
      });
    }
  };

  // إنشاء قائمة الانتقال السريع مع تصنيف العناصر حسب المجموعة - تظهر أيضًا في الجانب الأيمن
  const organizeQuickLinks = () => {
    const navItems = getNavigationMenu();
    const categories: Record<string, { icon: any, label: string, href: string }[]> = {
      "نظرة عامة": [],
      "العمليات المالية": [],
      "العمليات الأساسية": [],
      "الوثائق والمستندات": [],
      "الأدوات والإعدادات": [],
    };
    
    navItems.forEach(item => {
      if (item.group === "إدارة النظام" && (item.href === "/dashboard")) {
        categories["نظرة عامة"].push({
          icon: item.icon,
          label: item.name,
          href: item.href
        });
      } else if (item.group === "المالية") {
        categories["العمليات المالية"].push({
          icon: item.icon,
          label: item.name,
          href: item.href
        });
      } else if (["إدارة المشاريع", "إدارة الموارد البشرية", "إدارة العملاء"].includes(item.group || "")) {
        categories["العمليات الأساسية"].push({
          icon: item.icon,
          label: item.name,
          href: item.href
        });
      } else if (item.href === "/documents" || item.href === "/company") {
        categories["الوثائق والمستندات"].push({
          icon: item.icon,
          label: item.name,
          href: item.href
        });
      } else if (item.href === "/calendar" || item.href === "/settings") {
        categories["الأدوات والإعدادات"].push({
          icon: item.icon,
          label: item.name,
          href: item.href
        });
      }
    });
    
    return categories;
  };
  
  const quickLinksCategories = organizeQuickLinks();

  return (
    <SidebarProvider>
      <div dir="rtl" className="min-h-screen flex w-full bg-background">
        <Sidebar className="border-l bg-card" side="right">
          <SidebarContent>
            <AppNavigation />
          </SidebarContent>
        </Sidebar>
        <main className="flex-1 overflow-hidden">
          <div className="h-16 border-b flex items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <SidebarTrigger>
                <div className="p-2 hover:bg-accent rounded-md transition-colors">
                  <Menu className="h-5 w-5" />
                </div>
              </SidebarTrigger>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9 gap-1">
                    <LayoutDashboard className="h-4 w-4" />
                    <span className="hidden md:inline">الانتقال السريع</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-popover">
                  <DropdownMenuLabel>الانتقال السريع</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  {Object.entries(quickLinksCategories).map(([category, links]) => (
                    links.length > 0 && (
                      <div key={category}>
                        <DropdownMenuLabel className="text-xs text-muted-foreground py-1">
                          {category}
                        </DropdownMenuLabel>
                        {links.map((link) => (
                          <DropdownMenuItem key={link.href} asChild>
                            <Link to={link.href} className="flex items-center gap-2 cursor-pointer">
                              {link.icon && <link.icon className="h-4 w-4" />}
                              <span>{link.label}</span>
                            </Link>
                          </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                      </div>
                    )
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 rounded-full" size="icon">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.imageUrl} alt={user.name} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-popover" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer" asChild>
                  <Link to="/settings/profile" className="flex items-center">
                    <User className="ml-2 h-4 w-4" />
                    <span>الملف الشخصي</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" asChild>
                  <Link to="/settings" className="flex items-center">
                    <Settings className="ml-2 h-4 w-4" />
                    <span>الإعدادات</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer" onClick={handleLogout}>
                  <LogOut className="ml-2 h-4 w-4" />
                  <span>تسجيل الخروج</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="p-6 overflow-auto max-h-[calc(100vh-4rem)]">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
