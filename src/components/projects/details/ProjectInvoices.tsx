
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface ProjectInvoicesProps {
  projectId?: string;
}

export default function ProjectInvoices({ projectId }: ProjectInvoicesProps) {
  const { data: invoices } = useQuery({
    queryKey: ["project-invoices", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_invoices")
        .select("*")
        .eq("project_id", projectId)
        .order("issue_date", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "success";
      case "overdue":
        return "destructive";
      case "pending":
        return "warning";
      default:
        return "default";
    }
  };

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>رقم الفاتورة</TableHead>
            <TableHead>تاريخ الإصدار</TableHead>
            <TableHead>تاريخ الاستحقاق</TableHead>
            <TableHead>المبلغ</TableHead>
            <TableHead>الحالة</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices?.map((invoice) => (
            <TableRow key={invoice.id}>
              <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
              <TableCell>
                {format(new Date(invoice.issue_date), "dd MMMM yyyy", { locale: ar })}
              </TableCell>
              <TableCell>
                {invoice.due_date
                  ? format(new Date(invoice.due_date), "dd MMMM yyyy", { locale: ar })
                  : "غير محدد"}
              </TableCell>
              <TableCell dir="ltr" className="text-left">
                {invoice.amount.toLocaleString("en-US")} ريال
              </TableCell>
              <TableCell>
                <Badge variant={getStatusColor(invoice.status)}>{invoice.status}</Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
