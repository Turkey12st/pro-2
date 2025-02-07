
import { SidebarProvider, Sidebar, SidebarContent, SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Menu } from "lucide-react";
import AppNavigation from "./AppNavigation";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <SidebarProvider>
      <div dir="rtl" className="min-h-screen flex w-full bg-background">
        <Sidebar className="border-l">
          <SidebarContent>
            <AppNavigation />
          </SidebarContent>
        </Sidebar>
        <main className="flex-1 overflow-hidden">
          <div className="h-16 border-b flex items-center px-6">
            <SidebarTrigger>
              <div className="p-2 hover:bg-accent rounded-md transition-colors">
                <Menu className="h-5 w-5" />
              </div>
            </SidebarTrigger>
          </div>
          <div className="p-6 overflow-auto max-h-[calc(100vh-4rem)]">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
