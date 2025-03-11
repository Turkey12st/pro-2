
import React from "react";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CompanyInfoForm } from "@/components/company/CompanyInfoForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building, FileText, Settings } from "lucide-react";
import DocumentsList from "@/components/documents/DocumentsList";

export default function CompanyPage() {
  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">بيانات الشركة</h1>
          <p className="text-muted-foreground">إدارة معلومات وبيانات الشركة الأساسية</p>
        </div>

        <Tabs defaultValue="info" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="info">
              <Building className="h-4 w-4 mr-2" />
              معلومات الشركة
            </TabsTrigger>
            <TabsTrigger value="documents">
              <FileText className="h-4 w-4 mr-2" />
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
      </div>
    </AppLayout>
  );
}
