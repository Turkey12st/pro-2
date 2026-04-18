import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, DollarSign, CheckCircle, Clock } from "lucide-react";

export default function CommissionsPage() {
  const [rules, setRules] = useState<any[]>([]);
  const [commissions, setCommissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "", rule_type: "sales", calculation_type: "fixed_percent",
    fixed_percent: "", fixed_amount: "", trigger_event: "payment_collected",
  });

  const load = async () => {
    setLoading(true);
    const [{ data: r }, { data: c }] = await Promise.all([
      (supabase as any).from("commission_rules").select("*").order("created_at", { ascending: false }),
      (supabase as any).from("commissions").select("*, employees(name)").order("created_at", { ascending: false }).limit(100),
    ]);
    setRules(r || []);
    setCommissions(c || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const createRule = async () => {
    if (!form.name) return toast.error("الاسم مطلوب");
    const { error } = await (supabase as any).from("commission_rules").insert({
      name: form.name,
      rule_type: form.rule_type,
      calculation_type: form.calculation_type,
      fixed_percent: form.fixed_percent ? parseFloat(form.fixed_percent) : null,
      fixed_amount: form.fixed_amount ? parseFloat(form.fixed_amount) : null,
      trigger_event: form.trigger_event,
    });
    if (error) return toast.error("فشل: " + error.message);
    toast.success("تمت إضافة القاعدة");
    setOpen(false);
    setForm({ name: "", rule_type: "sales", calculation_type: "fixed_percent", fixed_percent: "", fixed_amount: "", trigger_event: "payment_collected" });
    load();
  };

  const approve = async (id: string) => {
    const { error } = await (supabase as any).from("commissions").update({
      status: "approved", approval_date: new Date().toISOString().split("T")[0], approved_by: (await supabase.auth.getUser()).data.user?.id
    }).eq("id", id);
    if (error) toast.error(error.message); else { toast.success("تمت الموافقة"); load(); }
  };

  const markPaid = async (id: string) => {
    const { error } = await (supabase as any).from("commissions").update({
      status: "paid", paid_date: new Date().toISOString().split("T")[0]
    }).eq("id", id);
    if (error) toast.error(error.message); else { toast.success("تم تسجيل الدفع"); load(); }
  };

  const stats = {
    pending: commissions.filter(c => c.status === "pending").reduce((s, c) => s + Number(c.commission_amount || 0), 0),
    approved: commissions.filter(c => c.status === "approved").reduce((s, c) => s + Number(c.commission_amount || 0), 0),
    paid: commissions.filter(c => c.status === "paid").reduce((s, c) => s + Number(c.commission_amount || 0), 0),
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">معلقة</p><p className="text-2xl font-bold">{stats.pending.toLocaleString()} ر.س</p></div><Clock className="h-8 w-8 text-amber-500" /></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">معتمدة</p><p className="text-2xl font-bold">{stats.approved.toLocaleString()} ر.س</p></div><CheckCircle className="h-8 w-8 text-blue-500" /></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">مدفوعة</p><p className="text-2xl font-bold">{stats.paid.toLocaleString()} ر.س</p></div><DollarSign className="h-8 w-8 text-green-600" /></div></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>نظام العمولات</CardTitle></CardHeader>
        <CardContent>
          <Tabs defaultValue="commissions">
            <TabsList>
              <TabsTrigger value="commissions">العمولات</TabsTrigger>
              <TabsTrigger value="rules">القواعد</TabsTrigger>
            </TabsList>

            <TabsContent value="commissions" className="mt-4">
              {loading ? <p>...جاري التحميل</p> : commissions.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">لا توجد عمولات بعد. سيتم احتسابها تلقائياً عند تحصيل المدفوعات.</p>
              ) : (
                <Table>
                  <TableHeader><TableRow>
                    <TableHead>الموظف</TableHead><TableHead>النوع</TableHead><TableHead>الأساس</TableHead>
                    <TableHead>العمولة</TableHead><TableHead>الحالة</TableHead><TableHead>إجراءات</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {commissions.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell>{c.employees?.name || c.employee_id?.slice(0, 8)}</TableCell>
                        <TableCell><Badge variant="outline">{c.rule_type}</Badge></TableCell>
                        <TableCell>{Number(c.base_amount).toLocaleString()} ر.س</TableCell>
                        <TableCell className="font-bold">{Number(c.commission_amount).toLocaleString()} ر.س</TableCell>
                        <TableCell><Badge>{c.status}</Badge></TableCell>
                        <TableCell>
                          {c.status === "pending" && <Button size="sm" onClick={() => approve(c.id)}>اعتماد</Button>}
                          {c.status === "approved" && <Button size="sm" variant="outline" onClick={() => markPaid(c.id)}>دفع</Button>}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>

            <TabsContent value="rules" className="mt-4">
              <div className="flex justify-end mb-4">
                <Dialog open={open} onOpenChange={setOpen}>
                  <DialogTrigger asChild><Button><Plus className="ml-2 h-4 w-4" />قاعدة جديدة</Button></DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>قاعدة عمولة جديدة</DialogTitle></DialogHeader>
                    <div className="space-y-3">
                      <div><Label>اسم القاعدة *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                      <div><Label>نوع العمولة</Label>
                        <Select value={form.rule_type} onValueChange={(v) => setForm({ ...form, rule_type: v })}>
                          <SelectTrigger /><SelectContent>
                            <SelectItem value="sales">مبيعات</SelectItem>
                            <SelectItem value="collection">تحصيل</SelectItem>
                            <SelectItem value="project">مشروع</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div><Label>طريقة الحساب</Label>
                        <Select value={form.calculation_type} onValueChange={(v) => setForm({ ...form, calculation_type: v })}>
                          <SelectTrigger /><SelectContent>
                            <SelectItem value="fixed_percent">نسبة ثابتة</SelectItem>
                            <SelectItem value="fixed_amount">مبلغ ثابت</SelectItem>
                            <SelectItem value="tiered">متدرج</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {form.calculation_type === "fixed_percent" && (
                        <div><Label>النسبة %</Label><Input type="number" value={form.fixed_percent} onChange={(e) => setForm({ ...form, fixed_percent: e.target.value })} /></div>
                      )}
                      {form.calculation_type === "fixed_amount" && (
                        <div><Label>المبلغ</Label><Input type="number" value={form.fixed_amount} onChange={(e) => setForm({ ...form, fixed_amount: e.target.value })} /></div>
                      )}
                      <div><Label>الحدث المُحفِّز</Label>
                        <Select value={form.trigger_event} onValueChange={(v) => setForm({ ...form, trigger_event: v })}>
                          <SelectTrigger /><SelectContent>
                            <SelectItem value="payment_collected">تحصيل الدفعة</SelectItem>
                            <SelectItem value="sale_closed">إقفال البيع</SelectItem>
                            <SelectItem value="project_completed">اكتمال المشروع</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter><Button onClick={createRule}>إنشاء</Button></DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              {rules.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">لا توجد قواعد. أضف قاعدتك الأولى.</p>
              ) : (
                <Table>
                  <TableHeader><TableRow>
                    <TableHead>الاسم</TableHead><TableHead>النوع</TableHead><TableHead>الحساب</TableHead>
                    <TableHead>القيمة</TableHead><TableHead>المُحفِّز</TableHead><TableHead>نشط</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {rules.map(r => (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium">{r.name}</TableCell>
                        <TableCell><Badge variant="outline">{r.rule_type}</Badge></TableCell>
                        <TableCell>{r.calculation_type}</TableCell>
                        <TableCell>{r.fixed_percent ? `${r.fixed_percent}%` : `${r.fixed_amount} ر.س`}</TableCell>
                        <TableCell>{r.trigger_event}</TableCell>
                        <TableCell>{r.is_active ? "✓" : "✗"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
