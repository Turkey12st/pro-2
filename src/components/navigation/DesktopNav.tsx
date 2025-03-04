
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { MenuItem } from "@/types/navigation";

interface DesktopNavProps {
  menuItems: MenuItem[];
  groupedMenuItems?: Record<string, MenuItem[]>;
  isActive: (href: string) => boolean;
  user: any;
}

export function DesktopNav({ menuItems, groupedMenuItems = {}, isActive, user }: DesktopNavProps) {
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const navigate = useNavigate();

  const handleMenuClick = (href: string) => {
    navigate(href);
  };

  const toggleGroup = (group: string) => {
    setOpenGroups(prev => ({
      ...prev,
      [group]: !prev[group]
    }));
  };

  return (
    <div className="hidden md:flex flex-col h-full">
      <div className="p-3 border-b">
        <Link to="/" className="flex justify-center">
          <img 
            src="/logo-color.png" 
            alt="Logo" 
            className="h-10" 
          />
        </Link>
      </div>
      
      <nav className="p-2 space-y-1 flex-1 overflow-y-auto">
        {Object.keys(groupedMenuItems).length > 0 ? (
          Object.entries(groupedMenuItems).map(([group, items]) => (
            <div key={group} className="mb-4">
              <h3 className="px-3 mb-2 text-xs font-semibold text-muted-foreground">{group}</h3>
              {items.map((item) => (
                <NavMenuItem 
                  key={item.title} 
                  item={item} 
                  isActive={isActive} 
                  onClick={handleMenuClick} 
                />
              ))}
            </div>
          ))
        ) : (
          menuItems.map((item) => (
            <NavMenuItem 
              key={item.title} 
              item={item} 
              isActive={isActive} 
              onClick={handleMenuClick} 
            />
          ))
        )}
      </nav>
      
      {user && (
        <div className="p-3 border-t">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarImage src={user.imageUrl} alt={user.firstName || "مستخدم"} />
              <AvatarFallback>
                {user.firstName?.charAt(0) || user.username?.charAt(0) || "م"}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium truncate w-36">
                {user.firstName || user.username || "مستخدم النظام"}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// NavMenuItem component to handle rendering of menu items
function NavMenuItem({ item, isActive, onClick }: { 
  item: MenuItem; 
  isActive: (href: string) => boolean; 
  onClick: (href: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  
  const handleClick = () => {
    if (item.children) {
      setIsOpen(!isOpen);
    } else {
      onClick(item.href);
    }
  };
  
  return (
    <div className="mb-1">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "flex w-full justify-start gap-2 items-center py-2",
                isActive(item.href) && "bg-muted font-medium text-primary",
                item.disabled && "opacity-50 cursor-not-allowed"
              )}
              onClick={handleClick}
              disabled={item.disabled}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.title}</span>
              {item.new && (
                <span className="bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full mr-auto">
                  جديد
                </span>
              )}
              {item.badge && (
                <span className="bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full mr-auto">
                  {item.badge}
                </span>
              )}
              {item.children && (
                <span className={`mr-auto transform transition-transform ${isOpen ? 'rotate-90' : ''}`}>
                  ›
                </span>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" className="mr-2">
            {item.title}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      {/* Submenu */}
      {item.children && isOpen && (
        <div className="pr-5 mt-1 space-y-1">
          {item.children.map((child) => (
            <Button
              key={child.title}
              variant="ghost"
              className={cn(
                "w-full justify-start gap-2 pl-10 py-1.5",
                isActive(child.href) && "bg-muted font-medium text-primary",
                child.disabled && "opacity-50 cursor-not-allowed"
              )}
              onClick={() => onClick(child.href)}
              disabled={child.disabled}
            >
              <child.icon className="h-4 w-4" />
              <span>{child.title}</span>
              {child.new && (
                <span className="bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full mr-auto">
                  جديد
                </span>
              )}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
