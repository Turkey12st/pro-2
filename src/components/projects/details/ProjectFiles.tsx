
import { Card, CardContent } from "@/components/ui/card";
import { FileText } from "lucide-react";

interface ProjectFilesProps {
  projectId?: string;
}

export default function ProjectFiles({ projectId }: ProjectFilesProps) {
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
