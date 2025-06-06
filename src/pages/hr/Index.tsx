
import React from "react";
import { HRManagementSystem } from "@/components/hr/HRManagementSystem";

export default function HRPage() {
  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      <div className="space-y-1 mb-6">
        <h1 className="text-2xl font-bold">نظام الموارد البشرية</h1>
        <p className="text-muted-foreground">إدارة شاملة للموظفين والرواتب والحضور</p>
      </div>
      
      <HRManagementSystem />
    </div>
  );
}
