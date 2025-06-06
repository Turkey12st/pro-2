
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import DocumentForm from "@/components/documents/DocumentForm";
import DocumentsList from "@/components/documents/DocumentsList";

export default function DocumentsPage() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">إدارة الوثائق</h1>
          <p className="text-muted-foreground">تنظيم وإدارة وثائق الشركة</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          وثيقة جديدة
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>إضافة وثيقة جديدة</CardTitle>
          </CardHeader>
          <CardContent>
            <DocumentForm />
          </CardContent>
        </Card>
      )}

      <DocumentsList />
    </div>
  );
}
