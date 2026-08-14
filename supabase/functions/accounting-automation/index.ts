const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function jsonResponse(body: Record<string, unknown>, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

/**
 * This endpoint previously inserted accounting_transactions and journal rows directly.
 * It is deliberately retired in favour of the audited create_accounting_event RPC.
 */
Deno.serve((request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  return jsonResponse(
    {
      error: "ACCOUNTING_AUTOMATION_RETIRED",
      message: "تم إيقاف مسار الأتمتة القديم. استخدم محرك الأحداث المحاسبية الخادمي لإنشاء قيود متوازنة وقابلة للتدقيق.",
    },
    410
  );
});
