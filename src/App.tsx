
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";

// إعداد عميل React Query مع خيارات محسنة
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 1000 * 60 * 5, // 5 دقائق
      gcTime: 1000 * 60 * 10, // 10 دقائق
    },
    mutations: {
      retry: 1,
    },
  },
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* توجيه مباشر للوحة التحكم */}
            <Route 
              path="/" 
              element={<Navigate to="/dashboard" replace />} 
            />
            
            {/* جميع صفحات التطبيق */}
            <Route 
              path="/*" 
              element={<AppLayout />} 
            />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
