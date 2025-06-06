
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { DesktopNav } from "./navigation/DesktopNav";
import { MobileNav } from "./navigation/MobileNav";
import { getNavigationMenu } from "@/data/navigationMenu";
import { MenuItem } from "@/types/navigation";
import { usePermissions } from "@/hooks/usePermissions";
import { Loader2 } from "lucide-react";

interface AppNavigationProps {
  user?: any;
  onSignOut?: () => void;
}

export function AppNavigation({ user, onSignOut }: AppNavigationProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const [pathname, setPathname] = useState("/");
  const [groupedMenuItems, setGroupedMenuItems] = useState<Record<string, MenuItem[]>>({});
  const [filteredMenuItems, setFilteredMenuItems] = useState<MenuItem[]>([]);
  
  const { 
    userRole, 
    permissions, 
    isLoading: permissionsLoading, 
    hasPermission 
  } = usePermissions();

  useEffect(() => {
    setIsMounted(true);
    setPathname(location.pathname);
  }, [location]);

  useEffect(() => {
    if (!permissionsLoading && isMounted) {
      filterMenuItems();
    }
  }, [permissions, userRole, permissionsLoading, isMounted]);

  const filterMenuItems = () => {
    const allMenuItems = getNavigationMenu();
    
    // تصفية العناصر بناءً على الصلاحيات
    const filtered = allMenuItems.filter(item => {
      if (!item.requiredPermission) return true;
      return hasPermission(item.requiredPermission);
    });

    setFilteredMenuItems(filtered);
    
    // تجميع العناصر حسب المجموعة
    const grouped: Record<string, MenuItem[]> = {};
    
    filtered.forEach(item => {
      const group = item.group || "أخرى";
      if (!grouped[group]) {
        grouped[group] = [];
      }
      grouped[group].push(item);
    });
    
    setGroupedMenuItems(grouped);
  };

  useEffect(() => {
    setPathname(location.pathname);
  }, [location.pathname]);

  if (!isMounted || permissionsLoading) {
    return (
      <div className="fixed inset-0 bg-gray-50 flex items-center justify-center z-50">
        <div className="text-center">
          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-blue-600" />
          <p className="text-sm text-gray-600">جاري تحميل القائمة...</p>
        </div>
      </div>
    );
  }

  const isActive = (href: string): boolean => {
    if (href === "/dashboard") {
      return pathname === "/" || pathname === "/dashboard";
    }
    
    return pathname.startsWith(href);
  };

  const enhancedUser = {
    ...user,
    firstName: user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || "مستخدم",
    fullName: user?.user_metadata?.full_name || user?.email || "مستخدم النظام",
    imageUrl: user?.user_metadata?.avatar_url || "",
    role: userRole,
    permissions: permissions.length
  };

  return (
    <>
      <DesktopNav 
        menuItems={filteredMenuItems} 
        groupedMenuItems={groupedMenuItems}
        isActive={isActive} 
        user={enhancedUser}
        onSignOut={onSignOut}
        userRole={userRole}
        permissions={permissions}
      />
      <MobileNav 
        menuItems={filteredMenuItems} 
        isActive={isActive} 
        user={enhancedUser}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        onSignOut={onSignOut}
        userRole={userRole}
      />
    </>
  );
}
