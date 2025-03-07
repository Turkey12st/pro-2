
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/AppLayout";
import JournalEntryTable from "./components/JournalEntryTable";
import JournalEntryDialog from "./components/JournalEntryDialog";
import JournalEntryImportExport from "./components/JournalEntryImportExport";
import { useJournalEntries } from "./hooks/useJournalEntries";
import type { JournalEntry } from "@/types/database";

export default function AccountingPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const { journalEntries, isLoading, fetchJournalEntries, handleDeleteEntry } = useJournalEntries();

  const handleEditEntry = (entry: JournalEntry) => {
    setEditingEntry(entry);
    setIsOpen(true);
  };

  const handleAddEntry = () => {
    setEditingEntry(null);
    setIsOpen(true);
  };

  const handleDialogClose = () => {
    setIsOpen(false);
    setEditingEntry(null);
  };

  return (
    <AppLayout>
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            النظام المحاسبي
            <JournalEntryImportExport 
              journalEntries={journalEntries} 
              onImportSuccess={fetchJournalEntries} 
            />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button className="mb-4" onClick={handleAddEntry}>
            <Plus className="mr-2" /> إضافة قيد محاسبي
          </Button>
          
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
        </CardContent>
      </Card>
    </AppLayout>
  );
}
