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
      <div className="space-y-4">
        <div className="skeleton-pulse h-6 w-32" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-lg p-5">
              <div className="skeleton-pulse h-5 w-24 mb-2" />
              <div className="skeleton-pulse h-4 w-16 mb-3" />
              <div className="skeleton-pulse h-2 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground">By Category</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.name;
          return (
            <button
              key={cat.name}
              onClick={() => onCategoryClick(cat.name)}
              className={`bg-card border rounded-lg p-5 text-left transition-all hover:border-primary/40 ${
                isActive ? "border-primary ring-1 ring-primary/20" : "border-border"
              }`}
            >
              <div className="font-semibold text-foreground text-sm">{cat.name}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {cat.totalCount} requests · {cat.featureCount} features
              </div>
              <div className="mt-3 h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${Math.max(cat.share * 100, 2)}%` }}
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryGrid;
