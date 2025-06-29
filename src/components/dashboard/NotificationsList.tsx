
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BellRing, AlertTriangle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function NotificationsList() {
  const { data: notifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);
      
      if (error) throw error;
      return data;
    }
  });

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-primary flex items-center gap-2 text-sm">
          <BellRing className="h-4 w-4" />
          التنبيهات العاجلة
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {notifications?.map((notification) => (
            <div 
              key={notification.id} 
              className="flex items-start gap-2 p-2 bg-muted rounded-md"
            >
              <AlertTriangle className={`h-3 w-3 mt-0.5 ${
                notification.priority === 'high' ? 'text-destructive' : 
                notification.priority === 'medium' ? 'text-yellow-500' : 
                'text-blue-500'
              }`} />
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-xs truncate">{notification.title}</h4>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {notification.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
