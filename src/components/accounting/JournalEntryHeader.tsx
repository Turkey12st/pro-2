
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { JournalEntry } from "@/types/database";

interface JournalEntryHeaderProps {
  formData: Partial<JournalEntry>;
  onChange: (name: string, value: any) => void;
}

export const JournalEntryHeader: React.FC<JournalEntryHeaderProps> = ({
  formData,
  onChange
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="entry_name">اسم القيد</Label>
        <Input
          id="entry_name"
          name="entry_name"
          value={formData.entry_name}
          onChange={(e) => onChange("entry_name", e.target.value)}
          placeholder="أدخل اسم القيد المحاسبي"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">الوصف</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={(e) => onChange("description", e.target.value)}
          placeholder="أدخل وصف القيد المحاسبي"
          required
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="entry_date">التاريخ</Label>
          <Input
            id="entry_date"
            name="entry_date"
            type="date"
            value={formData.entry_date}
            onChange={(e) => onChange("entry_date", e.target.value)}
            required
            dir="ltr"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="financial_statement_section">القائمة المالية</Label>
          <Select 
            value={formData.financial_statement_section} 
            onValueChange={(value) => onChange("financial_statement_section", value)}
          >
            <SelectTrigger id="financial_statement_section">
              <SelectValue placeholder="اختر القائمة المالية" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="income_statement">قائمة الدخل</SelectItem>
              <SelectItem value="balance_sheet">الميزانية العمومية</SelectItem>
              <SelectItem value="cash_flow">قائمة التدفقات النقدية</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="currency">العملة</Label>
          <Select 
            value={formData.currency} 
            onValueChange={(value) => onChange("currency", value)}
          >
            <SelectTrigger id="currency">
              <SelectValue placeholder="اختر العملة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="SAR">ريال سعودي (SAR)</SelectItem>
              <SelectItem value="USD">دولار أمريكي (USD)</SelectItem>
              <SelectItem value="EUR">يورو (EUR)</SelectItem>
              <SelectItem value="GBP">جنيه إسترليني (GBP)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="exchange_rate">سعر الصرف</Label>
          <Input
            id="exchange_rate"
            name="exchange_rate"
            type="number"
            value={formData.exchange_rate}
            onChange={(e) => onChange("exchange_rate", e.target.value)}
            placeholder="1.0"
            step="0.01"
            min="0.01"
            required
          />
        </div>
      </div>
    </div>
  );
};
