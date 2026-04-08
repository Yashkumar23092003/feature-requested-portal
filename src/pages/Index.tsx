import { useState, useEffect } from "react";
import { RefreshCw, Settings, Brain, Sparkles, Moon, Sun } from "lucide-react";
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
  const [dark, setDark] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") === "dark";
    }
    return false;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

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
            <HoverCard>
              <HoverCardTrigger asChild>
                <button className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium text-muted-foreground bg-muted/50 hover:bg-muted transition-colors">
                  <Sparkles size={12} />
                  Coming Soon
                </button>
              </HoverCardTrigger>
              <HoverCardContent className="w-80" align="end">
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-foreground">What's next for this tool</p>
                  {[
                    { name: "Trend Tracking", reason: "See which requests are accelerating so you can get ahead of demand, not react to it." },
                    { name: "Client Attribution", reason: "Tie requests to accounts and revenue so you prioritize by business impact, not just volume." },
                    { name: "Feature Status Tracking", reason: "Mark features as Planned / In Progress / Shipped so stakeholders see progress without asking." },
                    { name: "Export & Share", reason: "One-click PDF/CSV export to drop into board decks and stakeholder updates." },
                    { name: "Per-Feature Notes", reason: "Attach context like blockers and dependencies directly to each request." },
                    { name: "Smart Alerts", reason: "Get notified when a feature crosses a request threshold so nothing slips through." },
                  ].map((f) => (
                    <div key={f.name}>
                      <p className="text-xs font-medium text-foreground">{f.name}</p>
                      <p className="text-[11px] text-muted-foreground leading-snug">{f.reason}</p>
                    </div>
                  ))}
                </div>
              </HoverCardContent>
            </HoverCard>
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
