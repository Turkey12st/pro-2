
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ProjectTeamProps {
  projectId?: string;
}

export default function ProjectTeam({ projectId }: ProjectTeamProps) {
  const { data: project } = useQuery({
    queryKey: ["project-team", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("team_members")
        .eq("id", projectId)
        .single();

      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {project?.team_members?.map((member: any) => (
        <Card key={member.id}>
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={member.avatar} />
                <AvatarFallback>{member.name?.[0]}</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h3 className="font-medium">{member.name}</h3>
                <p className="text-sm text-muted-foreground">{member.role}</p>
                <Badge variant="outline">{member.department}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
