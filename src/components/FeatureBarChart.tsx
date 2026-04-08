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
      <div className="border border-border rounded-xl p-6">
        <div className="skeleton-pulse h-4 w-36 mb-6" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 mb-4">
            <div className="skeleton-pulse h-3 w-28 rounded" />
            <div className="skeleton-pulse h-7 flex-1 rounded-full" />
            <div className="skeleton-pulse h-3 w-7 rounded" />
          </div>
        ))}
      </div>
    );
  }

  const totalPages = Math.ceil(features.length / PAGE_SIZE);
  const pageFeatures = features.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);
  const maxCount = features.length > 0 ? features[0].count : 1;

  return (
    <div className="border border-border rounded-xl p-6">
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
              {page + 1}/{totalPages}
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

      <div className="space-y-3">
        {pageFeatures.map((f) => {
          const pct = Math.max((f.count / maxCount) * 100, 4);
          const colors = categoryColorMap[f.category];
          return (
            <div key={f.feature_key} className="flex items-center gap-3">
              <span
                className="text-sm text-foreground w-40 truncate shrink-0"
                title={f.normalized_feature_name}
              >
                {f.normalized_feature_name}
              </span>
              <div className="flex-1 h-7 rounded-lg overflow-hidden bg-muted/40">
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

      {totalPages > 1 && (
        <div className="mt-5 pt-4 border-t border-border/60 text-xs text-muted-foreground tabular-nums">
          {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, features.length)} of {features.length}
        </div>
      )}
    </div>
  );
};

export default FeatureBarChart;
