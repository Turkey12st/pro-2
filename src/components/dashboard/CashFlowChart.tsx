import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/contexts/LanguageContext";

interface MonthlyBucket {
  key: string;
  label: string;
  revenue: number;
  expenses: number;
  net: number;
}

function last12Months(locale: string): MonthlyBucket[] {
  const out: MonthlyBucket[] = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    out.push({
      key,
      label: d.toLocaleDateString(locale, { month: "short", year: "2-digit" }),
      revenue: 0,
      expenses: 0,
      net: 0,
    });
  }
  return out;
}

export function CashFlowChart() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [data, setData] = useState<MonthlyBucket[]>(() =>
    last12Months(language === "ar" ? "ar-SA" : "en-US")
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const locale = language === "ar" ? "ar-SA" : "en-US";
    const buckets = last12Months(locale);
    const bucketMap = new Map(buckets.map((b) => [b.key, b]));

    const load = async () => {
      setLoading(true);
      try {
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 11);
        startDate.setDate(1);

        const { data: entries } = await (supabase as any)
          .from("journal_entries")
          .select("entry_date, total_debit, total_credit, entry_type")
          .gte("entry_date", startDate.toISOString().slice(0, 10))
          .limit(5000);

        (entries || []).forEach((e: any) => {
          const d = new Date(e.entry_date);
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
          const b = bucketMap.get(key);
          if (!b) return;
          const debit = Number(e.total_debit) || 0;
          const credit = Number(e.total_credit) || 0;
          // Revenue = credits, Expenses = debits (simplified visual proxy)
          b.revenue += credit;
          b.expenses += debit;
          b.net = b.revenue - b.expenses;
        });

        setData(Array.from(bucketMap.values()));
      } catch {
        setData(buckets);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [language]);

  const currency = useMemo(
    () => new Intl.NumberFormat(language === "ar" ? "ar-SA" : "en-US", { maximumFractionDigits: 0 }),
    [language]
  );

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="flex items-center gap-2 text-xl">
            <TrendingUp className="h-5 w-5 text-primary" />
            {t("pages.dashboard.cashFlowTitle")}
          </CardTitle>
          <CardDescription className="mt-1">
            {t("pages.dashboard.cashFlowDesc")}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/60" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis
                tick={{ fontSize: 12 }}
                stroke="hsl(var(--muted-foreground))"
                tickFormatter={(v) => currency.format(v)}
              />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 12,
                  color: "hsl(var(--popover-foreground))",
                }}
                formatter={(value: number) => currency.format(value)}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area
                type="monotone"
                dataKey="revenue"
                name={t("pages.dashboard.revenue") as string}
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#revGradient)"
              />
              <Area
                type="monotone"
                dataKey="expenses"
                name={t("pages.dashboard.expenses") as string}
                stroke="hsl(var(--destructive))"
                strokeWidth={2}
                fill="url(#expGradient)"
              />
              <Area
                type="monotone"
                dataKey="net"
                name={t("pages.dashboard.netCashFlow") as string}
                stroke="hsl(var(--info))"
                strokeWidth={2}
                fill="transparent"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        {loading && (
          <p className="text-center text-xs text-muted-foreground mt-2">{t("app.loading")}</p>
        )}
      </CardContent>
    </Card>
  );
}

export default CashFlowChart;