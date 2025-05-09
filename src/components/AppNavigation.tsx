
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { DesktopNav } from "./navigation/DesktopNav";
import { MobileNav } from "./navigation/MobileNav";
import { getNavigationMenu } from "@/data/navigationMenu";
import { MenuItem } from "@/types/navigation";

export function AppNavigation() {
  const [isMounted, setIsMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const [pathname, setPathname] = useState("/");
  const [user, setUser] = useState<any>(null); // Simplified user state
  const [groupedMenuItems, setGroupedMenuItems] = useState<Record<string, MenuItem[]>>({});
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  useEffect(() => {
    setIsMounted(true);
    setPathname(location.pathname);
    
    // Mock user data for UI rendering
    setUser({
      firstName: "مستخدم",
      imageUrl: "",
      username: "مستخدم النظام"
    });

    // Get menu items
    const navItems = getNavigationMenu();
    setMenuItems(navItems);
    
    // Group menu items by their group property
    const grouped: Record<string, MenuItem[]> = {};
    
    navItems.forEach(item => {
      const group = item.group || "أخرى";
      if (!grouped[group]) {
        grouped[group] = [];
      }
      grouped[group].push(item);
    });
    
    setGroupedMenuItems(grouped);
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
    
    if (href === "/dashboard" && pathname === "/dashboard") {
      return true;
    }
    
    return pathname.startsWith(href);
  };

  return (
    <>
      <DesktopNav 
        menuItems={menuItems} 
        groupedMenuItems={groupedMenuItems}
        isActive={isActive} 
        user={user} 
      />
      <MobileNav 
        menuItems={menuItems} 
        isActive={isActive} 
        user={user} 
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      />
    </>
  );
}
