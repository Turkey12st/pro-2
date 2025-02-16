
import { useQuery } from "@tanstack/react-query";
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

const statusColors = {
  planned: "bg-blue-500",
  "in-progress": "bg-yellow-500",
  completed: "bg-green-500",
  cancelled: "bg-red-500",
};

type Project = {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  status: string;
  budget: number;
  progress: number;
};

export default function ProjectList() {
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
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects?.map((project) => (
            <TableRow key={project.id}>
              <TableCell>{project.title}</TableCell>
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
                  className={statusColors[project.status as keyof typeof statusColors]}
                >
                  {project.status}
                </Badge>
              </TableCell>
              <TableCell>
                {project.budget.toLocaleString("ar-SA")} ريال
              </TableCell>
              <TableCell>{project.progress}%</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
