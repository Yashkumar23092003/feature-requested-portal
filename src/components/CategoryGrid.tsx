import { type CategorySummary } from "@/hooks/useFeatureData";

interface CategoryGridProps {
  categories: CategorySummary[];
  activeCategory: string | null;
  onCategoryClick: (name: string) => void;
  loading?: boolean;
}

const CategoryGrid = ({ categories, activeCategory, onCategoryClick, loading }: CategoryGridProps) => {
  if (loading) {
    return (
      <div>
        <div className="skeleton-pulse h-4 w-24 mb-4" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-2xl p-4 card-shadow">
              <div className="skeleton-pulse h-3 w-20 mb-3" />
              <div className="skeleton-pulse h-5 w-10 mb-3" />
              <div className="skeleton-pulse h-1.5 w-full rounded-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-sm font-semibold text-foreground tracking-tight mb-4">By Category</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.name;
          return (
            <button
              key={cat.name}
              onClick={() => onCategoryClick(cat.name)}
              className={`bg-card border rounded-2xl p-4 text-left transition-all duration-200 card-shadow hover:card-shadow-md ${
                isActive
                  ? "border-primary/40 ring-2 ring-primary/10 bg-primary/[0.02]"
                  : "border-border hover:border-primary/25"
              }`}
            >
              <div className="text-xs font-medium text-muted-foreground mb-2 truncate">{cat.name}</div>
              <div className="text-xl font-semibold text-foreground leading-none mb-3">
                {cat.totalCount}
              </div>
              <div className="h-1 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isActive ? "bg-primary" : "bg-primary/50"
                  }`}
                  style={{ width: `${Math.max(cat.share * 100, 3)}%` }}
                />
              </div>
              <div className="text-[11px] text-muted-foreground/60 mt-2">
                {cat.featureCount} feature{cat.featureCount !== 1 ? "s" : ""}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryGrid;
