
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import type { JournalEntry } from "@/types/database";

interface JournalEntryTableProps {
  entries: JournalEntry[];
  isLoading: boolean;
  onEdit: (entry: JournalEntry) => void;
  onDelete: (id: string) => void;
}

const JournalEntryTable: React.FC<JournalEntryTableProps> = ({
  entries,
  isLoading,
  onEdit,
  onDelete,
}) => {
  if (isLoading) {
    return <div className="flex justify-center py-4">جاري التحميل...</div>;
  }

  if (entries.length === 0) {
    return <div className="text-center py-4">لا توجد قيود محاسبية</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>اسم القيد</TableHead>
          <TableHead>الوصف</TableHead>
          <TableHead>التاريخ</TableHead>
          <TableHead>النوع</TableHead>
          <TableHead>المبلغ</TableHead>
          <TableHead>القائمة المالية</TableHead>
          <TableHead>الإجراءات</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {entries.map((entry) => (
          <TableRow key={entry.id}>
            <TableCell>{entry.entry_name || "-"}</TableCell>
            <TableCell>{entry.description}</TableCell>
            <TableCell>
              {entry.entry_date ? format(new Date(entry.entry_date), "dd MMM yyyy", { locale: ar }) : "-"}
            </TableCell>
            <TableCell>
              <Badge variant={entry.entry_type === "income" ? "success" : "destructive"}>
                {entry.entry_type === "income" ? "إيراد" : "مصروف"}
              </Badge>
            </TableCell>
            <TableCell>
              {entry.amount?.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })} ريال
            </TableCell>
            <TableCell>
              {entry.financial_statement_section === "income_statement" && "قائمة الدخل"}
              {entry.financial_statement_section === "balance_sheet" && "الميزانية العمومية"}
              {entry.financial_statement_section === "cash_flow" && "التدفقات النقدية"}
            </TableCell>
            <TableCell>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(entry)}
                aria-label="تعديل"
              >
                <Edit className="text-primary" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(entry.id)}
                aria-label="حذف"
                className="text-destructive"
              >
                <Trash2 />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default JournalEntryTable;
