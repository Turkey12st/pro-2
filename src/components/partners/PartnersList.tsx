
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { formatNumber } from "@/lib/utils";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

type Partner = {
  name: string;
  partner_type: string;
  ownership_percentage: number;
  share_value: number;
  contact_info: {
    email?: string;
    phone?: string;
  };
  created_at: string;
};

export default function PartnersList() {
  const { data: partners, isLoading } = useQuery({
    queryKey: ["partners"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("company_partners")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Partner[];
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>اسم الشريك</TableHead>
            <TableHead>نوع الشريك</TableHead>
            <TableHead>نسبة الملكية</TableHead>
            <TableHead>قيمة الحصة</TableHead>
            <TableHead>البريد الإلكتروني</TableHead>
            <TableHead>تاريخ الإضافة</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {partners?.map((partner) => (
            <TableRow key={partner.name}>
              <TableCell>{partner.name}</TableCell>
              <TableCell>
                {partner.partner_type === 'individual' ? 'فرد' : 'شركة'}
              </TableCell>
              <TableCell>{partner.ownership_percentage}%</TableCell>
              <TableCell>{formatNumber(partner.share_value)} ريال</TableCell>
              <TableCell>{partner.contact_info?.email || '-'}</TableCell>
              <TableCell>
                {format(new Date(partner.created_at), 'dd MMMM yyyy', { locale: ar })}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
