
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AppLayout from "@/components/AppLayout";
import { Users2, Plus, FileText, Download, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import EmployeeList from "@/components/hr/EmployeeList";
import EmployeeForm from "@/components/hr/EmployeeForm";
import { EmployeeCostCalculator } from "@/components/hr/EmployeeCalculator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const queryClient = new QueryClient();

export default function HRPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("list");

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">الموارد البشرية</h1>
          <div className="flex gap-2">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  إضافة موظف
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>إضافة موظف جديد</DialogTitle>
                  <DialogDescription>
                    قم بإدخال معلومات الموظف الجديد. جميع الحقول مطلوبة.
                  </DialogDescription>
                </DialogHeader>
                <EmployeeForm onSuccess={() => setIsDialogOpen(false)} />
              </DialogContent>
            </Dialog>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              تصدير إلى Excel
            </Button>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              استيراد من Excel
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full">
            <TabsTrigger value="list" className="flex-1">قائمة الموظفين</TabsTrigger>
            <TabsTrigger value="calculator" className="flex-1">حاسبة التكاليف</TabsTrigger>
          </TabsList>
          <TabsContent value="list">
            <QueryClientProvider client={queryClient}>
              <EmployeeList />
            </QueryClientProvider>
          </TabsContent>
          <TabsContent value="calculator">
            <EmployeeCostCalculator />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
