import { useState, useCallback } from "react";
import { type Feature } from "./useFeatureData";

export interface RefDoc {
  id: string;
  name: string;
  content: string;
  uploadedAt: string;
}

export interface Recommendation {
  feature_key: string;
  normalized_feature_name: string;
  category: string;
  count: number;
  priority: "high" | "medium" | "low";
  reason: string;
}

export type AIProvider = "default" | "anthropic" | "openai" | "gemini";

export const PROVIDERS: {
  id: AIProvider;
  label: string;
  placeholder: string;
  hint: string;
  requiresKey: boolean;
}[] = [
  {
    id: "default",
    label: "Default",
    placeholder: "",
    hint: "Built-in AI — no key needed. Powered by the server.",
    requiresKey: false,
  },
  {
    id: "anthropic",
    label: "Claude",
    placeholder: "sk-ant-...",
    hint: "Anthropic API key — console.anthropic.com",
    requiresKey: true,
  },
  {
    id: "openai",
    label: "OpenAI",
    placeholder: "sk-...",
    hint: "OpenAI API key — platform.openai.com/api-keys",
    requiresKey: true,
  },
  {
    id: "gemini",
    label: "Gemini",
    placeholder: "AIza...",
    hint: "Google AI Studio key — aistudio.google.com/app/apikey",
    requiresKey: true,
  },
];

const DOCS_KEY     = "pm_brain_docs";
const PROVIDER_KEY = "pm_brain_provider";

function storageKeyFor(provider: AIProvider) {
  return `pm_brain_key_${provider}`;
}

function loadDocs(): RefDoc[] {
  try {
    return JSON.parse(localStorage.getItem(DOCS_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveDocs(docs: RefDoc[]) {
  localStorage.setItem(DOCS_KEY, JSON.stringify(docs));
}

export function getProvider(): AIProvider {
  return (localStorage.getItem(PROVIDER_KEY) as AIProvider) || "default";
}

export function saveProvider(p: AIProvider) {
  localStorage.setItem(PROVIDER_KEY, p);
}

export function getApiKey(provider: AIProvider): string {
  return localStorage.getItem(storageKeyFor(provider)) || "";
}

export function saveApiKey(provider: AIProvider, key: string) {
  localStorage.setItem(storageKeyFor(provider), key.trim());
}

// ── Per-provider API calls ───────────────────────────────────────────────────

async function callDefault(prompt: string): Promise<string> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
  const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase is not configured. Add your own API key in Settings to use a different provider.");
  }

  const res = await fetch(`${supabaseUrl}/functions/v1/ai-prioritize`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${supabaseKey}`,
      "apikey": supabaseKey,
    },
    body: JSON.stringify({ prompt }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok || data.error) {
    throw new Error(data.error || `Server error ${res.status}`);
  }

  return data.text ?? "";
}

async function callAnthropic(apiKey: string, prompt: string): Promise<string> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    const msg = err?.error?.message || `API error ${res.status}`;
    if (res.status === 401) throw new Error("Invalid Anthropic API key.");
    throw new Error(msg);
  }
  const data = await res.json();
  return data.content?.[0]?.text ?? "";
}

async function callOpenAI(apiKey: string, prompt: string): Promise<string> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      max_tokens: 2048,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    const msg = err?.error?.message || `API error ${res.status}`;
    if (res.status === 401) throw new Error("Invalid OpenAI API key.");
    throw new Error(msg);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

async function callGemini(apiKey: string, prompt: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
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
    const msg = err?.error?.message || `API error ${res.status}`;
    if (res.status === 400 && msg.toLowerCase().includes("api key")) throw new Error("Invalid Gemini API key.");
    throw new Error(msg);
  }
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}

async function callProvider(provider: AIProvider, apiKey: string, prompt: string): Promise<string> {
  if (provider === "default")   return callDefault(prompt);
  if (provider === "anthropic") return callAnthropic(apiKey, prompt);
  if (provider === "openai")    return callOpenAI(apiKey, prompt);
  return callGemini(apiKey, prompt);
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function usePMBrain() {
  const [documents, setDocuments] = useState<RefDoc[]>(loadDocs);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);

  const addDocument = useCallback((name: string, content: string) => {
    const doc: RefDoc = {
      id: crypto.randomUUID(),
      name: name.trim() || "Untitled",
      content: content.trim(),
      uploadedAt: new Date().toISOString(),
    };
    setDocuments((prev) => {
      const next = [...prev, doc];
      saveDocs(next);
      return next;
    });
  }, []);

  const removeDocument = useCallback((id: string) => {
    setDocuments((prev) => {
      const next = prev.filter((d) => d.id !== id);
      saveDocs(next);
      return next;
    });
  }, []);

  const analyzeWithAI = useCallback(
    async (features: Feature[]) => {
      const provider = getProvider();
      const meta = PROVIDERS.find((p) => p.id === provider)!;
      const apiKey = meta.requiresKey ? getApiKey(provider) : "";

      if (meta.requiresKey && !apiKey) {
        setAnalyzeError(`No API key set for ${meta.label}. Add it in Settings below, or switch to Default.`);
        return;
      }
      if (documents.length === 0) {
        setAnalyzeError("Upload at least one reference document describing your expertise first.");
        return;
      }
      if (features.length === 0) {
        setAnalyzeError("No feature requests loaded yet. Connect your Google Sheet on the Dashboard first.");
        return;
      }

      setAnalyzing(true);
      setAnalyzeError(null);
      setRecommendations([]);

      const expertiseContext = documents
        .map((d) => `### ${d.name}\n${d.content}`)
        .join("\n\n---\n\n");

      const featureList = features
        .slice(0, 100)
        .map(
          (f) =>
            `{ "feature_key": "${f.feature_key}", "name": "${f.normalized_feature_name}", "category": "${f.category}", "count": ${f.count} }`
        )
        .join("\n");

      const prompt = `You are a product prioritization assistant. A PM has shared documents describing their domain expertise and background. Given a list of customer feature requests, identify the top 10 features this PM is best positioned to own and deliver successfully.

## PM Expertise & Background
${expertiseContext}

## Customer Feature Requests (JSON, sorted by request volume)
${featureList}

## Instructions
Return ONLY a valid JSON array (no markdown, no explanation outside JSON) with exactly up to 10 items. Each item must have:
- "feature_key": string — exact value from the input
- "normalized_feature_name": string — exact name from the input
- "category": string — exact category from the input
- "count": number — exact count from the input
- "priority": "high" | "medium" | "low" — based on fit with PM expertise AND customer demand
- "reason": string — 1–2 sentences explaining why this PM is well-suited to own this feature

Order items from highest to lowest priority.`;

      try {
        const text = await callProvider(provider, apiKey, prompt);
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (!jsonMatch) throw new Error("AI returned an unexpected format. Please try again.");
        const parsed: Recommendation[] = JSON.parse(jsonMatch[0]);
        setRecommendations(parsed);
      } catch (e: unknown) {
        setAnalyzeError(e instanceof Error ? e.message : "Failed to get AI recommendations.");
      } finally {
        setAnalyzing(false);
      }
    },
    [documents]
  );

  return {
    documents,
    addDocument,
    removeDocument,
    recommendations,
    analyzing,
    analyzeError,
    analyzeWithAI,
    clearRecommendations: () => setRecommendations([]),
  };
}
