import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ rpc: vi.fn() }));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { rpc: mocks.rpc },
}));

import { createAccountingEvent } from "./accountingPostingService";

const validInput = {
  companyId: "11111111-1111-4111-8111-111111111111",
  sourceType: "manual_journal",
  sourceId: "22222222-2222-4222-8222-222222222222",
  eventType: "manual_journal_draft",
  entryDate: "2026-08-14",
  description: "قيد اختبار متوازن",
  currency: "SAR",
  idempotencyKey: "33333333-3333-4333-8333-333333333333",
  lines: [
    {
      account_id: "44444444-4444-4444-8444-444444444444",
      description: "مدين",
      debit: 100,
      credit: 0,
    },
    {
      account_id: "55555555-5555-4555-8555-555555555555",
      description: "دائن",
      debit: 0,
      credit: 100,
    },
  ],
};

describe("createAccountingEvent", () => {
  beforeEach(() => {
    mocks.rpc.mockReset();
  });

  it("يرسل الحدث إلى RPC الذري ولا ينشئ قيوداً مباشرة من العميل", async () => {
    mocks.rpc.mockResolvedValue({
      data: {
        event_id: "66666666-6666-4666-8666-666666666666",
        journal_entry_id: "77777777-7777-4777-8777-777777777777",
        status: "draft",
        reused: false,
      },
      error: null,
    });

    const result = await createAccountingEvent(validInput);

    expect(mocks.rpc).toHaveBeenCalledTimes(1);
    expect(mocks.rpc).toHaveBeenCalledWith("create_accounting_event", {
      p_company_id: validInput.companyId,
      p_source_type: validInput.sourceType,
      p_source_id: validInput.sourceId,
      p_accounting_event: validInput.eventType,
      p_entry_date: validInput.entryDate,
      p_description: validInput.description,
      p_currency: "SAR",
      p_idempotency_key: validInput.idempotencyKey,
      p_lines: validInput.lines,
      p_auto_post: false,
    });
    expect(result.journal_entry_id).toBe("77777777-7777-4777-8777-777777777777");
    expect(result.reused).toBe(false);
  });

  it("يعيد خطأ الأعمال من المحرك الخادمي إلى الواجهة", async () => {
    mocks.rpc.mockResolvedValue({ data: null, error: { message: "القيد غير متوازن" } });

    await expect(createAccountingEvent(validInput)).rejects.toThrow("القيد غير متوازن");
  });

  it("يرفض الاستجابة الناقصة حتى لا تُعامل العملية غير المكتملة كقيد صحيح", async () => {
    mocks.rpc.mockResolvedValue({ data: { event_id: "حدث فقط" }, error: null });

    await expect(createAccountingEvent(validInput)).rejects.toThrow("استجابة محرك القيود غير صالحة");
  });
});
