import { useState } from "react";
import { RefreshCw, LayoutGrid, Hash, Crown, TrendingUp, AlertTriangle } from "lucide-react";
import { useFeatureData } from "@/hooks/useFeatureData";
import StatCard from "@/components/StatCard";
import FeatureBarChart from "@/components/FeatureBarChart";
import CategoryGrid from "@/components/CategoryGrid";
import FeatureTable from "@/components/FeatureTable";

const Index = () => {
  const {
    features, loading, error, lastSynced, refetch,
    totalFeatures, totalRequests, topCategory, mostRequested,
    categories, top10, categoryColorMap,
  } = useFeatureData();

  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleCategoryClick = (name: string) => {
    setActiveCategory((prev) => (prev === name ? null : name));
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Error banner */}
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertTriangle size={16} />
              {error}
            </div>
            <button
              onClick={handleRefresh}
              className="text-xs font-medium text-destructive hover:underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Feature Requests</h1>
            <p className="text-sm text-muted-foreground mt-0.5">What your clients are asking for</p>
          </div>
          <div className="flex items-center gap-3">
            {!loading && !error && (
              <span className="text-xs font-medium bg-primary/10 text-primary px-3 py-1 rounded-full">
                {totalFeatures} features · {totalRequests} total requests
              </span>
            )}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 rounded-md border border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors disabled:opacity-50"
              title="Refresh data"
            >
              <RefreshCw size={16} className={refreshing ? "animate-spin-slow" : ""} />
            </button>
          </div>
        </header>

        {lastSynced && !loading && (
          <p className="text-xs text-muted-foreground -mt-4">
            Last synced {lastSynced.toLocaleTimeString()}
          </p>
        )}

        {/* Empty state */}
        {!loading && !error && features.length === 0 && (
          <div className="bg-card border border-border rounded-lg p-12 text-center">
            <p className="text-muted-foreground">
              No feature requests yet. Data will appear here after your first call is processed.
            </p>
          </div>
        )}

        {/* Stats */}
        {(loading || features.length > 0) && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard value={totalFeatures} label="Unique features" icon={LayoutGrid} loading={loading} />
            <StatCard value={totalRequests} label="Total requests" icon={Hash} loading={loading} />
            <StatCard value={topCategory} label="Top category" icon={Crown} loading={loading} />
            <StatCard value={mostRequested} label="Most requested" icon={TrendingUp} loading={loading} />
          </div>
        )}

        {/* Bar chart */}
        {(loading || top10.length > 0) && (
          <FeatureBarChart features={top10} categoryColorMap={categoryColorMap} loading={loading} />
        )}

        {/* Category grid */}
        {(loading || categories.length > 0) && (
          <CategoryGrid
            categories={categories}
            activeCategory={activeCategory}
            onCategoryClick={handleCategoryClick}
            loading={loading}
          />
        )}

        {/* Feature table */}
        {(loading || features.length > 0) && (
          <FeatureTable
            features={features}
            activeCategory={activeCategory}
            onClearCategory={() => setActiveCategory(null)}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
};

export default Index;
