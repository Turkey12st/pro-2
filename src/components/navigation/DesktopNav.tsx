
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { MenuItem } from "@/types/navigation";
import { Separator } from "@/components/ui/separator";
import { Settings } from "lucide-react";
import { useToast } from "@/hooks/useToast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface DesktopNavProps {
  menuItems: MenuItem[];
  isActive: (href: string) => boolean;
  user: any;
}

export function DesktopNav({ menuItems, isActive, user }: DesktopNavProps) {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleMenuClick = (href: string) => {
    navigate(href);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4">
        <div className="flex items-center gap-2 mb-8">
          <img src="/logo-color.png" alt="شعار التطبيق" className="h-8" />
          <h1 className="text-xl font-bold">نظام إدارة الأعمال</h1>
        </div>

        <div className="space-y-1">
          {menuItems.map((item) => (
            item.children ? (
              <Accordion 
                type="single" 
                collapsible 
                key={item.title} 
                defaultValue={isActive(item.href) ? item.title : undefined}
              >
                <AccordionItem value={item.title} className="border-none">
                  <AccordionTrigger className="py-2 text-sm font-medium hover:bg-muted px-3 rounded-md">
                    <div className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                      {item.new && (
                        <span className="bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full">جديد</span>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-0">
                    <div className="flex flex-col space-y-1 mr-6 border-r pr-2">
                      {item.children.map((child) => (
                        <Button
                          key={child.title}
                          variant="ghost"
                          className={`justify-start px-2 py-1.5 h-auto text-sm ${isActive(child.href) ? 'bg-muted text-primary font-medium' : ''}`}
                          onClick={() => handleMenuClick(child.href)}
                        >
                          <child.icon className="h-4 w-4 mr-2" />
                          <span>{child.title}</span>
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
                className={`w-full justify-start mb-1 ${isActive(item.href) ? 'bg-muted text-primary font-medium' : ''}`}
                onClick={() => handleMenuClick(item.href)}
              >
                <item.icon className="h-4 w-4 ml-2" />
                <span>{item.title}</span>
                {item.new && (
                  <span className="bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full mr-2">جديد</span>
                )}
              </Button>
            )
          ))}
        </div>
      </div>

      <div className="mt-auto p-4">
        <Separator className="my-4" />
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={() => {
            toast({
              title: "مرحبًا بك!",
              description: "شكرًا لاستخدامك نظام إدارة الأعمال!",
            });
          }}
        >
          <Settings className="h-4 w-4 ml-2" />
          <span>الإعدادات</span>
        </Button>

        {user && (
          <div className="mt-4 p-3 bg-muted rounded-md">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.imageUrl} alt={user.firstName || user.username || "مستخدم"} />
                <AvatarFallback>{user.firstName?.charAt(0) || user.username?.charAt(0) || "م"}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{user.firstName || user.username || "مستخدم النظام"}</p>
                <p className="text-xs text-muted-foreground">مرحبًا بك!</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
