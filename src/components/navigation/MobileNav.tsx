
import { Button } from "@/components/ui/button";
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "@/components/ui/sheet";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { Menu, User, Settings, LogOut } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { MenuItem } from "@/types/navigation";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface MobileNavProps {
  menuItems: MenuItem[];
  isActive: (href: string) => boolean;
  user: any;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function MobileNav({ menuItems, isActive, user, isOpen, setIsOpen }: MobileNavProps) {
  const navigate = useNavigate();

  const handleMenuClick = (href: string) => {
    navigate(href);
    if (window.innerWidth < 768) {
      setIsOpen(false);
    }
  };

  // Group menu items by their group property
  const groupedMenuItems: Record<string, MenuItem[]> = {};
  menuItems.forEach(item => {
    const group = item.group || "أخرى";
    if (!groupedMenuItems[group]) {
      groupedMenuItems[group] = [];
    }
    groupedMenuItems[group].push(item);
  });

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[85%] sm:w-[380px] overflow-y-auto">
        <SheetHeader className="space-y-2">
          <SheetTitle>القائمة الرئيسية</SheetTitle>
          <SheetDescription>
            استكشف خيارات النظام الأساسية للوصول السريع.
          </SheetDescription>
        </SheetHeader>
        <Separator className="my-4" />
        
        <div className="flex flex-col space-y-1">
          {/* Group sections */}
          {Object.entries(groupedMenuItems).map(([group, items]) => (
            <div key={group} className="mb-4">
              <h3 className="px-3 mb-2 text-xs font-semibold text-muted-foreground">{group}</h3>
              {items.map((item) => (
                item.children ? (
                  <Accordion type="single" collapsible key={item.title}>
                    <AccordionItem value={item.title} className="border-none">
                      <AccordionTrigger className={cn(
                        "py-2 text-sm font-medium",
                        isActive(item.href) && "text-primary"
                      )}>
                        <div className="flex items-center gap-2">
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                          {item.new && (
                            <span className="bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full mr-2">
                              جديد
                            </span>
                          )}
                          {item.badge && (
                            <span className="bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full mr-2">
                              {item.badge}
                            </span>
                          )}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pl-8">
                        <div className="flex flex-col space-y-2">
                          {item.children.map((child) => (
                            <Button
                              key={child.title}
                              variant="ghost"
                              className={cn(
                                "flex w-full items-center justify-start gap-2 py-2 text-sm transition-colors",
                                isActive(child.href) ? 'text-primary' : 'hover:bg-muted',
                                child.disabled && "opacity-50 cursor-not-allowed"
                              )}
                              onClick={() => handleMenuClick(child.href)}
                              disabled={child.disabled}
                            >
                              <child.icon className="h-4 w-4" />
                              <span>{child.title}</span>
                              {child.new && (
                                <span className="bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full mr-2">
                                  جديد
                                </span>
                              )}
                            </Button>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                ) : (
                  <Button
                    key={item.title}
                    variant="ghost"
                    className={cn(
                      "flex w-full items-center justify-start gap-2 py-2 text-sm transition-colors",
                      isActive(item.href) ? 'text-primary' : 'hover:bg-muted',
                      item.disabled && "opacity-50 cursor-not-allowed"
                    )}
                    onClick={() => handleMenuClick(item.href)}
                    disabled={item.disabled}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                    {item.new && (
                      <span className="bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full mr-2">جديد</span>
                    )}
                    {item.badge && (
                      <span className="bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full mr-2">
                        {item.badge}
                      </span>
                    )}
                  </Button>
                )
              ))}
            </div>
          ))}
        </div>
        
        <Separator className="my-4" />
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 w-full justify-start px-4">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.imageUrl} alt={user.firstName || "مستخدم"} />
                  <AvatarFallback>{user.firstName?.charAt(0) || user.username?.charAt(0) || "م"}</AvatarFallback>
                </Avatar>
                <span className="font-normal">
                  {user.firstName || user.username || "حسابي"}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-white">
              <DropdownMenuLabel>حسابي</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleMenuClick("/settings")} className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                الإعدادات
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
