import { type CategorySummary } from "@/hooks/useFeatureData";

interface CategoryPillsProps {
  categories: CategorySummary[];
  activeCategory: string | null;
  onCategoryClick: (name: string) => void;
  loading?: boolean;
}

const CategoryPills = ({ categories, activeCategory, onCategoryClick, loading }: CategoryPillsProps) => {
  if (loading) {
    return (
      <div className="flex items-center gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton-pulse h-7 w-24 rounded-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs text-muted-foreground/60 mr-1">Filter</span>
      {categories.map((cat) => {
        const isActive = activeCategory === cat.name;
        return (
          <button
            key={cat.name}
            onClick={() => onCategoryClick(cat.name)}
            className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
              isActive
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
            }`}
          >
            {cat.name}
            <span className={`ml-1.5 ${isActive ? "text-primary-foreground/70" : "text-muted-foreground/50"}`}>
              {cat.totalCount}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default CategoryPills;
