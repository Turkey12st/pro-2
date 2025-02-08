
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AppLayout from "@/components/AppLayout";
import { useToast } from "@/components/ui/use-toast";
import { FolderKanban } from "lucide-react";

export default function ProjectsPage() {
  const { toast } = useToast();

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-primary flex items-center gap-2">
              <FolderKanban className="h-5 w-5" />
              إدارة المشاريع
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              قريباً: سيتم إضافة المزيد من ميزات إدارة المشاريع هنا.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
