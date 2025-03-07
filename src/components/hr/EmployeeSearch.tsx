
import React from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface EmployeeSearchProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const EmployeeSearch: React.FC<EmployeeSearchProps> = ({ searchTerm, setSearchTerm }) => {
  return (
    <div className="relative w-full sm:w-auto">
      <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input 
        placeholder="بحث عن موظف..." 
        className="pl-3 pr-9 w-full"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>
  );
};

export default EmployeeSearch;
