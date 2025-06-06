
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ClientForm from "@/components/clients/ClientForm";
import ClientList from "@/components/clients/ClientList";

export default function ClientsPage() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">إدارة العملاء</h1>
          <p className="text-muted-foreground">متابعة وإدارة قاعدة بيانات العملاء</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          عميل جديد
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>إضافة عميل جديد</CardTitle>
          </CardHeader>
          <CardContent>
            <ClientForm onCancel={() => setShowForm(false)} />
          </CardContent>
        </Card>
      )}

      <ClientList />
    </div>
  );
}
