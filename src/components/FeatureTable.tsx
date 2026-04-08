import { useState, useMemo, useRef, useEffect } from "react";
import { Search, ArrowUp, ArrowDown, X, ChevronLeft, ChevronRight } from "lucide-react";
import { type Feature } from "@/hooks/useFeatureData";

const PAGE_SIZE = 10;

type SortKey = "normalized_feature_name" | "category" | "count";
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
  const [page, setPage] = useState(0);
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
    setPage(0);
  };

  const filtered = useMemo(() => {
    let list = features.filter((f) => f.count >= 1);
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
      return sortDir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [features, activeCategory, search, sortKey, sortDir]);

  useEffect(() => { setPage(0); }, [search, activeCategory]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return null;
    return sortDir === "asc"
      ? <ArrowUp size={11} className="text-primary" />
      : <ArrowDown size={11} className="text-primary" />;
  };

  if (loading) {
    return (
      <div className="border border-border rounded-xl p-6">
        <div className="skeleton-pulse h-4 w-24 mb-5" />
        <div className="skeleton-pulse h-9 w-full mb-5 rounded-lg" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="skeleton-pulse h-11 w-full mb-2 rounded-lg" />
        ))}
      </div>
    );
  }

  const columns: { key: SortKey; label: string; className: string }[] = [
    { key: "normalized_feature_name", label: "Feature", className: "text-left" },
    { key: "category", label: "Category", className: "text-left" },
    { key: "count", label: "Requests", className: "text-right" },
  ];

  return (
    <div ref={tableRef} className="border border-border rounded-xl p-6">
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <h2 className="text-sm font-semibold text-foreground tracking-tight">All Features</h2>
        <div className="flex-1" />
        <div className="relative min-w-[200px] max-w-xs w-full sm:w-auto">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
          <input
            type="text"
            placeholder="Search…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary/30 transition-all"
          />
        </div>
        {activeCategory && (
          <button
            onClick={onClearCategory}
            className="flex items-center gap-1.5 text-xs font-medium bg-primary text-primary-foreground px-3 py-1.5 rounded-full hover:bg-primary/90 transition-colors"
          >
            {activeCategory}
            <X size={11} />
          </button>
        )}
      </div>

      <div className="overflow-x-auto -mx-6 px-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className={`${col.className} py-2.5 px-3 text-[11px] font-medium text-muted-foreground/60 uppercase tracking-wider cursor-pointer select-none hover:text-foreground transition-colors first:pl-0 last:pr-0`}
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
                <td colSpan={3} className="text-center py-12 text-sm text-muted-foreground">
                  No features match your search.
                </td>
              </tr>
            ) : (
              paginated.map((f) => (
                <tr
                  key={f.feature_key}
                  className="border-b border-border/30 last:border-0 hover:bg-muted/20 transition-colors"
                >
                  <td className="py-3.5 px-3 text-foreground font-medium first:pl-0 text-sm">{f.normalized_feature_name}</td>
                  <td className="py-3.5 px-3">
                    <span className="text-xs text-muted-foreground bg-muted/60 px-2.5 py-1 rounded-md">
                      {f.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-right tabular-nums font-semibold text-foreground text-sm last:pr-0">{f.count}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/60">
        <span className="text-xs text-muted-foreground/60 tabular-nums">
          {filtered.length === 0
            ? "No results"
            : `${page * PAGE_SIZE + 1}–${Math.min((page + 1) * PAGE_SIZE, filtered.length)} of ${filtered.length}`}
        </span>
        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={13} />
            </button>
            <span className="text-xs text-muted-foreground/60 tabular-nums px-1">
              {page + 1}/{totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={13} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeatureTable;
