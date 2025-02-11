
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AppLayout from "@/components/AppLayout";
import { Users, Plus, FileText, Download } from "lucide-react";
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

const queryClient = new QueryClient();

export default function HRPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Card className="flex-1">
            <CardHeader>
              <CardTitle className="text-primary flex items-center gap-2">
                <Users className="h-5 w-5" />
                الموارد البشرية
              </CardTitle>
            </CardHeader>
            <CardContent className="flex gap-4">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 ml-2" />
                    إضافة موظف جديد
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
              <Button variant="outline">
                <FileText className="h-4 w-4 ml-2" />
                تصدير إلى Excel
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 ml-2" />
                استيراد من Excel
              </Button>
            </CardContent>
          </Card>
        </div>

        <QueryClientProvider client={queryClient}>
          <EmployeeList />
        </QueryClientProvider>
      </div>
    </AppLayout>
  );
}
