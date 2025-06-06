import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppLayout } from "@/components/AppLayout";
import JournalEntryTable from "./components/JournalEntryTable";
import JournalEntryDialog from "./components/JournalEntryDialog";
import JournalEntryImportExport from "./components/JournalEntryImportExport";
import { ChartOfAccountsManager } from "@/components/accounting/ChartOfAccountsManager";
import { useJournalEntries } from "./hooks/useJournalEntries";
import type { JournalEntry } from "@/types/database";
import FinancialReports from "./components/FinancialReports";

export default function AccountingPage() {
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
    <AppLayout>
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            النظام المحاسبي
            {currentTab === "journal-entries" && (
              <JournalEntryImportExport 
                journalEntries={journalEntries} 
                onImportSuccess={fetchJournalEntries} 
              />
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={currentTab} onValueChange={setCurrentTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="journal-entries">القيود المحاسبية</TabsTrigger>
              <TabsTrigger value="chart-of-accounts">شجرة الحسابات</TabsTrigger>
              <TabsTrigger value="reports">التقارير المالية</TabsTrigger>
            </TabsList>
            
            <TabsContent value="journal-entries">
              <Button className="mb-4" onClick={handleAddEntry}>
                <Plus className="mr-2" /> إضافة قيد محاسبي
              </Button>
              
              <JournalEntryTable 
                entries={journalEntries} 
                isLoading={isLoading} 
                onEdit={handleEditEntry}
                onDelete={handleDeleteEntry}
              />
              
              {/* Dialog for adding/editing journal entries */}
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
    </AppLayout>
  );
}
