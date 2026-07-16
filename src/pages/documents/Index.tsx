
import React, { useState } from "react";
import DocumentsList from "@/components/documents/DocumentsList";
import DocumentForm from "@/components/documents/DocumentForm";
import { Button } from "@/components/ui/button";
import { FileText, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { PageShell } from "@/components/shared/PageShell";

export default function DocumentsPage() {
  const [addOpen, setAddOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <PageShell
      title="المستندات والتراخيص"
      description="إدارة المستندات والتراخيص الخاصة بالشركة ومتابعة تواريخ انتهاء الصلاحية"
      icon={FileText}
      actions={
        <Button onClick={() => setAddOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" /> إضافة مستند
        </Button>
      }
    >
      <DocumentsList key={refreshKey} />

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>إضافة مستند جديد</DialogTitle>
            <DialogDescription>
              أدخل بيانات المستند وتاريخ صلاحيته
            </DialogDescription>
          </DialogHeader>
          <DocumentForm
            onSuccess={() => {
              setAddOpen(false);
              setRefreshKey((k) => k + 1);
            }}
          />
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
