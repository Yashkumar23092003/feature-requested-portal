import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { prompt } = await req.json();
    if (!prompt) {
      return json({ error: "Missing prompt." }, 400);
    }

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      return json({ error: "LOVABLE_API_KEY is not configured." }, 503);
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 2048,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return json({ error: "Rate limit exceeded. Please try again in a moment." }, 429);
      }
      if (response.status === 402) {
        return json({ error: "AI credits exhausted. Add funds in Settings → Workspace → Usage." }, 402);
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return json({ error: "AI gateway error" }, 500);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content ?? "";

    return json({ text });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    console.error("ai-prioritize error:", msg);
    return json({ error: msg }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
