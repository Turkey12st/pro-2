
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useEmployees } from "@/hooks/useEmployees";
import EmployeeTable from "./EmployeeTable";
import EmployeeSearch from "./EmployeeSearch";
import EmployeeExport from "./EmployeeExport";
import EmployeeImport from "./EmployeeImport";

const EmployeeList = () => {
  const { 
    employees, 
    filteredEmployees, 
    isLoading, 
    searchTerm, 
    setSearchTerm 
  } = useEmployees();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="mb-4 flex justify-between items-center">
            <Skeleton className="h-10 w-[200px]" />
            <Skeleton className="h-10 w-[100px]" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="mb-6 flex flex-col sm:flex-row justify-between gap-4">
          <EmployeeSearch searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          <div className="flex flex-wrap gap-2">
            <EmployeeImport />
            <EmployeeExport 
              employees={employees} 
              filteredEmployees={filteredEmployees} 
            />
          </div>
        </div>

        {filteredEmployees.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">لا توجد بيانات للعرض</p>
          </div>
        ) : (
          <EmployeeTable employees={filteredEmployees} />
        )}
      </CardContent>
    </Card>
  );
};

export default EmployeeList;
