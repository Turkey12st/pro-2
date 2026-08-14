const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type EmailRequest = {
  to: string[];
  subject: string;
  html: string;
  type?: "alert" | "notification" | "report";
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return jsonResponse({ error: "METHOD_NOT_ALLOWED" }, 405);
  }

  let payload: EmailRequest;
  try {
    payload = await request.json();
  } catch {
    return jsonResponse({ error: "INVALID_JSON", message: "هيئة الطلب غير صالحة" }, 400);
  }

  const recipients = Array.isArray(payload.to)
    ? [...new Set(payload.to.map((email) => email.trim()).filter(Boolean))]
    : [];

  if (!recipients.length || recipients.some((email) => !/^\S+@\S+\.\S+$/.test(email))) {
    return jsonResponse({ error: "INVALID_RECIPIENTS", message: "يجب توفير عناوين بريد صحيحة" }, 400);
  }

  if (!payload.subject?.trim() || !payload.html?.trim()) {
    return jsonResponse({ error: "MISSING_CONTENT", message: "الموضوع والمحتوى مطلوبان" }, 400);
  }

  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  const from = Deno.env.get("EMAIL_FROM");

  if (!resendApiKey || !from) {
    return jsonResponse(
      {
        error: "EMAIL_PROVIDER_NOT_CONFIGURED",
        message: "لم يتم إعداد مزود البريد. أضف RESEND_API_KEY وEMAIL_FROM إلى أسرار المشروع.",
      },
      503
    );
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: recipients,
      subject: payload.subject.trim(),
      html: payload.html,
      tags: [{ name: "type", value: payload.type || "notification" }],
    }),
  });

  if (!response.ok) {
    console.error("Email provider rejected request", { status: response.status });
    return jsonResponse({ error: "EMAIL_DELIVERY_FAILED", message: "تعذر تسليم البريد" }, 502);
  }

  const result = await response.json();
  return jsonResponse({ success: true, id: result.id, recipients: recipients.length });
});
