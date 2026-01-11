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
import { useToast } from "@/hooks/use-toast"; // تم إضافة هذا الاستيراد

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
  const { toast } = useToast(); // تهيئة useToast

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
        
      if (error) {
        throw new Error(error.message);
      }
      
      // تحديث القائمة بدون إعادة التحميل الكامل
      setFilteredEntries(prev => 
        prev.map(entry => 
          entry.id === entryId
            ? { ...entry, is_approved: true, approved_at: new Date().toISOString() }
            : entry
        )
      );
      toast({
        title: "تم اعتماد القيد",
        description: "تم اعتماد القيد المحاسبي بنجاح.",
      });
    } catch (error) {
      console.error("خطأ في اعتماد القيد:", error);
      toast({
        variant: "destructive",
        title: "فشل في الاعتماد",
        description: "حدث خطأ أثناء محاولة اعتماد القيد.",
      });
    }
  };
  
  const resetFilters = () => {
    setSearchTerm("");
    setFilterType(null);
    setFilterSection(null);
    setIsApproved(null);
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
      
      {/* Mobile Card View */}
      <div className="block md:hidden space-y-3">
        {filteredEntries.length > 0 ? (
          filteredEntries.map((entry) => (
            <div 
              key={entry.id} 
              className={`p-4 rounded-lg border bg-card shadow-sm ${entry.is_approved ? 'border-success/30 bg-success/5' : 'border-border'}`}
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-foreground truncate">{entry.entry_name || "قيد بدون اسم"}</h4>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{entry.description}</p>
                </div>
                <Badge variant={entry.entry_type === "income" ? "default" : "destructive"} className="shrink-0 text-xs">
                  {entry.entry_type === "income" ? "إيراد" : "مصروف"}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                <div className="flex justify-between p-2 bg-muted/50 rounded">
                  <span className="text-muted-foreground">المدين</span>
                  <span className="font-medium text-success" dir="ltr">{formatAmount(entry.total_debit)}</span>
                </div>
                <div className="flex justify-between p-2 bg-muted/50 rounded">
                  <span className="text-muted-foreground">الدائن</span>
                  <span className="font-medium text-destructive" dir="ltr">{formatAmount(entry.total_credit)}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                <span>{formatEntryDate(entry.entry_date)}</span>
                <span>{entry.currency || "SAR"}</span>
                {entry.is_approved ? (
                  <Badge variant="default" className="text-xs">معتمد</Badge>
                ) : (
                  <Badge variant="outline" className="text-xs">بانتظار</Badge>
                )}
              </div>
              
              <div className="flex gap-1 pt-2 border-t">
                {!entry.is_approved && (
                  <>
                    <Button variant="outline" size="sm" className="flex-1 h-8 text-xs" onClick={() => onEdit(entry)}>
                      <Edit className="h-3 w-3 ml-1" />
                      تعديل
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 h-8 text-xs text-success" onClick={() => handleApproveEntry(entry.id)}>
                      <FileText className="h-3 w-3 ml-1" />
                      اعتماد
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 text-xs text-destructive" onClick={() => onDelete(entry.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </>
                )}
                {entry.is_approved && (
                  <Button variant="ghost" size="sm" className="flex-1 h-8 text-xs" onClick={() => onEdit(entry)}>
                    <FileText className="h-3 w-3 ml-1" />
                    عرض التفاصيل
                  </Button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            لا توجد نتائج تطابق معايير البحث
          </div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs lg:text-sm">اسم القيد</TableHead>
              <TableHead className="text-xs lg:text-sm">الوصف</TableHead>
              <TableHead className="text-xs lg:text-sm">التاريخ</TableHead>
              <TableHead className="text-xs lg:text-sm">النوع</TableHead>
              <TableHead className="text-xs lg:text-sm">المدين</TableHead>
              <TableHead className="text-xs lg:text-sm">الدائن</TableHead>
              <TableHead className="text-xs lg:text-sm hidden xl:table-cell">العملة</TableHead>
              <TableHead className="text-xs lg:text-sm hidden lg:table-cell">القائمة المالية</TableHead>
              <TableHead className="text-xs lg:text-sm">الحالة</TableHead>
              <TableHead className="text-xs lg:text-sm">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEntries.length > 0 ? (
              filteredEntries.map((entry) => (
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
                  <TableCell className="hidden xl:table-cell">{entry.currency || "SAR"}</TableCell>
                  <TableCell className="hidden lg:table-cell">
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
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={10} className="h-24 text-center text-muted-foreground">
                  لا توجد نتائج تطابق معايير البحث
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {filteredEntries.length === 0 && (
        <div className="text-center py-4 text-muted-foreground md:hidden">
          لا توجد نتائج تطابق معايير البحث
        </div>
      )}
    </div>
  );
};

export default JournalEntryTable;
