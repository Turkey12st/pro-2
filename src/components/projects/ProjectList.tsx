
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Pencil, 
  Trash2, 
  MoreVertical, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

type Project = {
  id: string;
  title: string;
  start_date: string;
  end_date: string | null;
  status: string;
  budget: number;
  progress: number;
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "planned":
      return { label: "مخطط له", variant: "secondary", icon: <Clock className="h-3 w-3 mr-1" /> };
    case "in-progress":
      return { label: "قيد التنفيذ", variant: "warning", icon: <AlertTriangle className="h-3 w-3 mr-1" /> };
    case "completed":
      return { label: "مكتمل", variant: "success", icon: <CheckCircle className="h-3 w-3 mr-1" /> };
    case "cancelled":
      return { label: "ملغي", variant: "destructive", icon: <XCircle className="h-3 w-3 mr-1" /> };
    default:
      return { label: status, variant: "outline", icon: null };
  }
};

export default function ProjectList() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  // استعلام لجلب المشاريع
  const { data: projects, isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Project[];
    },
  });

  // حذف مشروع
  const deleteProjectMutation = useMutation({
    mutationFn: async (projectId: string) => {
      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", projectId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast({
        title: "تم حذف المشروع بنجاح",
        description: "تم حذف المشروع من قاعدة البيانات",
      });
      setDeleteDialogOpen(false);
      setProjectToDelete(null);
    },
    onError: (error) => {
      console.error("Error deleting project:", error);
      toast({
        variant: "destructive",
        title: "خطأ في حذف المشروع",
        description: "حدث خطأ أثناء محاولة حذف المشروع"
      });
    }
  });

  // تغيير حالة المشروع
  const updateProjectStatusMutation = useMutation({
    mutationFn: async ({ projectId, status }: { projectId: string, status: string }) => {
      const { error } = await supabase
        .from("projects")
        .update({ status })
        .eq("id", projectId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast({
        title: "تم تحديث حالة المشروع",
        description: "تم تحديث حالة المشروع بنجاح",
      });
    },
    onError: (error) => {
      console.error("Error updating project status:", error);
      toast({
        variant: "destructive",
        title: "خطأ في تحديث حالة المشروع",
        description: "حدث خطأ أثناء محاولة تحديث حالة المشروع"
      });
    }
  });

  // تأكيد حذف المشروع
  const confirmDeleteProject = (project: Project) => {
    setProjectToDelete(project);
    setDeleteDialogOpen(true);
  };

  // تنفيذ حذف المشروع
  const executeDeleteProject = () => {
    if (projectToDelete) {
      deleteProjectMutation.mutate(projectToDelete.id);
    }
  };

  // تغيير حالة المشروع
  const changeProjectStatus = (projectId: string, status: string) => {
    updateProjectStatusMutation.mutate({ projectId, status });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>عنوان المشروع</TableHead>
              <TableHead>تاريخ البداية</TableHead>
              <TableHead>تاريخ النهاية</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead>الميزانية</TableHead>
              <TableHead>نسبة الإنجاز</TableHead>
              <TableHead>الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                  لا توجد مشاريع متاحة. قم بإضافة مشروع جديد للبدء.
                </TableCell>
              </TableRow>
            ) : (
              projects?.map((project) => {
                const statusBadge = getStatusBadge(project.status);
                
                return (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium">{project.title}</TableCell>
                    <TableCell>
                      {format(new Date(project.start_date), "dd MMMM yyyy", {
                        locale: ar,
                      })}
                    </TableCell>
                    <TableCell>
                      {project.end_date
                        ? format(new Date(project.end_date), "dd MMMM yyyy", {
                            locale: ar,
                          })
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={statusBadge.variant as "default" | "secondary" | "destructive" | "outline" | "success" | "warning"}
                        className="flex items-center w-fit"
                      >
                        {statusBadge.icon}
                        {statusBadge.label}
                      </Badge>
                    </TableCell>
                    <TableCell dir="ltr" className="text-left">
                      {project.budget?.toLocaleString("en-US")} ريال
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={project.progress} className="h-2 w-full" />
                        <span className="text-xs w-12 text-left">{project.progress}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>خيارات المشروع</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="gap-2">
                            <Pencil className="h-4 w-4" />
                            تعديل المشروع
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="gap-2 text-destructive focus:text-destructive"
                            onClick={() => confirmDeleteProject(project)}
                          >
                            <Trash2 className="h-4 w-4" />
                            حذف المشروع
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuLabel>تغيير الحالة</DropdownMenuLabel>
                          <DropdownMenuItem 
                            className="gap-2"
                            onClick={() => changeProjectStatus(project.id, "planned")}
                          >
                            <Clock className="h-4 w-4" />
                            مخطط له
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="gap-2"
                            onClick={() => changeProjectStatus(project.id, "in-progress")}
                          >
                            <AlertTriangle className="h-4 w-4" />
                            قيد التنفيذ
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="gap-2"
                            onClick={() => changeProjectStatus(project.id, "completed")}
                          >
                            <CheckCircle className="h-4 w-4" />
                            مكتمل
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="gap-2"
                            onClick={() => changeProjectStatus(project.id, "cancelled")}
                          >
                            <XCircle className="h-4 w-4" />
                            ملغي
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* حوار تأكيد الحذف */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد من حذف المشروع؟</AlertDialogTitle>
            <AlertDialogDescription>
              هذا الإجراء لا يمكن التراجع عنه. سيتم حذف المشروع نهائياً من قاعدة البيانات.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={executeDeleteProject}
              className="bg-destructive hover:bg-destructive/90"
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
