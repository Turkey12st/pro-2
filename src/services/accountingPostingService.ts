import { supabase } from "@/integrations/supabase/client";

export interface AccountingPostingLine {
  account_id: string;
  description?: string;
  debit: number;
  credit: number;
  currency?: string;
  exchange_rate?: number;
  tax_amount?: number;
  tax_code?: string;
  dimension1?: string;
  dimension2?: string;
}

export interface CreateAccountingEventInput {
  companyId: string;
  sourceType: string;
  sourceId: string;
  eventType: string;
  entryDate: string;
  description: string;
  currency: string;
  idempotencyKey: string;
  lines: AccountingPostingLine[];
  autoPost?: boolean;
}

export interface AccountingEventResult {
  event_id: string;
  journal_entry_id: string;
  status: "draft" | "posted";
  reused: boolean;
}

export async function createAccountingEvent(
  input: CreateAccountingEventInput
): Promise<AccountingEventResult> {
  const { data, error } = await supabase.rpc("create_accounting_event", {
    p_company_id: input.companyId,
    p_source_type: input.sourceType,
    p_source_id: input.sourceId,
    p_accounting_event: input.eventType,
    p_entry_date: input.entryDate,
    p_description: input.description,
    p_currency: input.currency,
    p_idempotency_key: input.idempotencyKey,
    p_lines: input.lines,
    p_auto_post: input.autoPost ?? false,
  });

  if (error) {
    throw new Error(error.message || "تعذر إنشاء الحدث المحاسبي");
  }

  if (!data || typeof data !== "object" || !("journal_entry_id" in data)) {
    throw new Error("استجابة محرك القيود غير صالحة");
  }

  return data as AccountingEventResult;
}
