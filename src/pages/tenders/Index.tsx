import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Briefcase, TrendingUp, Award, XCircle } from "lucide-react";
import { PageShell } from "@/components/shared/PageShell";

const STAGES = [
  { value: "lead", label: "عميل محتمل", color: "bg-slate-500" },
  { value: "qualification", label: "تأهيل", color: "bg-blue-500" },
  { value: "go_no_go", label: "قرار المضي", color: "bg-amber-500" },
  { value: "proposal", label: "إعداد العرض", color: "bg-purple-500" },
  { value: "submitted", label: "مُقدَّم", color: "bg-indigo-500" },
  { value: "awarded", label: "فائز", color: "bg-green-600" },
  { value: "rejected", label: "مرفوض", color: "bg-red-500" },
  { value: "cancelled", label: "ملغي", color: "bg-gray-500" },
];

interface Tender {
  id: string;
  tender_number: string;
  title: string;
  client_name: string | null;
  stage: string;
  estimated_value: number;
  contract_value: number | null;
  submission_deadline: string | null;
  win_probability: number;
}

export default function TendersPage() {
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    tender_number: "",
    title: "",
    description: "",
    client_name: "",
    estimated_value: "",
    submission_deadline: "",
    win_probability: "50",
  });

  const load = async () => {
    setLoading(true);
    const { data, error } = await (supabase as any).from("tenders").select("*").order("created_at", { ascending: false });
    if (error) toast.error("فشل تحميل المناقصات: " + error.message);
    else setTenders(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!form.tender_number || !form.title) {
      toast.error("رقم المناقصة والعنوان مطلوبان");
      return;
    }
    const { error } = await (supabase as any).from("tenders").insert({
      tender_number: form.tender_number,
      title: form.title,
      description: form.description || null,
      client_name: form.client_name || null,
      estimated_value: parseFloat(form.estimated_value) || 0,
      submission_deadline: form.submission_deadline || null,
      win_probability: parseInt(form.win_probability) || 50,
      stage: "lead",
    });
    if (error) {
      toast.error("فشل الإنشاء: " + error.message);
      return;
    }
    toast.success("تم إنشاء المناقصة");
    setOpen(false);
    setForm({ tender_number: "", title: "", description: "", client_name: "", estimated_value: "", submission_deadline: "", win_probability: "50" });
    load();
  };

  const updateStage = async (id: string, newStage: string) => {
    const update: any = { stage: newStage };
    if (newStage === "awarded") update.award_date = new Date().toISOString().split("T")[0];
    const { error } = await (supabase as any).from("tenders").update(update).eq("id", id);
    if (error) toast.error("فشل التحديث: " + error.message);
    else {
      toast.success(newStage === "awarded" ? "🎉 تم الفوز! تم إنشاء مشروع تلقائياً" : "تم تحديث المرحلة");
      load();
    }
  };

  const stats = {
    total: tenders.length,
    active: tenders.filter(t => !["awarded", "rejected", "cancelled"].includes(t.stage)).length,
    won: tenders.filter(t => t.stage === "awarded").length,
    pipeline: tenders.filter(t => !["awarded", "rejected", "cancelled"].includes(t.stage)).reduce((s, t) => s + (t.estimated_value || 0), 0),
  };

  return (
    <PageShell
      title="المناقصات والعطاءات"
      description="إدارة خط أنابيب المناقصات ومتابعة مراحل التقديم واحتمالية الفوز"
      icon={Briefcase}
      actions={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              مناقصة جديدة
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>إنشاء مناقصة جديدة</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>رقم المناقصة *</Label><Input value={form.tender_number} onChange={(e) => setForm({ ...form, tender_number: e.target.value })} placeholder="TND-2026-001" /></div>
              <div><Label>العنوان *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
              <div><Label>الوصف</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              <div><Label>اسم العميل</Label><Input value={form.client_name} onChange={(e) => setForm({ ...form, client_name: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>القيمة التقديرية</Label><Input type="number" value={form.estimated_value} onChange={(e) => setForm({ ...form, estimated_value: e.target.value })} /></div>
                <div><Label>احتمالية الفوز %</Label><Input type="number" min="0" max="100" value={form.win_probability} onChange={(e) => setForm({ ...form, win_probability: e.target.value })} /></div>
              </div>
              <div><Label>الموعد النهائي للتقديم</Label><Input type="date" value={form.submission_deadline} onChange={(e) => setForm({ ...form, submission_deadline: e.target.value })} /></div>
            </div>
            <DialogFooter><Button onClick={handleCreate}>إنشاء</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      }
    >
      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">إجمالي المناقصات</p><p className="text-2xl font-bold">{stats.total}</p></div><Briefcase className="h-8 w-8 text-primary" /></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">نشطة</p><p className="text-2xl font-bold">{stats.active}</p></div><TrendingUp className="h-8 w-8 text-blue-500" /></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">فائزة</p><p className="text-2xl font-bold">{stats.won}</p></div><Award className="h-8 w-8 text-green-600" /></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">قيمة الـ Pipeline</p><p className="text-xl font-bold">{stats.pipeline.toLocaleString()} ر.س</p></div><TrendingUp className="h-8 w-8 text-purple-500" /></div></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>خط أنابيب المناقصات</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? <p className="text-center py-8">جاري التحميل...</p> : tenders.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Briefcase className="mx-auto h-12 w-12 mb-3 opacity-50" />
              <p>لا توجد مناقصات بعد. ابدأ بإضافة أول مناقصة.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الرقم</TableHead><TableHead>العنوان</TableHead><TableHead>العميل</TableHead>
                  <TableHead>القيمة</TableHead><TableHead>الاحتمالية</TableHead><TableHead>المرحلة</TableHead>
                  <TableHead>الموعد النهائي</TableHead><TableHead>إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tenders.map((t) => {
                  const stageInfo = STAGES.find(s => s.value === t.stage);
                  return (
                    <TableRow key={t.id}>
                      <TableCell className="font-mono">{t.tender_number}</TableCell>
                      <TableCell>{t.title}</TableCell>
                      <TableCell>{t.client_name || "-"}</TableCell>
                      <TableCell>{(t.contract_value || t.estimated_value || 0).toLocaleString()} ر.س</TableCell>
                      <TableCell>{t.win_probability}%</TableCell>
                      <TableCell><Badge className={stageInfo?.color}>{stageInfo?.label}</Badge></TableCell>
                      <TableCell>{t.submission_deadline || "-"}</TableCell>
                      <TableCell>
                        <Select value={t.stage} onValueChange={(v) => updateStage(t.id, v)}>
                          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                          <SelectContent>{STAGES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </PageShell>
  );
}
