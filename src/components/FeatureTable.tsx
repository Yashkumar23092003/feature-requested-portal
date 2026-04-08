import { useState, useMemo, useRef, useEffect } from "react";
import { Search, ArrowUp, ArrowDown, X, Circle, CheckCircle2 } from "lucide-react";
import { type Feature } from "@/hooks/useFeatureData";

type SortKey = "normalized_feature_name" | "category" | "count" | "signal";
type SortDir = "asc" | "desc";

interface FeatureTableProps {
  features: Feature[];
  activeCategory: string | null;
  onClearCategory: () => void;
  loading?: boolean;
}

const FeatureTable = ({ features, activeCategory, onClearCategory, loading }: FeatureTableProps) => {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("count");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const tableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeCategory && tableRef.current) {
      tableRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [activeCategory]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "normalized_feature_name" || key === "category" ? "asc" : "desc");
    }
  };

  const filtered = useMemo(() => {
    let list = features;
    if (activeCategory) list = list.filter((f) => f.category === activeCategory);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (f) =>
          f.normalized_feature_name.toLowerCase().includes(q) ||
          f.feature_name.toLowerCase().includes(q)
      );
    }

    list = [...list].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "normalized_feature_name") cmp = a.normalized_feature_name.localeCompare(b.normalized_feature_name);
      else if (sortKey === "category") cmp = a.category.localeCompare(b.category);
      else if (sortKey === "count") cmp = a.count - b.count;
      else if (sortKey === "signal") cmp = (a.count >= 5 ? 1 : 0) - (b.count >= 5 ? 1 : 0);
      return sortDir === "asc" ? cmp : -cmp;
    });

    return list;
  }, [features, activeCategory, search, sortKey, sortDir]);

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return null;
    return sortDir === "asc" ? <ArrowUp size={14} /> : <ArrowDown size={14} />;
  };

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-lg p-5">
        <div className="skeleton-pulse h-6 w-28 mb-4" />
        <div className="skeleton-pulse h-10 w-full mb-4" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="skeleton-pulse h-10 w-full mb-2" />
        ))}
      </div>
    );
  }

  const columns: { key: SortKey; label: string; className: string }[] = [
    { key: "normalized_feature_name", label: "Feature", className: "text-left" },
    { key: "category", label: "Category", className: "text-left" },
    { key: "count", label: "Requests", className: "text-right" },
    { key: "signal", label: "Signal", className: "text-center" },
  ];

  return (
    <div ref={tableRef} className="bg-card border border-border rounded-lg p-5">
      <h2 className="text-lg font-semibold text-foreground mb-4">All Features</h2>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search features…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        {activeCategory && (
          <button
            onClick={onClearCategory}
            className="flex items-center gap-1.5 text-xs font-medium bg-primary/10 text-primary px-3 py-1.5 rounded-full hover:bg-primary/20 transition-colors"
          >
            {activeCategory}
            <X size={14} />
          </button>
        )}
      </div>

      <div className="overflow-x-auto -mx-5 px-5">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className={`${col.className} py-2.5 px-3 font-medium text-muted-foreground cursor-pointer select-none hover:text-foreground transition-colors`}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    <SortIcon col={col.key} />
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-8 text-muted-foreground">
                  No features match your search.
                </td>
              </tr>
            ) : (
              filtered.map((f) => (
                <tr key={f.feature_key} className="border-b border-border last:border-0 hover:bg-muted/40 transition-colors">
                  <td className="py-2.5 px-3 text-foreground">{f.normalized_feature_name}</td>
                  <td className="py-2.5 px-3 text-muted-foreground">{f.category}</td>
                  <td className="py-2.5 px-3 text-right font-medium text-foreground">{f.count}</td>
                  <td className="py-2.5 px-3 text-center">
                    {f.count >= 5 ? (
                      <CheckCircle2 size={16} className="text-primary inline-block" />
                    ) : (
                      <Circle size={16} className="text-muted-foreground/40 inline-block" />
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-3 text-xs text-muted-foreground">
        Showing {filtered.length} of {features.length} features
      </div>
    </div>
  );
};

export default FeatureTable;
