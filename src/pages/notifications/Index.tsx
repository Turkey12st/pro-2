import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Bell, Mail, MessageSquare, Smartphone, Settings as SettingsIcon } from "lucide-react";

export default function NotificationsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [{ data: l }, { data: s }] = await Promise.all([
      (supabase as any).from("notification_logs").select("*").order("created_at", { ascending: false }).limit(100),
      (supabase as any).from("attendance_automation_settings").select("*").maybeSingle(),
    ]);
    setLogs(l || []);
    setSettings(s || {
      late_threshold_minutes: 15, late_alert_enabled: true,
      absence_day1_enabled: true, absence_day2_enabled: true, absence_day3_enabled: true,
      channels: ["email", "in_app"],
      late_template: "مرحباً {name}، لاحظنا تأخرك اليوم. نتمنى أن يكون كل شيء على ما يرام. يرجى إعلامنا بالسبب.",
      absence_day1_template: "مرحباً {name}، لاحظنا غيابك اليوم. نأمل أن تكون بخير.",
      absence_day2_template: "إشعار رسمي: غياب اليوم الثاني للموظف {name}.",
      absence_day3_template: "إنذار: غياب 3 أيام متتالية. يجب تعبئة نموذج الغياب.",
    });
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const saveSettings = async () => {
    const payload = { ...settings };
    delete payload.id; delete payload.created_at; delete payload.updated_at;
    const { error } = settings?.id
      ? await (supabase as any).from("attendance_automation_settings").update(payload).eq("id", settings.id)
      : await (supabase as any).from("attendance_automation_settings").insert(payload);
    if (error) toast.error(error.message); else { toast.success("تم حفظ الإعدادات"); load(); }
  };

  const channelIcon = (ch: string) => ch === "email" ? <Mail className="h-4 w-4" /> : ch === "whatsapp" ? <MessageSquare className="h-4 w-4" /> : <Smartphone className="h-4 w-4" />;

  const stats = {
    total: logs.length,
    sent: logs.filter(l => l.status === "sent" || l.status === "delivered").length,
    failed: logs.filter(l => l.status === "failed").length,
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">إجمالي الإشعارات</p><p className="text-2xl font-bold">{stats.total}</p></div><Bell className="h-8 w-8 text-primary" /></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">مُرسَلة بنجاح</p><p className="text-2xl font-bold text-green-600">{stats.sent}</p></div><Mail className="h-8 w-8 text-green-500" /></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">فشل الإرسال</p><p className="text-2xl font-bold text-red-600">{stats.failed}</p></div><MessageSquare className="h-8 w-8 text-red-500" /></div></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>محرك الإشعارات والأتمتة</CardTitle></CardHeader>
        <CardContent>
          <Tabs defaultValue="logs">
            <TabsList>
              <TabsTrigger value="logs">السجل</TabsTrigger>
              <TabsTrigger value="settings"><SettingsIcon className="ml-2 h-4 w-4" />إعدادات الحضور التلقائي</TabsTrigger>
            </TabsList>

            <TabsContent value="logs" className="mt-4">
              {loading ? <p>...</p> : logs.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">لا توجد إشعارات بعد.</p>
              ) : (
                <Table>
                  <TableHeader><TableRow>
                    <TableHead>التاريخ</TableHead><TableHead>القناة</TableHead><TableHead>النوع</TableHead>
                    <TableHead>المستلم</TableHead><TableHead>الموضوع</TableHead><TableHead>الحالة</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {logs.map(l => (
                      <TableRow key={l.id}>
                        <TableCell>{new Date(l.created_at).toLocaleString("ar-SA")}</TableCell>
                        <TableCell><div className="flex items-center gap-2">{channelIcon(l.channel)}{l.channel}</div></TableCell>
                        <TableCell>{l.notification_type}</TableCell>
                        <TableCell>{l.recipient_email || l.recipient_phone || "-"}</TableCell>
                        <TableCell className="max-w-xs truncate">{l.subject || l.body}</TableCell>
                        <TableCell><Badge variant={l.status === "sent" || l.status === "delivered" ? "default" : l.status === "failed" ? "destructive" : "secondary"}>{l.status}</Badge></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>

            <TabsContent value="settings" className="mt-4 space-y-4">
              {settings && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>عتبة التأخير (دقائق)</Label><Input type="number" value={settings.late_threshold_minutes} onChange={(e) => setSettings({ ...settings, late_threshold_minutes: parseInt(e.target.value) })} /></div>
                    <div className="flex items-center justify-between"><Label>تفعيل تنبيه التأخير</Label><Switch checked={settings.late_alert_enabled} onCheckedChange={(v) => setSettings({ ...settings, late_alert_enabled: v })} /></div>
                  </div>
                  <div className="space-y-2">
                    <Label>قوالب الرسائل (استخدم {"{name}"} لاسم الموظف)</Label>
                    <div><Label className="text-xs">رسالة التأخير</Label><Textarea value={settings.late_template} onChange={(e) => setSettings({ ...settings, late_template: e.target.value })} /></div>
                    <div><Label className="text-xs">غياب اليوم 1 (ودية)</Label><Textarea value={settings.absence_day1_template} onChange={(e) => setSettings({ ...settings, absence_day1_template: e.target.value })} /></div>
                    <div><Label className="text-xs">غياب اليوم 2 (رسمية)</Label><Textarea value={settings.absence_day2_template} onChange={(e) => setSettings({ ...settings, absence_day2_template: e.target.value })} /></div>
                    <div><Label className="text-xs">غياب اليوم 3 (إنذار)</Label><Textarea value={settings.absence_day3_template} onChange={(e) => setSettings({ ...settings, absence_day3_template: e.target.value })} /></div>
                  </div>
                  <div className="bg-muted p-3 rounded-lg text-sm">
                    <p><strong>القنوات النشطة:</strong> {settings.channels?.join(", ")}</p>
                    <p className="text-muted-foreground mt-1">📧 البريد الإلكتروني مفعّل. لتفعيل WhatsApp، اربط Twilio من الإعدادات.</p>
                  </div>
                  <Button onClick={saveSettings}>حفظ الإعدادات</Button>
                </>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
