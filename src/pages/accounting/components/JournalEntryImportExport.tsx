
import React from "react";
import { Button } from "@/components/ui/button";
import { Download, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import type { JournalEntry } from "@/types/database";

interface JournalEntryImportExportProps {
  journalEntries: JournalEntry[];
  onImportSuccess: () => void;
}

const JournalEntryImportExport: React.FC<JournalEntryImportExportProps> = ({
  journalEntries,
  onImportSuccess,
}) => {
  const { toast } = useToast();

  const exportData = () => {
    const dataStr = JSON.stringify(journalEntries, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    const link = document.createElement("a");
    link.href = dataUri;
    link.download = `journal-entries-${format(new Date(), "yyyy-MM-dd")}.json`;
    link.click();
    toast({ title: "تم التصدير", description: "تم تصدير البيانات بنجاح" });
  };

  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsText(file, "UTF-8");
    reader.onload = async (event) => {
      try {
        const result = event.target?.result;
        if (typeof result !== "string") return;

        const entries = JSON.parse(result) as JournalEntry[];
        if (!Array.isArray(entries)) throw new Error("صيغة الملف غير صحيحة");

        // ضبط وتنظيف البيانات المستوردة
        const formattedEntries = entries.map(entry => ({
          ...entry,
          entry_name: entry.entry_name || "قيد مستورد",
          entry_date: entry.entry_date || format(new Date(), "yyyy-MM-dd"),
          financial_statement_section: entry.financial_statement_section || "income_statement",
          entry_type: entry.entry_type || (entry.total_credit > 0 ? "income" : "expense"),
          total_debit: entry.total_debit || 0,
          total_credit: entry.total_credit || 0,
        }));

        const { error } = await supabase.from("journal_entries").insert(formattedEntries);
        if (error) throw error;

        toast({ title: "تم الاستيراد", description: `تم استيراد ${entries.length} قيود` });
        onImportSuccess();
      } catch (error) {
        console.error("خطأ في الاستيراد:", error);
        toast({
          variant: "destructive",
          title: "فشل في الاستيراد",
          description: error instanceof Error ? error.message : "حدث خطأ غير معروف",
        });
      }
    };
    e.target.value = "";
  };

  return (
    <div className="flex gap-2">
      <Button onClick={exportData} variant="outline">
        <Download className="mr-2" /> تصدير البيانات
      </Button>
      <Button variant="outline">
        <Upload className="mr-2" />
        <input
          type="file"
          accept=".json"
          className="absolute opacity-0 w-full h-full cursor-pointer"
          onChange={importData}
        />
        استيراد البيانات
      </Button>
    </div>
  );
};

export default JournalEntryImportExport;
