const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supportedSystems = ["mol", "moci", "gosi", "qiwa", "zakat"] as const;
const supportedActions = ["sync", "validate", "submit"] as const;

type GovernmentSystem = (typeof supportedSystems)[number];
type GovernmentAction = (typeof supportedActions)[number];

type IntegrationRequest = {
  system: GovernmentSystem;
  action: GovernmentAction;
  data?: unknown;
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

  let payload: IntegrationRequest;
  try {
    payload = await request.json();
  } catch {
    return jsonResponse({ error: "INVALID_JSON", message: "هيئة الطلب غير صالحة" }, 400);
  }

  if (!supportedSystems.includes(payload.system) || !supportedActions.includes(payload.action)) {
    return jsonResponse({ error: "UNSUPPORTED_OPERATION", message: "النظام أو العملية غير مدعومين" }, 400);
  }

  const prefix = `GOVERNMENT_${payload.system.toUpperCase()}`;
  const endpoint = Deno.env.get(`${prefix}_API_URL`);
  const apiKey = Deno.env.get(`${prefix}_API_KEY`);

  if (!endpoint || !apiKey) {
    return jsonResponse(
      {
        error: "GOVERNMENT_PROVIDER_NOT_CONFIGURED",
        message: `لم يتم إعداد تكامل ${payload.system}. أضف ${prefix}_API_URL و${prefix}_API_KEY إلى أسرار المشروع.`,
      },
      503
    );
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "X-Integration-System": payload.system,
      "X-Integration-Action": payload.action,
    },
    body: JSON.stringify({ action: payload.action, data: payload.data ?? {} }),
  });

  const responseText = await response.text();
  let responseData: unknown = responseText;
  try {
    responseData = responseText ? JSON.parse(responseText) : null;
  } catch {
    // Keep non-JSON provider responses as opaque text without exposing secrets.
  }

  if (!response.ok) {
    console.error("Government provider rejected request", {
      system: payload.system,
      action: payload.action,
      status: response.status,
    });
    return jsonResponse(
      { error: "GOVERNMENT_PROVIDER_ERROR", message: "رفضت الجهة الحكومية الطلب", status: response.status },
      502
    );
  }

  return jsonResponse({ success: true, system: payload.system, action: payload.action, data: responseData });
});
