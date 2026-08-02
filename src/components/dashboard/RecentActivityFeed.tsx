import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Activity } from "lucide-react";

const ACTION_LABELS: Record<string, string> = {
  INSERT: "إضافة",
  UPDATE: "تعديل",
  DELETE: "حذف",
};

const RESOURCE_LABELS: Record<string, string> = {
  employees: "الموظفين",
  journal_entries: "القيود المحاسبية",
  projects: "المشاريع",
  clients: "العملاء",
  company_documents: "المستندات",
  leaves: "الإجازات",
  tenders: "المنافسات",
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "الآن";
  if (mins < 60) return `قبل ${mins} دقيقة`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `قبل ${hrs} ساعة`;
  return `قبل ${Math.floor(hrs / 24)} يوم`;
}

export function RecentActivityFeed() {
  const { data, isLoading } = useQuery({
    queryKey: ["recent-activity"],
    queryFn: async () => {
      const { data } = await supabase
        .from("system_activity")
        .select("id, action, resource_type, created_at")
        .order("created_at", { ascending: false })
        .limit(10);
      return data ?? [];
    },
    staleTime: 30_000,
  });

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center gap-2">
        <Activity className="h-4 w-4 text-primary" />
        <CardTitle className="text-base font-semibold">آخر النشاطات</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <>
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </>
        ) : !data?.length ? (
          <p className="text-sm text-muted-foreground py-6 text-center">لا توجد نشاطات مسجلة</p>
        ) : (
          data.map((a: any) => (
            <div key={a.id} className="flex items-center justify-between gap-3 text-sm">
              <span className="flex items-center gap-2 min-w-0">
                <Badge variant="secondary" className="shrink-0">
                  {ACTION_LABELS[a.action] ?? a.action}
                </Badge>
                <span className="truncate">
                  {RESOURCE_LABELS[a.resource_type] ?? a.resource_type}
                </span>
              </span>
              <span className="shrink-0 text-xs text-muted-foreground">
                {timeAgo(a.created_at)}
              </span>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}