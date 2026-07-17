import React, { useEffect, useState } from "react";
import { Crown, Wallet, TrendingUp, TrendingDown, Users, Briefcase, AlertTriangle, ReceiptText, Building2 } from "lucide-react";
import { PageShell } from "@/components/shared/PageShell";
import { KpiCard } from "@/components/shared/KpiCard";
import { CashFlowChart } from "@/components/dashboard/CashFlowChart";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/contexts/LanguageContext";

interface ExecKpis {
  mtdRevenue: number;
  mtdExpenses: number;
  netMargin: number;
  headcount: number;
  activeProjects: number;
  atRiskProjects: number;
  pendingLeaves: number;
  attendanceAnomalies: number;
  expiringDocs: number;
}

const initial: ExecKpis = {
  mtdRevenue: 0,
  mtdExpenses: 0,
  netMargin: 0,
  headcount: 0,
  activeProjects: 0,
  atRiskProjects: 0,
  pendingLeaves: 0,
  attendanceAnomalies: 0,
  expiringDocs: 0,
};

export default function ExecutiveDashboard() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [kpis, setKpis] = useState<ExecKpis>(initial);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
        .toISOString()
        .slice(0, 10);
      const in90 = new Date(now.getTime() + 90 * 86400000)
        .toISOString()
        .slice(0, 10);

      const [entries, employees, projects, leaves, docs] = await Promise.all([
        (supabase as any)
          .from("journal_entries")
          .select("total_debit,total_credit,entry_date")
          .gte("entry_date", monthStart)
          .limit(2000),
        (supabase as any).from("employees").select("id", { count: "exact", head: true }),
        (supabase as any).from("projects").select("id,status,budget,contract_value"),
        (supabase as any).from("leaves").select("id,status").eq("status", "pending"),
        (supabase as any)
          .from("company_documents")
          .select("id,expiry_date")
          .lte("expiry_date", in90)
          .gte("expiry_date", now.toISOString().slice(0, 10)),
      ]);

      let revenue = 0;
      let expenses = 0;
      (entries.data || []).forEach((e: any) => {
        revenue += Number(e.total_credit) || 0;
        expenses += Number(e.total_debit) || 0;
      });
      const netMargin =
        revenue > 0 ? ((revenue - expenses) / revenue) * 100 : 0;

      const projectRows = projects.data || [];
      const activeProjects = projectRows.filter(
        (p: any) => p.status === "active" || p.status === "in_progress"
      ).length;
      const atRiskProjects = projectRows.filter(
        (p: any) =>
          p.status === "at_risk" ||
          (p.budget && p.contract_value && Number(p.budget) > Number(p.contract_value))
      ).length;

      setKpis({
        mtdRevenue: revenue,
        mtdExpenses: expenses,
        netMargin,
        headcount: employees.count || 0,
        activeProjects,
        atRiskProjects,
        pendingLeaves: (leaves.data || []).length,
        attendanceAnomalies: 0,
        expiringDocs: (docs.data || []).length,
      });
      setLoading(false);
    };
    load().catch(() => setLoading(false));
  }, []);

  const nf = new Intl.NumberFormat(language === "ar" ? "ar-SA" : "en-US", {
    maximumFractionDigits: 0,
  });
  const currency = (v: number) => `${nf.format(v)} ${t("app.currency", "SAR")}`;

  return (
    <PageShell
      title={t("pages.executive.title")}
      description={t("pages.executive.description")}
      icon={Crown}
    >
      <section className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
        <KpiCard
          label={t("pages.executive.mtdRevenue")}
          value={currency(kpis.mtdRevenue)}
          icon={TrendingUp}
          tone="success"
          href="/financial"
          loading={loading}
        />
        <KpiCard
          label={t("pages.executive.mtdExpenses")}
          value={currency(kpis.mtdExpenses)}
          icon={TrendingDown}
          tone="danger"
          href="/financial"
          loading={loading}
        />
        <KpiCard
          label={t("pages.executive.netMargin")}
          value={`${kpis.netMargin.toFixed(1)}%`}
          icon={Wallet}
          tone={kpis.netMargin >= 0 ? "success" : "danger"}
          href="/financial"
          loading={loading}
        />
        <KpiCard
          label={t("pages.executive.headcount")}
          value={kpis.headcount}
          icon={Users}
          tone="info"
          href="/hr"
          loading={loading}
        />
        <KpiCard
          label={t("pages.executive.activeProjects")}
          value={kpis.activeProjects}
          icon={Briefcase}
          tone="info"
          href="/projects"
          loading={loading}
        />
        <KpiCard
          label={t("pages.executive.atRiskProjects")}
          value={kpis.atRiskProjects}
          icon={AlertTriangle}
          tone="warning"
          href="/projects"
          loading={loading}
        />
        <KpiCard
          label={t("pages.executive.pendingLeaves")}
          value={kpis.pendingLeaves}
          icon={ReceiptText}
          tone="warning"
          href="/hr"
          loading={loading}
        />
        <KpiCard
          label={t("pages.executive.expiringDocs")}
          value={kpis.expiringDocs}
          icon={Building2}
          tone={kpis.expiringDocs > 0 ? "warning" : "default"}
          href="/documents"
          loading={loading}
        />
      </section>

      <CashFlowChart />
    </PageShell>
  );
}