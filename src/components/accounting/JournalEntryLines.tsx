
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ChartOfAccount } from "@/types/database";
import { JournalEntryLineItem } from "./JournalEntryLineItem";

interface EntryLine {
  id?: string;
  account_id: string;
  account_number?: string;
  description?: string;
  debit: number;
  credit: number;
}

interface JournalEntryLinesProps {
  entryLines: EntryLine[];
  accounts: ChartOfAccount[];
  isBalanced: boolean;
  totalDebit: number;
  totalCredit: number;
  onLineChange: (index: number, field: keyof EntryLine, value: string | number) => void;
  onAddLine: () => void;
  onRemoveLine: (index: number) => void;
}

export const JournalEntryLines: React.FC<JournalEntryLinesProps> = ({
  entryLines,
  accounts,
  isBalanced,
  totalDebit,
  totalCredit,
  onLineChange,
  onAddLine,
  onRemoveLine,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-medium">بنود القيد المحاسبي</h3>
        <div className="flex items-center space-x-2 space-x-reverse">
          <span className={`text-sm ${isBalanced ? 'text-green-600' : 'text-red-600'}`}>
            {isBalanced ? 'القيد متوازن' : 'القيد غير متوازن'}
          </span>
          <Button type="button" variant="outline" size="sm" onClick={onAddLine}>
            <Plus className="h-4 w-4 ml-1" /> إضافة بند
          </Button>
        </div>
      </div>
      
      <div className="border rounded-md">
        <div className="grid grid-cols-12 gap-2 p-2 font-medium bg-muted">
          <div className="col-span-5">الحساب</div>
          <div className="col-span-2">البيان</div>
          <div className="col-span-2">مدين</div>
          <div className="col-span-2">دائن</div>
          <div className="col-span-1"></div>
        </div>
        
        {entryLines.map((line, index) => (
          <JournalEntryLineItem
            key={index}
            line={line}
            index={index}
            accounts={accounts}
            onLineChange={onLineChange}
            onRemoveLine={onRemoveLine}
            canDelete={entryLines.length > 2}
          />
        ))}
        
        <div className="grid grid-cols-12 gap-2 p-2 border-t bg-muted font-medium">
          <div className="col-span-5 text-left">الإجمالي</div>
          <div className="col-span-2"></div>
          <div className="col-span-2">{totalDebit.toFixed(2)}</div>
          <div className="col-span-2">{totalCredit.toFixed(2)}</div>
          <div className="col-span-1"></div>
        </div>
        
        {!isBalanced && (
          <div className="grid grid-cols-12 gap-2 p-2 border-t text-red-600">
            <div className="col-span-5 text-left">الفرق</div>
            <div className="col-span-2"></div>
            <div className="col-span-4">
              {Math.abs(totalDebit - totalCredit).toFixed(2)}
            </div>
            <div className="col-span-1"></div>
          </div>
        )}
      </div>
    </div>
  );
};
