import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Landmark, FileUp, ArrowLeftRight, WalletCards } from "lucide-react";
import BankAccountsManager from "./components/BankAccountsManager";
import BankStatementImport from "./components/BankStatementImport";
import TransactionReconciliation from "./components/TransactionReconciliation";
import { PageShell } from "@/components/shared/PageShell";

export default function BankReconciliationPage() {
  const [activeTab, setActiveTab] = useState("import");

  return (
    <PageShell
      title="التسوية البنكية"
      description="استورد كشوف الحساب وراجع المطابقات لضمان اتساق البنك مع دفتر الأستاذ."
      icon={Landmark}
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="min-w-0">
        <div className="overflow-x-auto pb-1">
          <TabsList className="h-auto min-w-max gap-1 rounded-xl bg-muted/70 p-1">
            <TabsTrigger value="import" className="gap-2 rounded-lg px-3 py-2.5 text-xs sm:px-4 sm:text-sm">
              <FileUp className="h-4 w-4" /> استيراد كشف الحساب
            </TabsTrigger>
            <TabsTrigger value="reconciliation" className="gap-2 rounded-lg px-3 py-2.5 text-xs sm:px-4 sm:text-sm">
              <ArrowLeftRight className="h-4 w-4" /> مطابقة المعاملات
            </TabsTrigger>
            <TabsTrigger value="accounts" className="gap-2 rounded-lg px-3 py-2.5 text-xs sm:px-4 sm:text-sm">
              <WalletCards className="h-4 w-4" /> الحسابات البنكية
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="import" className="mt-4 min-w-0">
          <BankStatementImport />
        </TabsContent>
        <TabsContent value="reconciliation" className="mt-4 min-w-0">
          <TransactionReconciliation />
        </TabsContent>
        <TabsContent value="accounts" className="mt-4 min-w-0">
          <BankAccountsManager />
        </TabsContent>
      </Tabs>
    </PageShell>
  );
}
