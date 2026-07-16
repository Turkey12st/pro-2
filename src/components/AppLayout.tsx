
import { SidebarProvider, Sidebar, SidebarContent, SidebarTrigger } from "@/components/ui/sidebar";
import { Menu, User, Settings, LogOut, Search } from "lucide-react";
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
import { RealTimeNotificationBell } from "@/components/shared/RealTimeNotificationBell";
import { CommandPalette, useCommandPalette } from "@/components/shared/CommandPalette";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "react-i18next";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const { isRtl } = useLanguage();
  const [user] = useState({
    name: "مستخدم النظام",
    email: "user@example.com",
    imageUrl: ""
  });
  const { toast } = useToast();
  const navigate = useNavigate();
  const { open: cmdOpen, setOpen: setCmdOpen } = useCommandPalette();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: t("header.logoutSuccess"),
        description: t("header.logoutSuccessDesc"),
      });
      navigate("/auth");
    } catch (error) {
      console.error("Error during logout:", error);
      toast({
        title: t("header.logoutError"),
        description: t("header.logoutErrorDesc"),
        variant: "destructive",
      });
    }
  };

  return (
    <SidebarProvider>
      <div dir={isRtl ? "rtl" : "ltr"} className="min-h-screen flex w-full bg-background">
        <Sidebar
          className={isRtl ? "border-l border-sidebar-border bg-sidebar" : "border-r border-sidebar-border bg-sidebar"}
          side={isRtl ? "right" : "left"}
        >
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

                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 gap-2 text-muted-foreground w-64 justify-start"
                  onClick={() => setCmdOpen(true)}
                >
                  <Search className="h-4 w-4" />
                  <span className="hidden sm:inline">{t("header.searchPlaceholder")}</span>
                  <span className="sm:hidden">{t("header.searchShort")}</span>
                  <kbd className="ms-auto hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                    ⌘K
                  </kbd>
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <LanguageSwitcher />
                <RealTimeNotificationBell />

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
                    <Link to="/account" className="flex w-full items-center cursor-pointer">
                      <User className="me-2 h-4 w-4" />
                      <span>{t("header.myAccount")}</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="flex w-full items-center cursor-pointer">
                      <Settings className="me-2 h-4 w-4" />
                      <span>{t("header.settings")}</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="cursor-pointer text-destructive focus:text-destructive" 
                    onClick={handleLogout}
                  >
                    <LogOut className="me-2 h-4 w-4" />
                    <span>{t("header.logout")}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              </div>
            </div>
          </header>
          
          {/* Main Content */}
          <div className="overflow-auto h-[calc(100vh-4rem)]">
            {children}
          </div>
        </main>
        <CommandPalette open={cmdOpen} onOpenChange={setCmdOpen} />
      </div>
    </SidebarProvider>
  );
}
