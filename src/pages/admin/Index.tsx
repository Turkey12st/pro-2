import React from "react";
import { Shield } from "lucide-react";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { PageShell } from "@/components/shared/PageShell";

export default function AdminIndex() {
  return (
    <PageShell
      title="لوحة الإدارة"
      description="إدارة المستخدمين والصلاحيات ومراقبة أمان النظام"
      icon={Shield}
    >
      <AdminDashboard />
    </PageShell>
  );
}