
import React from "react";
import { TabsList as ShadcnTabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart4, 
  FileText,
  Wallet,
  BellIcon,
  TrendingUp,
} from "lucide-react";

export function TabsList() {
  return (
    <ShadcnTabsList className="mb-4">
      <TabsTrigger value="financial" className="flex items-center space-x-2 space-x-reverse">
        <BarChart4 className="h-4 w-4 ml-2" />
        <span>الملخص المالي</span>
      </TabsTrigger>
      <TabsTrigger value="documents" className="flex items-center space-x-2 space-x-reverse">
        <FileText className="h-4 w-4 ml-2" />
        <span>المستندات</span>
      </TabsTrigger>
      <TabsTrigger value="salaries" className="flex items-center space-x-2 space-x-reverse">
        <Wallet className="h-4 w-4 ml-2" />
        <span>الرواتب</span>
      </TabsTrigger>
      <TabsTrigger value="performance" className="flex items-center space-x-2 space-x-reverse">
        <TrendingUp className="h-4 w-4 ml-2" />
        <span>مؤشرات الأداء</span>
      </TabsTrigger>
      <TabsTrigger value="notifications" className="flex items-center space-x-2 space-x-reverse">
        <BellIcon className="h-4 w-4 ml-2" />
        <span>الإشعارات</span>
      </TabsTrigger>
    </ShadcnTabsList>
  );
}
