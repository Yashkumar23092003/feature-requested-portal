import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { type Feature } from "@/hooks/useFeatureData";

const PAGE_SIZE = 10;

interface FeatureBarChartProps {
  features: Feature[];
  categoryColorMap: Record<string, { bg: string; bar: string }>;
  loading?: boolean;
}

const FeatureBarChart = ({ features, categoryColorMap, loading }: FeatureBarChartProps) => {
  const [page, setPage] = useState(0);

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-2xl p-6 card-shadow">
        <div className="skeleton-pulse h-4 w-36 mb-6" />
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 mb-4">
            <div className="skeleton-pulse h-3 w-4 rounded" />
            <div className="skeleton-pulse h-3 w-28 rounded" />
            <div className="skeleton-pulse h-5 flex-1 rounded-full" />
            <div className="skeleton-pulse h-3 w-7 rounded" />
          </div>
        ))}
      </div>
    );
  }

  const totalPages = Math.ceil(features.length / PAGE_SIZE);
  const pageFeatures = features.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);
  const maxCount = features.length > 0 ? features[0].count : 1;
  const uniqueCategories = [...new Set(features.map((f) => f.category))].sort();

  return (
    <div className="bg-card border border-border rounded-2xl p-6 card-shadow">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-sm font-semibold text-foreground tracking-tight">Most Requested</h2>
        {totalPages > 1 && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="text-xs text-muted-foreground tabular-nums">
              {page + 1} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>

      <div className="space-y-2.5">
        {pageFeatures.map((f, i) => {
          const rank = page * PAGE_SIZE + i + 1;
          const pct = Math.max((f.count / maxCount) * 100, 3);
          const colors = categoryColorMap[f.category];
          return (
            <div key={f.feature_key} className="flex items-center gap-3 group">
              <span className="text-[11px] font-medium text-muted-foreground/50 w-5 text-right shrink-0 tabular-nums">
                {rank}
              </span>
              <span
                className="text-sm text-foreground w-40 truncate shrink-0 group-hover:text-foreground/80 transition-colors"
                title={f.normalized_feature_name}
              >
                {f.normalized_feature_name}
              </span>
              <div className="flex-1 h-6 rounded-lg overflow-hidden bg-muted/50">
                <div
                  className="h-full rounded-lg transition-all duration-500"
                  style={{ width: `${pct}%`, backgroundColor: colors?.bar }}
                />
              </div>
              <span className="text-xs font-semibold text-muted-foreground w-6 text-right shrink-0 tabular-nums">
                {f.count}
              </span>
            </div>
          );
        })}
      </div>

      {uniqueCategories.length > 0 && (
        <div className="flex flex-wrap gap-x-4 gap-y-2 mt-6 pt-5 border-t border-border">
          {uniqueCategories.map((cat) => (
            <div key={cat} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: categoryColorMap[cat]?.bar }}
              />
              {cat}
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-4 pt-3 border-t border-border flex justify-between items-center">
          <span className="text-xs text-muted-foreground tabular-nums">
            {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, features.length)} of {features.length}
          </span>
        </div>
      )}
    </div>
  );
};

export default FeatureBarChart;
