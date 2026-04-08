import { useState, useEffect, useCallback, useMemo } from "react";

export interface Feature {
  feature_name: string;
  normalized_feature_name: string;
  feature_key: string;
  category: string;
  count: number;
}

export interface CategorySummary {
  name: string;
  totalCount: number;
  featureCount: number;
  share: number;
}

const CATEGORY_COLORS = [
  { bg: "hsl(var(--cat-1))", bar: "hsl(var(--cat-1-bar))" },
  { bg: "hsl(var(--cat-2))", bar: "hsl(var(--cat-2-bar))" },
  { bg: "hsl(var(--cat-3))", bar: "hsl(var(--cat-3-bar))" },
  { bg: "hsl(var(--cat-4))", bar: "hsl(var(--cat-4-bar))" },
  { bg: "hsl(var(--cat-5))", bar: "hsl(var(--cat-5-bar))" },
  { bg: "hsl(var(--cat-6))", bar: "hsl(var(--cat-6-bar))" },
  { bg: "hsl(var(--cat-7))", bar: "hsl(var(--cat-7-bar))" },
  { bg: "hsl(var(--cat-8))", bar: "hsl(var(--cat-8-bar))" },
];

export function getCategoryColorMap(categories: string[]): Record<string, { bg: string; bar: string }> {
  const map: Record<string, { bg: string; bar: string }> = {};
  const sorted = [...categories].sort();
  sorted.forEach((cat, i) => {
    map[cat] = CATEGORY_COLORS[i % CATEGORY_COLORS.length];
  });
  return map;
}

export function getStoredCredentials() {
  return {
    spreadsheetId: localStorage.getItem("gsheet_spreadsheet_id") || "",
    apiKey: localStorage.getItem("gsheet_api_key") || "",
  };
}

export function saveCredentials(spreadsheetId: string, apiKey: string) {
  localStorage.setItem("gsheet_spreadsheet_id", spreadsheetId.trim());
  localStorage.setItem("gsheet_api_key", apiKey.trim());
}

export function hasCredentials(): boolean {
  const { spreadsheetId, apiKey } = getStoredCredentials();
  return !!(spreadsheetId && apiKey);
}

export function useFeatureData() {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const [needsCredentials, setNeedsCredentials] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    setNeedsCredentials(false);

    const stored = getStoredCredentials();
    const spreadsheetId = stored.spreadsheetId || import.meta.env.VITE_SPREADSHEET_ID;
    const apiKey = stored.apiKey || import.meta.env.VITE_GOOGLE_API_KEY;

    if (!spreadsheetId || !apiKey) {
      setNeedsCredentials(true);
      setLoading(false);
      return;
    }

    try {
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Feature%20memory?key=${apiKey}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`API error ${res.status}`);
      const data = await res.json();

      const rows: string[][] = data.values || [];
      if (rows.length <= 1) {
        setFeatures([]);
        setLastSynced(new Date());
        setLoading(false);
        return;
      }

      const headers = rows[0].map((h: string) => h.trim().toLowerCase().replace(/\s+/g, "_"));
      const parsed: Feature[] = rows.slice(1).map((row) => {
        const obj: Record<string, string> = {};
        headers.forEach((h: string, i: number) => { obj[h] = row[i] || ""; });
        return {
          feature_name: obj.feature_name || "",
          normalized_feature_name: obj.normalized_feature_name || "",
          feature_key: obj.feature_key || "",
          category: obj.category || "Uncategorized",
          count: parseInt(obj.count, 10) || 0,
        };
      });

      setFeatures(parsed);
      setLastSynced(new Date());
    } catch (e: unknown) {
      setError("Could not load data. Check your Sheet ID and API key.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const totalFeatures = features.length;
  const totalRequests = useMemo(() => features.reduce((s, f) => s + f.count, 0), [features]);

  const categories = useMemo(() => {
    const map = new Map<string, { totalCount: number; featureCount: number }>();
    features.forEach((f) => {
      const entry = map.get(f.category) || { totalCount: 0, featureCount: 0 };
      entry.totalCount += f.count;
      entry.featureCount += 1;
      map.set(f.category, entry);
    });
    return Array.from(map.entries())
      .map(([name, data]) => ({
        name,
        ...data,
        share: totalRequests > 0 ? data.totalCount / totalRequests : 0,
      }))
      .sort((a, b) => b.totalCount - a.totalCount);
  }, [features, totalRequests]);

  const topCategory = categories[0]?.name || "—";
  const mostRequested = useMemo(() => {
    if (features.length === 0) return "—";
    return features.reduce((a, b) => (a.count >= b.count ? a : b)).normalized_feature_name;
  }, [features]);

  const top10 = useMemo(
    () => [...features].sort((a, b) => b.count - a.count).slice(0, 10),
    [features]
  );

  const categoryColorMap = useMemo(
    () => getCategoryColorMap(categories.map((c) => c.name)),
    [categories]
  );

  return {
    features,
    loading,
    error,
    lastSynced,
    refetch: fetchData,
    totalFeatures,
    totalRequests,
    topCategory,
    mostRequested,
    categories,
    top10,
    categoryColorMap,
  };
}
