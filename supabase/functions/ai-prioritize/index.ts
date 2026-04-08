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

    const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");
    const openaiKey    = Deno.env.get("OPENAI_API_KEY");
    const geminiKey    = Deno.env.get("GEMINI_API_KEY");

    let text = "";

    if (anthropicKey) {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": anthropicKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 2048,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error?.message || `Anthropic error ${res.status}`);
      }
      const data = await res.json();
      text = data.content?.[0]?.text ?? "";

    } else if (openaiKey) {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o",
          max_tokens: 2048,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error?.message || `OpenAI error ${res.status}`);
      }
      const data = await res.json();
      text = data.choices?.[0]?.message?.content ?? "";

    } else if (geminiKey) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 2048 },
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error?.message || `Gemini error ${res.status}`);
      }
      const data = await res.json();
      text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    } else {
      return json(
        { error: "No AI key configured on the server. Ask the admin to add ANTHROPIC_API_KEY, OPENAI_API_KEY, or GEMINI_API_KEY as a Supabase secret." },
        503
      );
    }

    return json({ text });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return json({ error: msg }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
