
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AppLayout from "@/components/AppLayout";
import { useToast } from "@/components/ui/use-toast";
import { Users } from "lucide-react";

export default function HRPage() {
  const { toast } = useToast();

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-primary flex items-center gap-2">
              <Users className="h-5 w-5" />
              الموارد البشرية
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              قريباً: سيتم إضافة المزيد من ميزات إدارة الموارد البشرية هنا.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
