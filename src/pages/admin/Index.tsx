import React from "react";
import { Shield } from "lucide-react";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { PageShell } from "@/components/shared/PageShell";
import { useTranslation } from "react-i18next";

export default function AdminIndex() {
  const { t } = useTranslation();
  return (
    <PageShell
      title={t("pages.admin.title")}
      description={t("pages.admin.description")}
      icon={Shield}
    >
      <AdminDashboard />
    </PageShell>
  );
}