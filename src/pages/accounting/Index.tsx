
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageShell } from "@/components/shared/PageShell";
import { useTranslation } from "react-i18next";

import JournalEntryTable from "./components/JournalEntryTable";
import JournalEntryDialog from "./components/JournalEntryDialog";

import { ChartOfAccountsManager } from "@/components/accounting/ChartOfAccountsManager";
import { useJournalEntries } from "./hooks/useJournalEntries";
import type { JournalEntry } from "@/types/database";
import FinancialReports from "./components/FinancialReports";

export default function AccountingPage() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [currentTab, setCurrentTab] = useState("journal-entries");
  const { journalEntries, isLoading, error, fetchJournalEntries, handleDeleteEntry } = useJournalEntries();

  const handleEditEntry = (entry: JournalEntry) => {
    setEditingEntry(entry);
    setIsOpen(true);
  };

  const handleAddEntry = () => {
    setEditingEntry(null);
    setIsOpen(true);
  };

  return (
    <PageShell
      title={t("pages.accounting.title")}
      description={t("pages.accounting.description")}
      icon={Receipt}
      actions={
        currentTab === "journal-entries" ? (
          <Button onClick={handleAddEntry} className="h-10 w-full gap-2 rounded-xl sm:w-auto">
            <Plus className="h-4 w-4" /> {t("pages.accounting.addEntry")}
          </Button>
        ) : null
      }
    >
      <Card className="overflow-hidden">
        <CardContent className="p-4 sm:p-6">
          {error && (
            <div className="mb-5 flex flex-col gap-3 rounded-xl border border-destructive/25 bg-destructive/5 p-4 text-sm sm:flex-row sm:items-center sm:justify-between">
              <span>تعذر تحميل بعض القيود اليومية. تحقق من الصلاحيات أو الاتصال ثم أعد المحاولة.</span>
              <Button variant="outline" size="sm" className="w-full border-destructive/25 sm:w-auto" onClick={() => void fetchJournalEntries()}>إعادة المحاولة</Button>
            </div>
          )}
          <Tabs value={currentTab} onValueChange={setCurrentTab} className="min-w-0">
            <div className="mb-5 overflow-x-auto pb-1">
              <TabsList className="h-auto min-w-max rounded-xl">
              <TabsTrigger value="journal-entries" className="px-3 py-2.5 text-xs sm:px-4 sm:text-sm">{t("pages.accounting.tabJournal")}</TabsTrigger>
              <TabsTrigger value="chart-of-accounts" className="px-3 py-2.5 text-xs sm:px-4 sm:text-sm">{t("pages.accounting.tabChart")}</TabsTrigger>
              <TabsTrigger value="reports" className="px-3 py-2.5 text-xs sm:px-4 sm:text-sm">{t("pages.accounting.tabReports")}</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="journal-entries">
              <JournalEntryTable
                entries={journalEntries}
                isLoading={isLoading}
                onEdit={handleEditEntry}
                onDelete={handleDeleteEntry}
              />
              <JournalEntryDialog
                isOpen={isOpen}
                setIsOpen={setIsOpen}
                editingEntry={editingEntry}
                onSuccess={fetchJournalEntries}
              />
            </TabsContent>

            <TabsContent value="chart-of-accounts">
              <ChartOfAccountsManager />
            </TabsContent>

            <TabsContent value="reports">
              <FinancialReports />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </PageShell>
  );
}
