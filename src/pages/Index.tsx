import { useState } from "react";
import { RefreshCw, LayoutGrid, Hash, Crown, TrendingUp, AlertTriangle, Settings, Brain } from "lucide-react";
import { Link } from "react-router-dom";
import { useFeatureData } from "@/hooks/useFeatureData";
import StatCard from "@/components/StatCard";
import FeatureBarChart from "@/components/FeatureBarChart";
import CategoryGrid from "@/components/CategoryGrid";
import FeatureTable from "@/components/FeatureTable";
import CredentialsDialog from "@/components/CredentialsDialog";

const Index = () => {
  const {
    features, loading, error, lastSynced, needsCredentials, refetch,
    totalFeatures, totalRequests, topCategory, mostRequested,
    categories, top10, categoryColorMap,
  } = useFeatureData();

  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);

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
      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-10 space-y-7">

        {/* Error banner */}
        {error && (
          <div className="bg-destructive/8 border border-destructive/15 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-sm text-destructive">
              <AlertTriangle size={15} />
              {error}
            </div>
            <button onClick={handleRefresh} className="text-xs font-medium text-destructive hover:underline">
              Retry
            </button>
          </div>
        )}

        {/* Header */}
        <header className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-foreground tracking-tight">Feature Requests</h1>
            {lastSynced && !loading && (
              <p className="text-xs text-muted-foreground mt-0.5">
                Synced {lastSynced.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {!loading && !error && !needsCredentials && (
              <span className="hidden sm:inline text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-full">
                {totalFeatures} features · {totalRequests} requests
              </span>
            )}
            <Link
              to="/brain"
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary/30 card-shadow transition-all"
            >
              <Brain size={13} />
              PM Brain
            </Link>
            <button
              onClick={() => setShowCredentials(true)}
              className="p-2 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary/30 card-shadow transition-all"
              title="Sheet credentials"
            >
              <Settings size={15} />
            </button>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary/30 card-shadow transition-all disabled:opacity-40"
              title="Refresh"
            >
              <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
            </button>
          </div>
        </header>

        {/* Needs credentials */}
        {needsCredentials && !loading && (
          <div className="bg-card border border-border rounded-2xl p-14 text-center space-y-4 card-shadow">
            <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mx-auto">
              <Settings size={22} className="text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium text-foreground">Connect your Google Sheet</p>
              <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">
                Add your Spreadsheet ID and API Key to start loading feature requests.
              </p>
            </div>
            <button
              onClick={() => setShowCredentials(true)}
              className="inline-flex px-5 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Add Credentials
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && !needsCredentials && features.length === 0 && (
          <div className="bg-card border border-border rounded-2xl p-14 text-center card-shadow">
            <p className="text-sm text-muted-foreground">
              No feature requests yet. Data will appear here after your first call is processed.
            </p>
          </div>
        )}

        {/* Stats */}
        {(loading || features.length > 0) && !needsCredentials && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard value={totalFeatures} label="Unique features" icon={LayoutGrid} loading={loading} />
            <StatCard value={totalRequests} label="Total requests" icon={Hash} loading={loading} />
            <StatCard value={topCategory} label="Top category" icon={Crown} loading={loading} />
            <StatCard value={mostRequested} label="Most requested" icon={TrendingUp} loading={loading} />
          </div>
        )}

        {/* Bar chart */}
        {(loading || top10.length > 0) && !needsCredentials && (
          <FeatureBarChart features={top10} categoryColorMap={categoryColorMap} loading={loading} />
        )}

        {/* Category grid */}
        {(loading || categories.length > 0) && !needsCredentials && (
          <CategoryGrid
            categories={categories}
            activeCategory={activeCategory}
            onCategoryClick={handleCategoryClick}
            loading={loading}
          />
        )}

        {/* Feature table */}
        {(loading || features.length > 0) && !needsCredentials && (
          <FeatureTable
            features={features}
            activeCategory={activeCategory}
            onClearCategory={() => setActiveCategory(null)}
            loading={loading}
          />
        )}

      </div>

      <CredentialsDialog
        open={showCredentials}
        onClose={() => setShowCredentials(false)}
        onSave={handleRefresh}
      />
    </div>
  );
};

export default Index;
