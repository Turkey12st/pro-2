
import React from "react";
import { CompanyInfoForm } from "@/components/company/CompanyInfoForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building, FileText, Building2 } from "lucide-react";
import DocumentsList from "@/components/documents/DocumentsList";
import { PageShell } from "@/components/shared/PageShell";

export default function CompanyPage() {
  return (
    <PageShell
      title="بيانات الشركة"
      description="إدارة معلومات وبيانات الشركة الأساسية والتراخيص"
      icon={Building2}
    >
      <Tabs defaultValue="info" className="space-y-6">
        <TabsList className="grid w-full sm:w-auto grid-cols-2">
          <TabsTrigger value="info" className="gap-2">
            <Building className="h-4 w-4" />
            معلومات الشركة
          </TabsTrigger>
          <TabsTrigger value="documents" className="gap-2">
            <FileText className="h-4 w-4" />
            المستندات والتراخيص
          </TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <CompanyInfoForm />
        </TabsContent>

        <TabsContent value="documents">
          <DocumentsList />
        </TabsContent>
      </Tabs>
    </PageShell>
  );
}
