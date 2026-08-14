
import React from "react";
import { CompanyInfoForm } from "@/components/company/CompanyInfoForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building, FileText, Building2 } from "lucide-react";
import DocumentsList from "@/components/documents/DocumentsList";
import { PageShell } from "@/components/shared/PageShell";
import { useTranslation } from "react-i18next";

export default function CompanyPage() {
  const { t } = useTranslation();
  return (
    <PageShell
      title={t("pages.company.title")}
      description={t("pages.company.description")}
      icon={Building2}
    >
      <Tabs defaultValue="info" className="min-w-0 space-y-5">
        <div className="overflow-x-auto pb-1">
          <TabsList className="grid h-auto min-w-max grid-cols-2 rounded-xl">
          <TabsTrigger value="info" className="gap-2 px-3 py-2.5 text-xs sm:px-4 sm:text-sm">
            <Building className="h-4 w-4" />
            {t("pages.company.tabInfo")}
          </TabsTrigger>
          <TabsTrigger value="documents" className="gap-2 px-3 py-2.5 text-xs sm:px-4 sm:text-sm">
            <FileText className="h-4 w-4" />
            {t("pages.company.tabDocuments")}
          </TabsTrigger>
          </TabsList>
        </div>

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
