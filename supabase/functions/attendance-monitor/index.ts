// Attendance automation: scans late/absent employees and queues notifications
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get settings (use first row or defaults)
    const { data: settings } = await supabase
      .from("attendance_automation_settings")
      .select("*")
      .limit(1)
      .maybeSingle();

    const lateThreshold = settings?.late_threshold_minutes ?? 15;
    const channels = settings?.channels ?? ["email", "in_app"];
    const today = new Date().toISOString().split("T")[0];

    // 1) Find late employees today
    const { data: lateRecords } = await supabase
      .from("attendance_records")
      .select("id, employee_id, late_minutes, employees(name, email, phone)")
      .eq("date", today)
      .gte("late_minutes", lateThreshold);

    let queued = 0;
    for (const rec of lateRecords ?? []) {
      const emp: any = rec.employees;
      if (!emp) continue;
      const body = (settings?.late_template ?? "مرحباً {name}، لاحظنا تأخرك اليوم. يرجى إعلامنا بالسبب.")
        .replace("{name}", emp.name);

      for (const ch of channels) {
        await supabase.from("notification_logs").insert({
          channel: ch,
          notification_type: "attendance_late",
          subject: "تنبيه: تأخير الحضور اليوم",
          body,
          recipient_email: ch === "email" ? emp.email : null,
          recipient_phone: ch === "whatsapp" ? emp.phone : null,
          recipient_employee_id: rec.employee_id,
          status: "pending",
          reference_type: "attendance",
          reference_id: rec.id,
          metadata: { late_minutes: rec.late_minutes },
        });
        queued++;
      }
    }

    // 2) Find absences (3-day escalation)
    const { data: employees } = await supabase
      .from("employees")
      .select("id, name, email, phone")
      .eq("status", "active");

    for (const emp of employees ?? []) {
      // Check if absent today
      const { data: rec } = await supabase
        .from("attendance_records")
        .select("status")
        .eq("employee_id", emp.id)
        .eq("date", today)
        .maybeSingle();

      if (rec && rec.status !== "absent") continue;
      if (!rec) {
        // Auto-create absent record
        await supabase.from("attendance_records").insert({
          employee_id: emp.id, date: today, status: "absent",
        });
      }

      // Count consecutive absent days (last 3)
      const last3: string[] = [];
      for (let i = 0; i < 3; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        last3.push(d.toISOString().split("T")[0]);
      }
      const { data: hist } = await supabase
        .from("attendance_records")
        .select("date, status")
        .eq("employee_id", emp.id)
        .in("date", last3);

      const absentDays = (hist ?? []).filter(h => h.status === "absent").length;
      let template = settings?.absence_day1_template ?? "مرحباً {name}، لاحظنا غيابك اليوم.";
      let subject = "تنبيه: غياب اليوم";
      if (absentDays === 2) { template = settings?.absence_day2_template ?? template; subject = "إشعار رسمي: غياب اليوم الثاني"; }
      if (absentDays >= 3) { template = settings?.absence_day3_template ?? template; subject = "⚠️ إنذار: 3 أيام غياب متتالية"; }

      const body = template.replace("{name}", emp.name);
      for (const ch of channels) {
        await supabase.from("notification_logs").insert({
          channel: ch,
          notification_type: `attendance_absence_day${Math.min(absentDays, 3)}`,
          subject, body,
          recipient_email: ch === "email" ? emp.email : null,
          recipient_phone: ch === "whatsapp" ? emp.phone : null,
          recipient_employee_id: emp.id,
          status: "pending",
          reference_type: "attendance_absence",
          metadata: { consecutive_days: absentDays },
        });
        queued++;
      }

      // After 3 days, auto-create a violation
      if (absentDays >= 3) {
        await supabase.from("employee_violations").insert({
          employee_id: emp.id,
          type: "absence",
          description: `غياب ${absentDays} أيام متتالية بدون عذر`,
          date: today,
          severity: "high",
          auto_generated: true,
        });
      }
    }

    return new Response(
      JSON.stringify({ success: true, queued, late_count: lateRecords?.length ?? 0 }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e: any) {
    console.error("attendance-monitor error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
