import { useState } from "react";
import { RefreshCw, Settings, Brain, Sparkles } from "lucide-react";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";
import { Link } from "react-router-dom";
import { useFeatureData } from "@/hooks/useFeatureData";
import StatStrip from "@/components/StatStrip";
import FeatureBarChart from "@/components/FeatureBarChart";
import CategoryPills from "@/components/CategoryPills";
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
      <div className="max-w-[960px] mx-auto px-6 sm:px-10 py-12 space-y-8">

        {/* Error banner */}
        {error && (
          <div className="bg-destructive/5 border border-destructive/10 rounded-xl px-5 py-3.5 flex items-center justify-between">
            <span className="text-sm text-destructive">{error}</span>
            <button onClick={handleRefresh} className="text-xs font-medium text-destructive hover:underline">
              Retry
            </button>
          </div>
        )}

        {/* Header */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-foreground tracking-tight">Feature Requests</h1>
            {lastSynced && !loading && (
              <p className="text-[11px] text-muted-foreground/60 mt-0.5">
                Updated {lastSynced.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <Link
              to="/brain"
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              title="PM Brain"
            >
              <Brain size={16} />
            </Link>
            <button
              onClick={() => setShowCredentials(true)}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              title="Settings"
            >
              <Settings size={16} />
            </button>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-30"
              title="Refresh"
            >
              <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
            </button>
          </div>
        </header>

        {/* Needs credentials */}
        {needsCredentials && !loading && (
          <div className="border border-border rounded-2xl p-16 text-center space-y-4">
            <div className="w-11 h-11 rounded-xl bg-muted flex items-center justify-center mx-auto">
              <Settings size={20} className="text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium text-foreground text-sm">Connect your Google Sheet</p>
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
          <div className="border border-border rounded-2xl p-16 text-center">
            <p className="text-sm text-muted-foreground">
              No feature requests yet. Data will appear here after your first call is processed.
            </p>
          </div>
        )}

        {/* Stat strip */}
        {(loading || features.length > 0) && !needsCredentials && (
          <StatStrip
            totalFeatures={totalFeatures}
            totalRequests={totalRequests}
            topCategory={topCategory}
            mostRequested={mostRequested}
            loading={loading}
          />
        )}

        {/* Bar chart */}
        {(loading || top10.length > 0) && !needsCredentials && (
          <FeatureBarChart features={top10} categoryColorMap={categoryColorMap} loading={loading} />
        )}

        {/* Category pills */}
        {(loading || categories.length > 0) && !needsCredentials && (
          <CategoryPills
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
