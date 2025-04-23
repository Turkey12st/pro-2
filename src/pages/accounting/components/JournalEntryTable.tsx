
import React, { useState, useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit, Trash2, FileText, Search, Filter } from "lucide-react";
import type { JournalEntry } from "@/types/database";
import { formatEntryDate, getFinancialSectionName, formatAmount } from "@/utils/journalEntryHelpers";
import { supabase } from "@/integrations/supabase/client";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string | null>(null);
  const [filterSection, setFilterSection] = useState<string | null>(null);
  const [filteredEntries, setFilteredEntries] = useState<JournalEntry[]>(entries);
  const [showFilters, setShowFilters] = useState(false);
  const [isApproved, setIsApproved] = useState<string | null>(null);

  useEffect(() => {
    let result = [...entries];
    
    // تطبيق البحث
    if (searchTerm) {
      result = result.filter(entry => 
        entry.entry_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.entry_date.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // تطبيق فلتر النوع
    if (filterType) {
      result = result.filter(entry => entry.entry_type === filterType);
    }
    
    // تطبيق فلتر القسم
    if (filterSection) {
      result = result.filter(entry => entry.financial_statement_section === filterSection);
    }
    
    // تطبيق فلتر الاعتماد
    if (isApproved !== null) {
      result = result.filter(entry => 
        (isApproved === "approved" && entry.is_approved) || 
        (isApproved === "pending" && !entry.is_approved)
      );
    }
    
    setFilteredEntries(result);
  }, [entries, searchTerm, filterType, filterSection, isApproved]);
  
  const handleApproveEntry = async (entryId: string) => {
    try {
      const { error } = await supabase
        .from("journal_entries")
        .update({
          is_approved: true,
          approved_at: new Date().toISOString(),
        })
        .eq("id", entryId);
        
      if (error) throw error;
      
      // تحديث القائمة بدون إعادة التحميل الكامل
      setFilteredEntries(prev => 
        prev.map(entry => 
          entry.id === entryId
            ? { ...entry, is_approved: true, approved_at: new Date().toISOString() }
            : entry
        )
      );
    } catch (error) {
      console.error("خطأ في اعتماد القيد:", error);
    }
  };
  
  const resetFilters = () => {
    setSearchTerm("");
    setFilterType(null);
    setFilterSection(null);
    setIsApproved(null);
    setFilteredEntries(entries);
  };

  if (isLoading) {
    return <div className="flex justify-center py-4">جاري التحميل...</div>;
  }

  if (entries.length === 0) {
    return <div className="text-center py-4">لا توجد قيود محاسبية</div>;
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="بحث في القيود..."
            className="pr-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowFilters(!showFilters)}
          className={showFilters ? "bg-muted" : ""}
        >
          <Filter className="h-4 w-4" />
        </Button>
      </div>
      
      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 border rounded-md bg-muted/50">
          <div>
            <Select value={filterType || ""} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue placeholder="فلتر النوع" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">كل الأنواع</SelectItem>
                <SelectItem value="income">إيراد</SelectItem>
                <SelectItem value="expense">مصروف</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Select value={filterSection || ""} onValueChange={setFilterSection}>
              <SelectTrigger>
                <SelectValue placeholder="القائمة المالية" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">كل القوائم</SelectItem>
                <SelectItem value="income_statement">قائمة الدخل</SelectItem>
                <SelectItem value="balance_sheet">الميزانية العمومية</SelectItem>
                <SelectItem value="cash_flow">قائمة التدفقات النقدية</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Select value={isApproved || ""} onValueChange={setIsApproved}>
              <SelectTrigger>
                <SelectValue placeholder="حالة الاعتماد" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">كل القيود</SelectItem>
                <SelectItem value="approved">معتمدة</SelectItem>
                <SelectItem value="pending">بانتظار الاعتماد</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="md:col-span-3 flex justify-end">
            <Button variant="outline" size="sm" onClick={resetFilters}>
              إعادة تعيين الفلاتر
            </Button>
          </div>
        </div>
      )}
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>اسم القيد</TableHead>
              <TableHead>الوصف</TableHead>
              <TableHead>التاريخ</TableHead>
              <TableHead>النوع</TableHead>
              <TableHead>المدين</TableHead>
              <TableHead>الدائن</TableHead>
              <TableHead>العملة</TableHead>
              <TableHead>القائمة المالية</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead>الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEntries.map((entry) => (
              <TableRow key={entry.id} className={entry.is_approved ? "bg-muted/20" : ""}>
                <TableCell>{entry.entry_name || "-"}</TableCell>
                <TableCell className="max-w-[200px] truncate" title={entry.description}>
                  {entry.description}
                </TableCell>
                <TableCell>
                  {formatEntryDate(entry.entry_date)}
                </TableCell>
                <TableCell>
                  <Badge variant={entry.entry_type === "income" ? "success" : "destructive"}>
                    {entry.entry_type === "income" ? "إيراد" : "مصروف"}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium text-left" dir="ltr">
                  {formatAmount(entry.total_debit)}
                </TableCell>
                <TableCell className="font-medium text-left" dir="ltr">
                  {formatAmount(entry.total_credit)}
                </TableCell>
                <TableCell>{entry.currency || "SAR"}</TableCell>
                <TableCell>
                  {getFinancialSectionName(entry.financial_statement_section)}
                </TableCell>
                <TableCell>
                  {entry.is_approved ? (
                    <Badge variant="success">معتمد</Badge>
                  ) : (
                    <Badge variant="outline">بانتظار الاعتماد</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-1 space-x-reverse">
                    {!entry.is_approved && (
                      <>
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
                          onClick={() => handleApproveEntry(entry.id)}
                          aria-label="اعتماد"
                        >
                          <FileText className="h-4 w-4 text-green-600" />
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
                      </>
                    )}
                    {entry.is_approved && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(entry)}
                        aria-label="عرض"
                      >
                        <FileText className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {filteredEntries.length === 0 && (
        <div className="text-center py-4 text-muted-foreground">
          لا توجد نتائج تطابق معايير البحث
        </div>
      )}
    </div>
  );
};

export default JournalEntryTable;
