import { Button } from "@/components/ui/button";
import { 
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger 
} from "@/components/ui/sheet";
import { 
  Accordion, AccordionContent, AccordionItem, AccordionTrigger 
} from "@/components/ui/accordion";
import { Menu, User, Settings, LogOut } from "lucide-react";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { MenuItem } from "@/types/navigation";
import { useNavigate, Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface MobileNavProps {
  menuItems: MenuItem[];
  isActive: (href: string) => boolean;
  user: any;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function MobileNav({ menuItems, isActive, user, isOpen, setIsOpen }: MobileNavProps) {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleMenuClick = (href: string) => {
    navigate(href);
    setIsOpen(false);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setIsOpen(false);
      toast({
        title: "تم تسجيل الخروج",
        description: "تم تسجيل خروجك بنجاح",
      });
      navigate("/auth");
    } catch (error) {
      console.error("Error during logout:", error);
      toast({
        title: "حدث خطأ",
        description: "لم نتمكن من تسجيل خروجك",
        variant: "destructive",
      });
    }
  };

  // Group menu items
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
          <SheetTitle className="text-right">القائمة الرئيسية</SheetTitle>
          <SheetDescription className="text-right">
            استكشف خيارات النظام الأساسية للوصول السريع.
          </SheetDescription>
        </SheetHeader>
        <Separator className="my-4" />
        
        <div className="flex flex-col space-y-1 mt-4">
          {Object.entries(groupedMenuItems).map(([group, items]) => (
            <div key={group} className="mb-4">
              <h3 className="px-3 mb-2 text-xs font-semibold text-muted-foreground">{group}</h3>
              {items.map((item) => (
                item.children ? (
                  <Accordion type="single" collapsible key={item.name}>
                    <AccordionItem value={item.name} className="border-none">
                      <AccordionTrigger className={cn(
                        "py-2 text-sm font-medium",
                        isActive(item.href) && "text-primary"
                      )}>
                        <div className="flex items-center gap-2">
                          {item.icon && <item.icon className="h-4 w-4" />}
                          <span>{item.name}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pr-8">
                        <div className="flex flex-col space-y-2">
                          {item.children.map((child) => (
                            <Link
                              key={child.name}
                              to={child.href}
                              onClick={() => setIsOpen(false)}
                              className={cn(
                                "flex w-full items-center gap-2 py-2 px-2 text-sm transition-colors rounded-md",
                                isActive(child.href) ? 'text-primary bg-accent' : 'hover:bg-muted',
                                child.disabled && "opacity-50 cursor-not-allowed"
                              )}
                            >
                              {child.icon && <child.icon className="h-4 w-4" />}
                              <span>{child.name}</span>
                            </Link>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                ) : (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex w-full items-center gap-2 py-2 px-3 text-sm transition-colors rounded-md",
                      isActive(item.href) ? 'text-primary bg-accent' : 'hover:bg-muted',
                      item.disabled && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    {item.icon && <item.icon className="h-4 w-4" />}
                    <span>{item.name}</span>
                    {item.new && (
                      <span className="bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full mr-2">جديد</span>
                    )}
                  </Link>
                )
              ))}
            </div>
          ))}
        </div>
        
        <Separator className="my-4" />
        {user && (
          <div className="space-y-1">
            <Link
              to="/account"
              onClick={() => setIsOpen(false)}
              className="flex w-full items-center gap-2 py-2 px-3 text-sm transition-colors rounded-md hover:bg-muted"
            >
              <User className="h-4 w-4" />
              <span>الملف الشخصي</span>
            </Link>
            <Link
              to="/settings"
              onClick={() => setIsOpen(false)}
              className="flex w-full items-center gap-2 py-2 px-3 text-sm transition-colors rounded-md hover:bg-muted"
            >
              <Settings className="h-4 w-4" />
              <span>الإعدادات</span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-2 py-2 px-3 text-sm transition-colors rounded-md hover:bg-destructive/10 text-destructive"
            >
              <LogOut className="h-4 w-4" />
              <span>تسجيل الخروج</span>
            </button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
