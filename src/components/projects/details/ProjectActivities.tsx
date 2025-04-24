
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface ProjectActivitiesProps {
  projectId?: string;
}

export default function ProjectActivities({ projectId }: ProjectActivitiesProps) {
  const activities = [
    {
      id: 1,
      user: { name: "أحمد محمد", avatar: "" },
      action: "أضاف مهمة جديدة",
      target: "تصميم واجهة المستخدم",
      date: new Date(),
    },
    {
      id: 2,
      user: { name: "سارة أحمد", avatar: "" },
      action: "أكملت مهمة",
      target: "تحليل المتطلبات",
      date: new Date(Date.now() - 86400000),
    },
    {
      id: 3,
      user: { name: "محمد علي", avatar: "" },
      action: "أضاف تعليق",
      target: "تم مراجعة التصميم",
      date: new Date(Date.now() - 172800000),
    },
  ];

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <Card key={activity.id}>
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <Avatar className="h-8 w-8">
                <AvatarImage src={activity.user.avatar} />
                <AvatarFallback>{activity.user.name[0]}</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <p>
                  <span className="font-medium">{activity.user.name}</span>{" "}
                  <span className="text-muted-foreground">{activity.action}</span>{" "}
                  <span className="font-medium">{activity.target}</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  {format(activity.date, "dd MMMM yyyy", { locale: ar })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
