import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { CalendarDays, FileText, ClipboardCheck, ChevronLeft, Check, X, Loader2 } from "lucide-react";

type ApprovalKind = "leave" | "journal_entry" | "document";

type ApprovalItem = {
  key: string;
  recordId: string;
  kind: ApprovalKind;
  label: string;
  meta: string;
  route: string;
  icon: React.ElementType;
};

/**
 * Aggregates items awaiting a decision across modules:
 * - Pending leave requests (HR)      -> approvable inline
 * - Draft journal entries (Finance)  -> approvable inline
 * - Company documents expiring soon  -> informational
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
      key: `leave-${l.id}`,
      recordId: l.id,
      kind: "leave",
      label: `طلب إجازة (${l.leave_type ?? "—"})`,
      meta: `${l.start_date ?? ""} · ${l.days_count ?? 0} يوم`,
      route: "/hr",
      icon: CalendarDays,
    })
  );

  (entries.data ?? []).forEach((e: any) =>
    items.push({
      key: `je-${e.id}`,
      recordId: e.id,
      kind: "journal_entry",
      label: e.description || "قيد محاسبي غير مرحّل",
      meta: `${e.entry_date ?? ""} · ${Number(e.total_debit ?? 0).toLocaleString("ar-SA")} ر.س`,
      route: "/accounting",
      icon: ClipboardCheck,
    })
  );

  (docs.data ?? []).forEach((d: any) =>
    items.push({
      key: `doc-${d.id}`,
      recordId: d.id,
      kind: "document",
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
  const queryClient = useQueryClient();
  const [rejecting, setRejecting] = useState<ApprovalItem | null>(null);
  const [notes, setNotes] = useState("");
  const [busyKey, setBusyKey] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["approval-queue"],
    queryFn: fetchApprovals,
    staleTime: 60_000,
  });

  const decide = useMutation({
    mutationFn: async (v: { item: ApprovalItem; action: "approve" | "reject"; notes?: string }) => {
      const { data: res, error } = await supabase.rpc("approve_request", {
        p_type: v.item.kind,
        p_id: v.item.recordId,
        p_action: v.action,
        p_notes: v.notes ?? null,
      });
      if (error) throw error;
      return res;
    },
    onMutate: (v) => setBusyKey(v.item.key),
    onSettled: () => setBusyKey(null),
    onSuccess: (_res, v) => {
      toast.success(v.action === "approve" ? "تم الاعتماد وتحديث الحالة" : "تم رفض الطلب");
      setRejecting(null);
      setNotes("");
      queryClient.invalidateQueries({ queryKey: ["approval-queue"] });
      queryClient.invalidateQueries({ queryKey: ["recent-activity"] });
      queryClient.invalidateQueries({ queryKey: ["executive-dashboard"] });
    },
    onError: (e: any) => toast.error(e?.message || "تعذّر تنفيذ الإجراء"),
  });

  return (
    <>
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
              const actionable = item.kind !== "document";
              const busy = busyKey === item.key;
              return (
                <div
                  key={item.key}
                  className="flex items-center justify-between gap-2 rounded-lg px-3 py-2.5 hover:bg-muted/60 transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => navigate(item.route)}
                    className="flex items-center gap-3 min-w-0 flex-1 text-start"
                  >
                    <Icon className="h-4 w-4 shrink-0 text-primary" />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">{item.label}</span>
                      <span className="block truncate text-xs text-muted-foreground">{item.meta}</span>
                    </span>
                  </button>

                  {actionable ? (
                    <span className="flex items-center gap-1 shrink-0">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10"
                        aria-label="اعتماد"
                        disabled={busy}
                        onClick={() => decide.mutate({ item, action: "approve" })}
                      >
                        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                        aria-label="رفض"
                        disabled={busy}
                        onClick={() => { setRejecting(item); setNotes(""); }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </span>
                  ) : (
                    <ChevronLeft className="h-4 w-4 shrink-0 text-muted-foreground rtl:rotate-0 ltr:rotate-180" />
                  )}
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      <Dialog open={!!rejecting} onOpenChange={(o) => !o && setRejecting(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>رفض الطلب</DialogTitle>
            <DialogDescription>{rejecting?.label}</DialogDescription>
          </DialogHeader>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="سبب الرفض (يُحفظ في سجل التدقيق)"
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejecting(null)}>إلغاء</Button>
            <Button
              variant="destructive"
              disabled={!notes.trim() || decide.isPending}
              onClick={() => rejecting && decide.mutate({ item: rejecting, action: "reject", notes: notes.trim() })}
            >
              {decide.isPending && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
              تأكيد الرفض
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
