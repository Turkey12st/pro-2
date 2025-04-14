
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Settings, LogOut, User } from "lucide-react";
import type { MenuItem } from "@/types/navigation";

interface DesktopNavProps {
  menuItems: MenuItem[];
  groupedMenuItems: Record<string, MenuItem[]>;
  isActive: (href: string) => boolean;
  user: any;
}

export function DesktopNav({ menuItems, groupedMenuItems, isActive, user }: DesktopNavProps) {
  return (
    <nav className="hidden md:flex flex-col h-full bg-card">
      <div className="p-4 border-b flex items-center">
        <img src="/logo-color.png" alt="Logo" className="h-8" />
        <span className="font-bold text-xl mr-2">نظام الشركة</span>
      </div>
      
      <div className="flex-1 overflow-auto p-2">
        <div className="space-y-1">
          {Object.entries(groupedMenuItems).map(([group, items]) => (
            <div key={group} className="mb-4">
              <h3 className="px-3 mb-2 text-xs font-semibold text-muted-foreground">{group}</h3>
              {items.map((item) => (
                <div key={item.name}>
                  {item.children ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className={cn(
                            "w-full justify-start gap-2 my-1",
                            isActive(item.href) && "bg-accent"
                          )}
                          disabled={item.disabled}
                        >
                          {item.icon && <item.icon className="h-4 w-4" />}
                          <span>{item.name}</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="start"
                        className="w-56 bg-card bg-opacity-100 border border-border"
                        side="right"
                      >
                        {item.children.map((child) => (
                          <Link to={child.href} key={child.name}>
                            <DropdownMenuItem
                              className={cn(
                                "gap-2",
                                isActive(child.href) && "bg-accent"
                              )}
                              disabled={child.disabled}
                            >
                              {child.icon && <child.icon className="h-4 w-4" />}
                              <span>{child.name}</span>
                            </DropdownMenuItem>
                          </Link>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <Button
                      asChild
                      variant="ghost"
                      className={cn(
                        "w-full justify-start gap-2 my-1",
                        isActive(item.href) && "bg-accent"
                      )}
                      disabled={item.disabled}
                    >
                      <Link to={item.href}>
                        {item.icon && <item.icon className="h-4 w-4" />}
                        <span>{item.name}</span>
                        {item.new && (
                          <span className="bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full mr-2">
                            جديد
                          </span>
                        )}
                      </Link>
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      
      <div className="p-4 border-t">
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start gap-2"
              >
                <Avatar className="h-6 w-6">
                  <AvatarImage
                    src={user.imageUrl}
                    alt={user.firstName || "مستخدم"}
                  />
                  <AvatarFallback>
                    {user.firstName?.charAt(0) || user.username?.charAt(0) || "م"}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">
                  {user.firstName || user.username || "حسابي"}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 bg-card bg-opacity-100 border border-border"
            >
              <DropdownMenuLabel>حسابي</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2">
                <User className="h-4 w-4" />
                <span>الملف الشخصي</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2">
                <Settings className="h-4 w-4" />
                <span>الإعدادات</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2 text-destructive">
                <LogOut className="h-4 w-4" />
                <span>تسجيل الخروج</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </nav>
  );
}
