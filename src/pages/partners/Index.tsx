
import React from "react";
import { PartnersList } from "@/components/partners/PartnersList";

export default function PartnersPage() {
  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">إدارة الشركاء</h1>
        <p className="text-muted-foreground">متابعة وإدارة شركاء الأعمال</p>
      </div>

      <PartnersList />
    </div>
  );
}
