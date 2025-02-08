
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AppLayout from "@/components/AppLayout";
import { useToast } from "@/components/ui/use-toast";
import { LineChart } from "lucide-react";

export default function DashboardPage() {
  const { toast } = useToast();

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-primary flex items-center gap-2">
              <LineChart className="h-5 w-5" />
              لوحة المعلومات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              قريباً: سيتم إضافة المزيد من المؤشرات والإحصائيات هنا.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
