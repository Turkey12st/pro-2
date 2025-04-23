
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChartOfAccount } from "@/types/database";
import { Trash } from "lucide-react";

interface EntryLine {
  id?: string;
  account_id: string;
  account_number?: string;
  description?: string;
  debit: number;
  credit: number;
}

interface JournalEntryLineItemProps {
  line: EntryLine;
  index: number;
  accounts: ChartOfAccount[];
  onLineChange: (index: number, field: keyof EntryLine, value: string | number) => void;
  onRemoveLine: (index: number) => void;
  canDelete: boolean;
}

export const JournalEntryLineItem: React.FC<JournalEntryLineItemProps> = ({
  line,
  index,
  accounts,
  onLineChange,
  onRemoveLine,
  canDelete
}) => {
  return (
    <div className="grid grid-cols-12 gap-2 p-2 border-t">
      <div className="col-span-5">
        <Select 
          value={line.account_id} 
          onValueChange={(value) => onLineChange(index, 'account_id', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="اختر الحساب" />
          </SelectTrigger>
          <SelectContent>
            {accounts.map((account) => (
              <SelectItem key={account.id} value={account.id}>
                {account.account_number} - {account.account_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="col-span-2">
        <Input
          value={line.description || ''}
          onChange={(e) => onLineChange(index, 'description', e.target.value)}
          placeholder="البيان"
        />
      </div>
      <div className="col-span-2">
        <Input
          type="number"
          value={line.debit || ''}
          onChange={(e) => onLineChange(index, 'debit', e.target.value)}
          placeholder="0.00"
          min="0"
          step="0.01"
        />
      </div>
      <div className="col-span-2">
        <Input
          type="number"
          value={line.credit || ''}
          onChange={(e) => onLineChange(index, 'credit', e.target.value)}
          placeholder="0.00"
          min="0"
          step="0.01"
        />
      </div>
      <div className="col-span-1 flex justify-center items-center">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => onRemoveLine(index)}
          disabled={!canDelete}
        >
          <Trash className="h-4 w-4 text-destructive" />
        </Button>
      </div>
    </div>
  );
};
