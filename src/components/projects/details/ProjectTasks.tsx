
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface Assignee {
  name: string;
}

interface Task {
  id: string;
  title: string;
  assignee?: Assignee;
  priority: string;
  status: string;
  due_date?: string;
}

interface ProjectTasksProps {
  projectId?: string;
}

export default function ProjectTasks({ projectId }: ProjectTasksProps) {
  const { data: tasksData } = useQuery({
    queryKey: ["project-tasks", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_tasks")
        .select(`
          *,
          assignee:assignee_id (
            name
          )
        `)
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Transform data to ensure it matches the Task interface
  const tasks: Task[] = tasksData ? tasksData.map((task: any) => ({
    id: task.id,
    title: task.title,
    assignee: task.assignee?.error ? { name: "غير محدد" } : task.assignee,
    priority: task.priority,
    status: task.status,
    due_date: task.due_date
  })) : [];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive";
      case "medium":
        return "warning";
      case "low":
        return "secondary";
      default:
        return "default";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "success";
      case "in-progress":
        return "warning";
      case "todo":
        return "secondary";
      default:
        return "default";
    }
  };

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>المهمة</TableHead>
            <TableHead>المسؤول</TableHead>
            <TableHead>الأولوية</TableHead>
            <TableHead>الحالة</TableHead>
            <TableHead>تاريخ الإنجاز</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks?.map((task) => (
            <TableRow key={task.id}>
              <TableCell className="font-medium">{task.title}</TableCell>
              <TableCell>{task.assignee?.name || "غير محدد"}</TableCell>
              <TableCell>
                <Badge variant={getPriorityColor(task.priority)}>{task.priority}</Badge>
              </TableCell>
              <TableCell>
                <Badge variant={getStatusColor(task.status)}>{task.status}</Badge>
              </TableCell>
              <TableCell>
                {task.due_date ? format(new Date(task.due_date), "dd MMMM yyyy", { locale: ar }) : "غير محدد"}
              </TableCell>
            </TableRow>
          ))}
          {(!tasks || tasks.length === 0) && (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                لا توجد مهام مسجلة لهذا المشروع
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
