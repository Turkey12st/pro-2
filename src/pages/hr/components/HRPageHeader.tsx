
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, FileText, Download } from "lucide-react";
import EmployeeForm from "@/components/hr/EmployeeForm";

interface HRPageHeaderProps {
  isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
  handleExportToExcel: () => Promise<void>;
}

export function HRPageHeader({
  isDialogOpen,
  setIsDialogOpen,
  handleExportToExcel
}: HRPageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">الموارد البشرية</h1>
        <p className="text-muted-foreground">
          إدارة الموظفين، الرواتب، والتكاليف
        </p>
      </div>
      <div className="flex flex-wrap gap-2 w-full sm:w-auto">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 flex-1 sm:flex-none">
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
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-2 flex-1 sm:flex-none"
          onClick={handleExportToExcel}
        >
          <FileText className="h-4 w-4" />
          تصدير إلى Excel
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-2 flex-1 sm:flex-none"
        >
          <Download className="h-4 w-4" />
          استيراد من Excel
        </Button>
      </div>
    </div>
  );
}
