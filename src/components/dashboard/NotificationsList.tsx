
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
        .limit(5);
      
      if (error) throw error;
      return data;
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-primary flex items-center gap-2 text-lg">
          <BellRing className="h-5 w-5" />
          التنبيهات العاجلة
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {notifications?.map((notification) => (
            <div 
              key={notification.id} 
              className="flex items-start gap-3 p-3 bg-muted rounded-lg"
            >
              <AlertTriangle className={`h-5 w-5 ${
                notification.priority === 'high' ? 'text-destructive' : 
                notification.priority === 'medium' ? 'text-yellow-500' : 
                'text-blue-500'
              }`} />
              <div>
                <h4 className="font-medium">{notification.title}</h4>
                <p className="text-sm text-muted-foreground">
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
