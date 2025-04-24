
import { Card, CardContent } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ProjectFile {
  name: string;
  type: string;
  size: string;
  url: string;
}

interface ProjectFilesProps {
  projectId?: string;
}

export default function ProjectFiles({ projectId }: ProjectFilesProps) {
  const { data: project } = useQuery({
    queryKey: ["project-files", projectId],
    queryFn: async () => {
      if (!projectId) return null;
      const { data, error } = await supabase
        .from("projects")
        .select("attachments")
        .eq("id", projectId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!projectId
  });

  // Get attachments safely and transform to the correct type
  const attachments: ProjectFile[] = project?.attachments 
    ? (typeof project.attachments === 'object' && project.attachments !== null
        ? (Array.isArray(project.attachments)
            ? project.attachments.map((file: any) => ({
                name: file.name || "Unnamed File",
                type: file.type || "Unknown",
                size: file.size || "0 KB",
                url: file.url || "#"
              }))
            : [])
        : [])
    : [];

  // If we have real data, show it
  if (attachments.length > 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {attachments.map((file, index) => (
          <Card key={index} className="cursor-pointer hover:bg-accent transition-colors">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-muted-foreground" />
                <div>
                  <h3 className="font-medium">{file.name}</h3>
                  <p className="text-sm text-muted-foreground">{file.type} • {file.size}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Fallback to placeholder data
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="cursor-pointer hover:bg-accent transition-colors">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-muted-foreground" />
              <div>
                <h3 className="font-medium">اسم الملف {i}</h3>
                <p className="text-sm text-muted-foreground">PDF • 2.5 MB</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
