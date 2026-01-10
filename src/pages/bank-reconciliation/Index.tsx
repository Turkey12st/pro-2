import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2 } from "lucide-react";
import BankAccountsManager from "./components/BankAccountsManager";
import BankStatementImport from "./components/BankStatementImport";
import TransactionReconciliation from "./components/TransactionReconciliation";

export default function BankReconciliationPage() {
  const [activeTab, setActiveTab] = useState("import");

  return (
    <AppLayout>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            التسوية البنكية
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4 grid w-full grid-cols-3">
              <TabsTrigger value="import">استيراد كشف الحساب</TabsTrigger>
              <TabsTrigger value="reconciliation">مطابقة المعاملات</TabsTrigger>
              <TabsTrigger value="accounts">الحسابات البنكية</TabsTrigger>
            </TabsList>

            <TabsContent value="import">
              <BankStatementImport />
            </TabsContent>

            <TabsContent value="reconciliation">
              <TransactionReconciliation />
            </TabsContent>

            <TabsContent value="accounts">
              <BankAccountsManager />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
