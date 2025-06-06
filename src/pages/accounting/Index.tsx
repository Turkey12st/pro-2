
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartOfAccountsManager } from "@/components/accounting/ChartOfAccountsManager";
import JournalEntryForm from "@/components/accounting/JournalEntryForm";
import JournalEntryTable from "./components/JournalEntryTable";
import { useJournalEntries } from "./hooks/useJournalEntries";
import FinancialReports from "./components/FinancialReports";
import JournalEntryImportExport from "./components/JournalEntryImportExport";

export default function AccountingPage() {
  const [activeTab, setActiveTab] = useState("journal");
  const { journalEntries, isLoading, fetchJournalEntries } = useJournalEntries();

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">نظام المحاسبة</h1>
        <p className="text-muted-foreground">إدارة الحسابات والقيود اليومية والتقارير المالية</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="journal">القيود اليومية</TabsTrigger>
          <TabsTrigger value="chart">دليل الحسابات</TabsTrigger>
          <TabsTrigger value="reports">التقارير المالية</TabsTrigger>
          <TabsTrigger value="import-export">استيراد/تصدير</TabsTrigger>
          <TabsTrigger value="settings">الإعدادات</TabsTrigger>
        </TabsList>

        <TabsContent value="journal" className="space-y-4">
          <JournalEntryForm onSuccess={fetchJournalEntries} />
          <JournalEntryTable 
            entries={journalEntries} 
            isLoading={isLoading}
            onUpdate={fetchJournalEntries}
          />
        </TabsContent>

        <TabsContent value="chart">
          <ChartOfAccountsManager />
        </TabsContent>

        <TabsContent value="reports">
          <FinancialReports />
        </TabsContent>

        <TabsContent value="import-export">
          <JournalEntryImportExport onImportSuccess={fetchJournalEntries} />
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>إعدادات المحاسبة</CardTitle>
            </CardHeader>
            <CardContent>
              <p>إعدادات النظام المحاسبي ستكون متاحة قريباً</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
