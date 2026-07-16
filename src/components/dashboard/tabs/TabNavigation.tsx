
import React from "react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart4, FileText, Wallet, BellIcon, TrendingUp } from "lucide-react";

export function TabNavigation() {
  return (
    <TabsList className="mb-4">
      <TabsTrigger value="financial" className="flex items-center gap-2">
        <BarChart4 className="h-4 w-4" />
        <span>الملخص المالي</span>
      </TabsTrigger>
      <TabsTrigger value="documents" className="flex items-center gap-2">
        <FileText className="h-4 w-4" />
        <span>المستندات</span>
      </TabsTrigger>
      <TabsTrigger value="salaries" className="flex items-center gap-2">
        <Wallet className="h-4 w-4" />
        <span>الرواتب</span>
      </TabsTrigger>
      <TabsTrigger value="performance" className="flex items-center gap-2">
        <TrendingUp className="h-4 w-4" />
        <span>مؤشرات الأداء</span>
      </TabsTrigger>
      <TabsTrigger value="notifications" className="flex items-center gap-2">
        <BellIcon className="h-4 w-4" />
        <span>الإشعارات</span>
      </TabsTrigger>
    </TabsList>
  );
}
