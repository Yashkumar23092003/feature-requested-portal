import { type Feature } from "@/hooks/useFeatureData";

interface FeatureBarChartProps {
  features: Feature[];
  categoryColorMap: Record<string, { bg: string; bar: string }>;
  loading?: boolean;
}

const FeatureBarChart = ({ features, categoryColorMap, loading }: FeatureBarChartProps) => {
  if (loading) {
    return (
      <div className="bg-card border border-border rounded-lg p-5">
        <div className="skeleton-pulse h-6 w-40 mb-6" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 mb-3">
            <div className="skeleton-pulse h-4 w-6" />
            <div className="skeleton-pulse h-4 w-32" />
            <div className="skeleton-pulse h-6 flex-1" />
            <div className="skeleton-pulse h-4 w-8" />
          </div>
        ))}
      </div>
    );
  }

  const maxCount = features.length > 0 ? features[0].count : 1;
  const uniqueCategories = [...new Set(features.map((f) => f.category))].sort();

  return (
    <div className="bg-card border border-border rounded-lg p-5">
      <h2 className="text-lg font-semibold text-foreground mb-5">Most Requested</h2>
      <div className="space-y-3">
        {features.map((f, i) => {
          const pct = Math.max((f.count / maxCount) * 100, 4);
          const colors = categoryColorMap[f.category];
          return (
            <div key={f.feature_key} className="flex items-center gap-3">
              <span className="text-xs font-medium text-muted-foreground w-5 text-right shrink-0">
                {i + 1}
              </span>
              <span className="text-sm text-foreground w-44 truncate shrink-0" title={f.normalized_feature_name}>
                {f.normalized_feature_name}
              </span>
              <div className="flex-1 h-7 rounded-md overflow-hidden" style={{ backgroundColor: colors?.bg }}>
                <div
                  className="h-full rounded-md transition-all duration-500"
                  style={{ width: `${pct}%`, backgroundColor: colors?.bar }}
                />
              </div>
              <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full shrink-0">
                {f.count}
              </span>
            </div>
          );
        })}
      </div>

      {uniqueCategories.length > 0 && (
        <div className="flex flex-wrap gap-3 mt-5 pt-4 border-t border-border">
          {uniqueCategories.map((cat) => (
            <div key={cat} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span
                className="w-3 h-3 rounded-sm shrink-0"
                style={{ backgroundColor: categoryColorMap[cat]?.bar }}
              />
              {cat}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FeatureBarChart;
