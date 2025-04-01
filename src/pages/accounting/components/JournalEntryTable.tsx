
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
import { Edit, Trash2, FileText } from "lucide-react";
import type { JournalEntry } from "@/types/database";
import { formatEntryDate, getFinancialSectionName, formatAmount } from "@/utils/journalEntryHelpers";

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
    <div className="overflow-x-auto">
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
                {formatEntryDate(entry.entry_date)}
              </TableCell>
              <TableCell>
                <Badge variant={entry.entry_type === "income" ? "success" : "destructive"}>
                  {entry.entry_type === "income" ? "إيراد" : "مصروف"}
                </Badge>
              </TableCell>
              <TableCell className="font-medium text-left" dir="ltr">
                {formatAmount(entry.amount)} ريال
              </TableCell>
              <TableCell>
                {getFinancialSectionName(entry.financial_statement_section)}
              </TableCell>
              <TableCell>
                <div className="flex space-x-2 space-x-reverse">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(entry)}
                    aria-label="تعديل"
                  >
                    <Edit className="h-4 w-4 text-primary" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label="عرض المرفقات"
                  >
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(entry.id)}
                    aria-label="حذف"
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default JournalEntryTable;
