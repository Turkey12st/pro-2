
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
import { RealTimeNotificationBell } from "@/components/shared/RealTimeNotificationBell";

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

  // إنشاء قائمة الانتقال السريع
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
        <Sidebar className="border-l border-sidebar-border bg-sidebar" side="right">
          <SidebarContent>
            <AppNavigation />
          </SidebarContent>
        </Sidebar>
        <main className="flex-1 overflow-hidden">
          {/* Header */}
          <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
            <div className="h-full flex items-center justify-between px-4 sm:px-6">
              <div className="flex items-center gap-3">
                <SidebarTrigger>
                  <div className="p-2 hover:bg-accent rounded-lg transition-colors">
                    <Menu className="h-5 w-5 text-foreground" />
                  </div>
                </SidebarTrigger>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-9 gap-2 hidden sm:flex">
                      <LayoutDashboard className="h-4 w-4" />
                      الانتقال السريع
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56" sideOffset={5}>
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
                              <Link to={link.href} className="flex w-full items-center gap-2 cursor-pointer">
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
              
              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-9 w-9 rounded-full p-0">
                    <Avatar className="h-9 w-9 border-2 border-border">
                      <AvatarImage src={user.imageUrl} alt={user.name} />
                      <AvatarFallback className="bg-primary/10 text-primary font-medium">
                        {user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount sideOffset={5}>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/settings/profile" className="flex w-full items-center cursor-pointer">
                      <User className="ml-2 h-4 w-4" />
                      <span>الملف الشخصي</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="flex w-full items-center cursor-pointer">
                      <Settings className="ml-2 h-4 w-4" />
                      <span>الإعدادات</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="cursor-pointer text-destructive focus:text-destructive" 
                    onClick={handleLogout}
                  >
                    <LogOut className="ml-2 h-4 w-4" />
                    <span>تسجيل الخروج</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          
          {/* Main Content */}
          <div className="overflow-auto h-[calc(100vh-4rem)]">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
