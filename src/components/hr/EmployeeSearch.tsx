
import React from "react";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmployeeSearchProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const EmployeeSearch: React.FC<EmployeeSearchProps> = ({ searchTerm, setSearchTerm }) => {
  return (
    <div className="relative w-full sm:w-auto">
      <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input 
        placeholder="بحث عن موظف بالاسم، البريد، رقم الهوية..." 
        className="pl-8 pr-9 w-full"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      {searchTerm && (
        <Button
          type="button"
          variant="ghost"
          className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 p-0"
          onClick={() => setSearchTerm("")}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">مسح البحث</span>
        </Button>
      )}
    </div>
  );
};

export default EmployeeSearch;
