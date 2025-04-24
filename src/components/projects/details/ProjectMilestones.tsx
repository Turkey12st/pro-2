
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface ProjectMilestonesProps {
  projectId?: string;
}

export default function ProjectMilestones({ projectId }: ProjectMilestonesProps) {
  // This would typically fetch milestone data from the database
  const milestones = [
    { title: "تحليل المتطلبات", progress: 100 },
    { title: "التصميم", progress: 75 },
    { title: "التطوير", progress: 50 },
    { title: "الاختبار", progress: 25 },
    { title: "النشر", progress: 0 },
  ];

  return (
    <div className="space-y-4">
      {milestones.map((milestone) => (
        <Card key={milestone.title}>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <h3 className="font-medium">{milestone.title}</h3>
                <span className="text-sm text-muted-foreground">{milestone.progress}%</span>
              </div>
              <Progress value={milestone.progress} className="h-2" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
