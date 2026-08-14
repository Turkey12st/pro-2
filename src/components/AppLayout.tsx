import { SidebarProvider, Sidebar, SidebarContent, SidebarTrigger } from "@/components/ui/sidebar";
import { Menu, User, Settings, LogOut, Search } from "lucide-react";
import { AppNavigation } from "./AppNavigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, Link } from "react-router-dom";
import { RealTimeNotificationBell } from "@/components/shared/RealTimeNotificationBell";
import { CommandPalette, useCommandPalette } from "@/components/shared/CommandPalette";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const { isRtl } = useLanguage();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { open: cmdOpen, setOpen: setCmdOpen } = useCommandPalette();

  const displayName =
    String(user?.user_metadata?.full_name || user?.user_metadata?.name || "").trim() ||
    user?.email?.split("@")[0] ||
    t("header.systemUser", "مستخدم النظام");
  const email = user?.email || "";
  const imageUrl = String(user?.user_metadata?.avatar_url || "");
  const initials = displayName.trim().slice(0, 2).toUpperCase();

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: t("header.logoutSuccess"),
        description: t("header.logoutSuccessDesc"),
      });
      navigate("/auth", { replace: true });
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
      <div dir={isRtl ? "rtl" : "ltr"} className="flex min-h-[100dvh] w-full overflow-hidden bg-background">
        <Sidebar
          className={isRtl ? "border-l border-sidebar-border bg-sidebar" : "border-r border-sidebar-border bg-sidebar"}
          side={isRtl ? "right" : "left"}
        >
          <SidebarContent>
            <AppNavigation />
          </SidebarContent>
        </Sidebar>

        <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <header className="sticky top-0 z-40 h-16 shrink-0 border-b border-border/80 bg-card/85 backdrop-blur-xl">
            <div className="flex h-full min-w-0 items-center justify-between gap-2 px-3 sm:gap-4 sm:px-6">
              <div className="flex min-w-0 items-center gap-1.5 sm:gap-3">
                <SidebarTrigger aria-label={t("header.openNavigation", "فتح القائمة") }>
                  <div className="rounded-lg p-2 transition-colors hover:bg-accent">
                    <Menu className="h-5 w-5 text-foreground" />
                  </div>
                </SidebarTrigger>

                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 w-9 shrink-0 justify-center px-0 text-muted-foreground sm:w-64 sm:justify-start sm:px-3"
                  onClick={() => setCmdOpen(true)}
                  aria-label={t("header.searchPlaceholder")}
                >
                  <Search className="h-4 w-4 shrink-0" />
                  <span className="hidden truncate sm:inline">{t("header.searchPlaceholder")}</span>
                  <kbd className="ms-auto hidden h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground sm:inline-flex">
                    ⌘K
                  </kbd>
                </Button>
              </div>

              <div className="flex shrink-0 items-center gap-1 sm:gap-2">
                <LanguageSwitcher />
                <RealTimeNotificationBell />

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-9 w-9 rounded-full p-0" aria-label={t("header.accountMenu", "قائمة الحساب")}>
                      <Avatar className="h-9 w-9 border-2 border-border">
                        <AvatarImage src={imageUrl} alt={displayName} />
                        <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64 max-w-[calc(100vw-1.5rem)]" align="end" forceMount sideOffset={8}>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex min-w-0 flex-col gap-1">
                        <p className="truncate text-sm font-semibold leading-none">{displayName}</p>
                        {email && <p className="truncate text-xs leading-none text-muted-foreground">{email}</p>}
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/account" className="flex w-full cursor-pointer items-center">
                        <User className="me-2 h-4 w-4" />
                        <span>{t("header.myAccount")}</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/settings" className="flex w-full cursor-pointer items-center">
                        <Settings className="me-2 h-4 w-4" />
                        <span>{t("header.settings")}</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive" onClick={handleLogout}>
                      <LogOut className="me-2 h-4 w-4" />
                      <span>{t("header.logout")}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          <div className="h-[calc(100dvh-4rem)] min-w-0 overflow-x-hidden overflow-y-auto overscroll-contain">
            {children}
          </div>
        </main>
        <CommandPalette open={cmdOpen} onOpenChange={setCmdOpen} />
      </div>
    </SidebarProvider>
  );
}
