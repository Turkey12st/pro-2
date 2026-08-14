import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { DesktopNav } from "./navigation/DesktopNav";
import { MobileNav } from "./navigation/MobileNav";
import { getNavigationMenu } from "@/data/navigationMenu";
import type { MenuItem } from "@/types/navigation";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";

export function AppNavigation() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { permissions, isLoading } = usePermissions();
  const [isMounted, setIsMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const [pathname, setPathname] = useState("/");
  const [groupedMenuItems, setGroupedMenuItems] = useState<Record<string, MenuItem[]>>({});
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  useEffect(() => {
    setIsMounted(true);
    setPathname(location.pathname);

    const navItems = getNavigationMenu(t).filter((item) =>
      !item.requiredPermissions || item.requiredPermissions.every((permission) => permissions.includes(permission))
    );
    setMenuItems(navItems);

    const grouped: Record<string, MenuItem[]> = {};
    navItems.forEach((item) => {
      const group = item.group || "أخرى";
      if (!grouped[group]) grouped[group] = [];
      grouped[group].push(item);
    });
    setGroupedMenuItems(grouped);
  }, [location.pathname, i18n.language, permissions, t]);

  const navigationUser = user
    ? {
        name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "مستخدم",
        email: user.email || "",
        avatarUrl: user.user_metadata?.avatar_url || "",
      }
    : null;

  const isActive = (href: string): boolean => {
    if (href === "/") return pathname === "/";
    if (href === "/dashboard" && pathname === "/dashboard") return true;
    return pathname.startsWith(href);
  };

  if (!isMounted || isLoading) return null;

  return (
    <>
      <DesktopNav
        menuItems={menuItems}
        groupedMenuItems={groupedMenuItems}
        isActive={isActive}
        user={navigationUser}
      />
      <MobileNav
        menuItems={menuItems}
        isActive={isActive}
        user={navigationUser}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      />
    </>
  );
}
