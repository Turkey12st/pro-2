
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
  const { journalEntries, isLoading, fetchJournalEntries, handleDeleteEntry } = useJournalEntries();

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
          <Button onClick={handleAddEntry} className="gap-2">
            <Plus className="h-4 w-4" /> {t("pages.accounting.addEntry")}
          </Button>
        ) : null
      }
    >
      <Card>
        <CardContent className="p-4 sm:p-6">
          <Tabs value={currentTab} onValueChange={setCurrentTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="journal-entries">{t("pages.accounting.tabJournal")}</TabsTrigger>
              <TabsTrigger value="chart-of-accounts">{t("pages.accounting.tabChart")}</TabsTrigger>
              <TabsTrigger value="reports">{t("pages.accounting.tabReports")}</TabsTrigger>
            </TabsList>

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
