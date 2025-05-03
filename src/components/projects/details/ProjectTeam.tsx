
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TeamMember {
  id: string;
  name: string;
  avatar?: string;
  role?: string;
  department?: string;
}

interface ProjectTeamProps {
  projectId?: string;
}

export default function ProjectTeam({ projectId }: ProjectTeamProps) {
  const { data: project } = useQuery({
    queryKey: ["project-team", projectId],
    queryFn: async () => {
      if (!projectId) return null;
      
      const { data, error } = await supabase
        .from("projects")
        .select("team_members")
        .eq("id", projectId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!projectId
  });

  // Parse team members safely, ensuring we have an array of the correct type
  const teamMembers: TeamMember[] = project?.team_members 
    ? (typeof project.team_members === 'object' && project.team_members !== null
        ? (Array.isArray(project.team_members)
            ? project.team_members.map((member: any) => ({
                id: member.id || "",
                name: member.name || "",
                avatar: member.avatar || undefined,
                role: member.role || undefined,
                department: member.department || undefined
              }))
            : [])
        : [])
    : [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {teamMembers.length > 0 ? (
        teamMembers.map((member) => (
          <Card key={member.id}>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={member.avatar} />
                  <AvatarFallback>{member.name?.[0]}</AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <h3 className="font-medium">{member.name}</h3>
                  <p className="text-sm text-muted-foreground">{member.role || "غير محدد"}</p>
                  <Badge variant="outline">{member.department || "غير محدد"}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <div className="col-span-3 text-center py-6 text-muted-foreground">
          لم يتم إضافة أعضاء للفريق بعد
        </div>
      )}
    </div>
  );
}
