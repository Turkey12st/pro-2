
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, FileSpreadsheet, Upload } from "lucide-react";
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
    <div className="page-header">
      <div className="space-y-1">
        <h1 className="page-title">الموارد البشرية</h1>
        <p className="page-description">
          إدارة الموظفين، الرواتب، والتكاليف
        </p>
      </div>
      <div className="flex flex-wrap gap-2 w-full sm:w-auto">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 flex-1 sm:flex-none shadow-sm">
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
          className="flex items-center gap-2 flex-1 sm:flex-none"
          onClick={handleExportToExcel}
        >
          <FileSpreadsheet className="h-4 w-4" />
          تصدير Excel
        </Button>
        <Button 
          variant="outline" 
          className="flex items-center gap-2 flex-1 sm:flex-none"
        >
          <Upload className="h-4 w-4" />
          استيراد
        </Button>
      </div>
    </div>
  );
}
