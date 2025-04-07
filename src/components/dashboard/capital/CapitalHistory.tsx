
import { format } from "date-fns";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import { formatNumber } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

interface CapitalHistoryItem {
  id?: string;
  transaction_type: string;
  amount: number;
  previous_capital: number;
  new_capital: number;
  notes?: string;
  effective_date?: string;
  approval_date?: string;
  created_at: string;
}

interface CapitalHistoryProps {
  history: CapitalHistoryItem[];
  isLoading: boolean;
}

export function CapitalHistory({ history, isLoading }: CapitalHistoryProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center space-x-4 space-x-reverse">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!history || history.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">لا توجد حركات على رأس المال</p>
      </div>
    );
  }

  return (
    <Table dir="rtl">
      <TableCaption>سجل حركات رأس المال</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>التاريخ</TableHead>
          <TableHead>نوع العملية</TableHead>
          <TableHead>المبلغ</TableHead>
          <TableHead>رأس المال قبل</TableHead>
          <TableHead>رأس المال بعد</TableHead>
          <TableHead>ملاحظات</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {history.map((item, index) => (
          <TableRow key={item.id || index}>
            <TableCell className="font-medium">
              {item.effective_date
                ? format(new Date(item.effective_date), "yyyy/MM/dd")
                : format(new Date(item.created_at), "yyyy/MM/dd")}
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                {item.transaction_type === "increase" ? (
                  <>
                    <ArrowUpIcon className="h-4 w-4 text-green-500" />
                    <span>زيادة</span>
                  </>
                ) : (
                  <>
                    <ArrowDownIcon className="h-4 w-4 text-red-500" />
                    <span>تخفيض</span>
                  </>
                )}
              </div>
            </TableCell>
            <TableCell className={item.transaction_type === "increase" ? "text-green-600" : "text-red-600"}>
              {formatNumber(item.amount)}
            </TableCell>
            <TableCell>{formatNumber(item.previous_capital)}</TableCell>
            <TableCell>{formatNumber(item.new_capital)}</TableCell>
            <TableCell className="max-w-xs truncate">{item.notes || "-"}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
