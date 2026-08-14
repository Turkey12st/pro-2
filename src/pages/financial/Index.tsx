import { FileText } from "lucide-react";
import { PageShell } from "@/components/shared/PageShell";
import FinancialReports from "@/pages/accounting/components/FinancialReports";

export default function FinancialPage() {
  return (
    <PageShell
      title="التقارير المالية"
      description="أنشئ القوائم المالية ودفتر الأستاذ وصدّر النتائج بصيغ متعددة من بيانات النظام الفعلية."
      icon={FileText}
    >
      <FinancialReports />
    </PageShell>
  );
}
