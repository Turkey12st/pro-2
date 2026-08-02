import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarDays, FileText, ClipboardCheck, ChevronLeft } from "lucide-react";

type ApprovalItem = {
  id: string;
  label: string;
  meta: string;
  route: string;
  icon: React.ElementType;
};

/**
 * Aggregates items awaiting a decision across modules:
 * - Pending leave requests (HR)
 * - Draft journal entries (Accounting)
 * - Company documents expiring within 30 days
 */
async function fetchApprovals(): Promise<ApprovalItem[]> {
  const in30 = new Date();
  in30.setDate(in30.getDate() + 30);

  const [leaves, entries, docs] = await Promise.all([
    supabase
      .from("leaves")
      .select("id, leave_type, start_date, days_count")
      .eq("status", "pending")
      .order("start_date", { ascending: true })
      .limit(5),
    supabase
      .from("journal_entries")
      .select("id, description, entry_date, total_debit")
      .eq("status", "draft")
      .order("entry_date", { ascending: false })
      .limit(5),
    supabase
      .from("company_documents")
      .select("id, title, expiry_date")
      .lte("expiry_date", in30.toISOString().slice(0, 10))
      .order("expiry_date", { ascending: true })
      .limit(5),
  ]);

  const items: ApprovalItem[] = [];

  (leaves.data ?? []).forEach((l: any) =>
    items.push({
      id: `leave-${l.id}`,
      label: `طلب إجازة (${l.leave_type ?? "—"})`,
      meta: `${l.start_date ?? ""} · ${l.days_count ?? 0} يوم`,
      route: "/hr",
      icon: CalendarDays,
    })
  );

  (entries.data ?? []).forEach((e: any) =>
    items.push({
      id: `je-${e.id}`,
      label: e.description || "قيد محاسبي غير مرحّل",
      meta: `${e.entry_date ?? ""} · ${Number(e.total_debit ?? 0).toLocaleString("ar-SA")} ر.س`,
      route: "/accounting",
      icon: ClipboardCheck,
    })
  );

  (docs.data ?? []).forEach((d: any) =>
    items.push({
      id: `doc-${d.id}`,
      label: d.title || "مستند",
      meta: `ينتهي في ${d.expiry_date ?? ""}`,
      route: "/documents",
      icon: FileText,
    })
  );

  return items;
}

export function ApprovalQueueWidget() {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ["approval-queue"],
    queryFn: fetchApprovals,
    staleTime: 60_000,
  });

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle className="text-base font-semibold">بانتظار الاعتماد</CardTitle>
        {!isLoading && (
          <Badge variant={data && data.length ? "default" : "secondary"}>{data?.length ?? 0}</Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-2">
        {isLoading ? (
          <>
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </>
        ) : !data?.length ? (
          <p className="text-sm text-muted-foreground py-6 text-center">
            لا توجد عناصر بانتظار الاعتماد
          </p>
        ) : (
          data.slice(0, 8).map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant="ghost"
                onClick={() => navigate(item.route)}
                className="w-full justify-between h-auto py-2.5 px-3 text-start"
              >
                <span className="flex items-center gap-3 min-w-0">
                  <Icon className="h-4 w-4 shrink-0 text-primary" />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">{item.label}</span>
                    <span className="block truncate text-xs text-muted-foreground">{item.meta}</span>
                  </span>
                </span>
                <ChevronLeft className="h-4 w-4 shrink-0 text-muted-foreground rtl:rotate-0 ltr:rotate-180" />
              </Button>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}