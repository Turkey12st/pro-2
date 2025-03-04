
import { SidebarProvider, Sidebar, SidebarContent, SidebarTrigger } from "@/components/ui/sidebar";
import { Menu, User, Settings, LogOut, LayoutDashboard, Calculator, Users, Wallet, Calendar, Building, FolderKanban, UserSquare2 } from "lucide-react";
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

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [user] = useState({
    name: "مستخدم النظام",
    email: "user@example.com",
    imageUrl: ""
  });
  const { toast } = useToast();
  const navigate = useNavigate();

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

  const quickLinks = [
    { icon: LayoutDashboard, label: "لوحة المعلومات", href: "/dashboard" },
    { icon: Wallet, label: "المحاسبة", href: "/accounting" },
    { icon: Users, label: "الموارد البشرية", href: "/hr" },
    { icon: Users, label: "الشركاء", href: "/partners" },
    { icon: UserSquare2, label: "العملاء", href: "/clients" },
    { icon: FolderKanban, label: "المشاريع", href: "/projects" },
    { icon: Calculator, label: "الزكاة والضرائب", href: "/zakat" },
    { icon: Building, label: "الشركة", href: "/company" },
    { icon: Calendar, label: "التقويم", href: "/calendar" },
  ];

  return (
    <SidebarProvider>
      <div dir="rtl" className="min-h-screen flex w-full bg-background">
        <Sidebar className="border-l bg-card">
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
                <DropdownMenuContent align="start" className="w-56 bg-card">
                  <DropdownMenuLabel>الانتقال السريع</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {quickLinks.map((link) => (
                    <DropdownMenuItem key={link.href} asChild>
                      <Link to={link.href} className="flex items-center gap-2 cursor-pointer">
                        <link.icon className="h-4 w-4" />
                        <span>{link.label}</span>
                      </Link>
                    </DropdownMenuItem>
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
              <DropdownMenuContent className="w-56 bg-card" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer">
                  <User className="ml-2 h-4 w-4" />
                  <span>الملف الشخصي</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <Settings className="ml-2 h-4 w-4" />
                  <span>الإعدادات</span>
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
