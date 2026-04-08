import { useState, useRef } from "react";
import {
  Brain, Upload, FileText, Trash2, Sparkles, AlertTriangle,
  Eye, EyeOff, ChevronDown, ChevronUp, LayoutDashboard,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import {
  usePMBrain,
  getProvider, saveProvider,
  getApiKey, saveApiKey,
  PROVIDERS,
  type AIProvider,
} from "@/hooks/usePMBrain";
import { useFeatureData } from "@/hooks/useFeatureData";

const PRIORITY_STYLES = {
  high:   { badge: "bg-red-500/10 text-red-600 border border-red-500/20" },
  medium: { badge: "bg-amber-500/10 text-amber-600 border border-amber-500/20" },
  low:    { badge: "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" },
};

const PMBrain = () => {
  const { features } = useFeatureData();
  const {
    documents, addDocument, removeDocument,
    recommendations, analyzing, analyzeError, analyzeWithAI,
  } = usePMBrain();

  // Upload state
  const [uploadTab, setUploadTab] = useState<"upload" | "paste">("upload");
  const [pasteTitle, setPasteTitle] = useState("");
  const [pasteContent, setPasteContent] = useState("");
  const [expandedDoc, setExpandedDoc] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Settings state — one key slot per provider, all persisted independently
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>(getProvider);
  const [keyValues, setKeyValues] = useState<Record<AIProvider, string>>(() => ({
    default:   "",
    anthropic: getApiKey("anthropic"),
    openai:    getApiKey("openai"),
    gemini:    getApiKey("gemini"),
  }));
  const [showKey, setShowKey] = useState(false);
  const [savedProvider, setSavedProvider] = useState<AIProvider | null>(null);

  const handleProviderSwitch = (p: AIProvider) => {
    setSelectedProvider(p);
    saveProvider(p);
    setShowKey(false);
  };

  const handleSaveKey = () => {
    saveApiKey(selectedProvider, keyValues[selectedProvider]);
    saveProvider(selectedProvider);
    setSavedProvider(selectedProvider);
    setTimeout(() => setSavedProvider(null), 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    Array.from(e.target.files || []).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const content = ev.target?.result as string;
        if (content?.trim()) addDocument(file.name, content);
      };
      reader.readAsText(file);
    });
    e.target.value = "";
  };

  const handlePasteAdd = () => {
    if (!pasteContent.trim()) return;
    addDocument(pasteTitle || "Pasted note", pasteContent);
    setPasteTitle("");
    setPasteContent("");
  };

  const activeProviderLabel = PROVIDERS.find((p) => p.id === selectedProvider)?.label ?? "AI";
  const currentProviderMeta = PROVIDERS.find((p) => p.id === selectedProvider)!;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-10 space-y-7">

        {/* Header */}
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Brain size={17} className="text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground tracking-tight">PM Brain</h1>
              <p className="text-xs text-muted-foreground mt-0.5">Upload your expertise — AI will prioritize what you should own</p>
            </div>
          </div>
          <NavLink
            to="/"
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary/30 card-shadow transition-all"
          >
            <LayoutDashboard size={13} />
            Dashboard
          </NavLink>
        </header>

        {/* Reference Documents */}
        <section className="bg-card border border-border rounded-2xl p-6 card-shadow space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-foreground tracking-tight">Reference Documents</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Your expertise, past projects, and domain knowledge
              </p>
            </div>
            {documents.length > 0 && (
              <span className="text-xs font-medium bg-primary/8 text-primary px-2.5 py-1 rounded-full border border-primary/15">
                {documents.length} doc{documents.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          {/* Tab switcher */}
          <div className="flex gap-1 p-1 bg-muted rounded-xl w-fit">
            {(["upload", "paste"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setUploadTab(t)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  uploadTab === t
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t === "upload" ? "Upload File" : "Paste Text"}
              </button>
            ))}
          </div>

          {uploadTab === "upload" ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/40 hover:bg-primary/[0.03] transition-all"
            >
              <Upload size={20} className="mx-auto text-muted-foreground mb-2.5" />
              <p className="text-sm font-medium text-foreground">Click to upload</p>
              <p className="text-xs text-muted-foreground mt-1">.txt or .md files · multiple allowed</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.md"
                multiple
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>
          ) : (
            <div className="space-y-3">
              <input
                type="text"
                value={pasteTitle}
                onChange={(e) => setPasteTitle(e.target.value)}
                placeholder="Title (e.g. Workflow Expertise)"
                className="w-full px-3 py-2 text-sm border border-border rounded-xl bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
              />
              <textarea
                value={pasteContent}
                onChange={(e) => setPasteContent(e.target.value)}
                placeholder="Describe your expertise, past projects, domain knowledge, or areas of ownership…"
                rows={5}
                className="w-full px-3 py-2 text-sm border border-border rounded-xl bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all resize-none"
              />
              <button
                onClick={handlePasteAdd}
                disabled={!pasteContent.trim()}
                className="px-4 py-2 text-sm font-medium rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40"
              >
                Add to Brain
              </button>
            </div>
          )}

          {/* Document list */}
          {documents.length > 0 && (
            <div className="space-y-2 pt-1 border-t border-border">
              {documents.map((doc) => (
                <div key={doc.id} className="rounded-xl border border-border overflow-hidden">
                  <div className="flex items-center gap-3 px-4 py-3 bg-muted/30">
                    <FileText size={13} className="text-primary shrink-0" />
                    <span className="text-sm font-medium text-foreground flex-1 truncate">{doc.name}</span>
                    <span className="text-xs text-muted-foreground shrink-0 tabular-nums">
                      {doc.content.length.toLocaleString()} chars
                    </span>
                    <button
                      onClick={() => setExpandedDoc(expandedDoc === doc.id ? null : doc.id)}
                      className="text-muted-foreground hover:text-foreground transition-colors p-0.5"
                    >
                      {expandedDoc === doc.id ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                    </button>
                    <button
                      onClick={() => removeDocument(doc.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors p-0.5"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                  {expandedDoc === doc.id && (
                    <pre className="text-xs text-muted-foreground whitespace-pre-wrap bg-background px-4 py-3 border-t border-border max-h-48 overflow-y-auto leading-relaxed">
                      {doc.content}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* AI Prioritization */}
        <section className="bg-card border border-border rounded-2xl p-6 card-shadow space-y-5">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-sm font-semibold text-foreground tracking-tight">AI Prioritization</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {features.length > 0
                  ? `${activeProviderLabel} will rank the ${features.length} feature requests by your expertise fit`
                  : `${activeProviderLabel} will rank feature requests by your expertise fit`}
              </p>
            </div>
            <button
              onClick={() => analyzeWithAI(features)}
              disabled={analyzing || documents.length === 0}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {analyzing ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Analyzing…
                </>
              ) : (
                <>
                  <Sparkles size={13} />
                  Analyze & Prioritize
                </>
              )}
            </button>
          </div>

          {analyzeError && (
            <div className="flex items-start gap-2.5 bg-destructive/8 border border-destructive/15 rounded-xl p-3.5 text-sm text-destructive">
              <AlertTriangle size={14} className="mt-0.5 shrink-0" />
              {analyzeError}
            </div>
          )}

          {recommendations.length > 0 && (
            <div className="space-y-2.5 pt-1 border-t border-border">
              <p className="text-xs font-medium text-muted-foreground pt-1">
                {recommendations.length} recommended features
              </p>
              {recommendations.map((rec, i) => {
                const styles = PRIORITY_STYLES[rec.priority] ?? PRIORITY_STYLES.low;
                return (
                  <div
                    key={rec.feature_key}
                    className="flex gap-3 p-4 rounded-xl border border-border bg-muted/20 hover:bg-muted/40 transition-colors"
                  >
                    <span className="text-xs font-semibold text-muted-foreground/50 w-5 pt-0.5 shrink-0 text-right tabular-nums">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-foreground">
                          {rec.normalized_feature_name}
                        </span>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${styles.badge}`}>
                          {rec.priority}
                        </span>
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                          {rec.category}
                        </span>
                        <span className="text-xs font-semibold text-primary bg-primary/8 px-2 py-0.5 rounded-full ml-auto tabular-nums">
                          {rec.count} req
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{rec.reason}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Settings */}
        <section className="bg-card border border-border rounded-2xl p-6 card-shadow space-y-5">
          <h2 className="text-sm font-semibold text-foreground tracking-tight">Settings</h2>

          <div className="space-y-4">
            {/* Provider selector */}
            <div>
              <label className="block text-xs font-medium text-foreground mb-2">AI Provider</label>
              <div className="flex gap-1 p-1 bg-muted rounded-xl w-fit">
                {PROVIDERS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleProviderSwitch(p.id)}
                    className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                      selectedProvider === p.id
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Default provider — no key needed */}
            {selectedProvider === "default" ? (
              <div className="flex items-start gap-3 bg-primary/5 border border-primary/15 rounded-xl px-4 py-3.5">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">No API key required</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    AI runs server-side via the built-in integration. Just upload your docs and hit Analyze.
                  </p>
                </div>
              </div>
            ) : (
              /* Key input for other providers */
              <div>
                <label className="block text-xs font-medium text-foreground mb-2">
                  {currentProviderMeta.label} API Key
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type={showKey ? "text" : "password"}
                      value={keyValues[selectedProvider] ?? ""}
                      onChange={(e) =>
                        setKeyValues((prev) => ({ ...prev, [selectedProvider]: e.target.value }))
                      }
                      placeholder={currentProviderMeta.placeholder}
                      className="w-full px-3 py-2 pr-10 text-sm border border-border rounded-xl bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowKey(!showKey)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  <button
                    onClick={handleSaveKey}
                    disabled={!(keyValues[selectedProvider] ?? "").trim()}
                    className="px-4 py-2 text-sm font-medium rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40 min-w-[72px]"
                  >
                    {savedProvider === selectedProvider ? "Saved!" : "Save"}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-1.5">{currentProviderMeta.hint}</p>
              </div>
            )}

            {/* Saved key indicators for other providers */}
            <div className="flex flex-wrap gap-2">
              {PROVIDERS.filter((p) => p.requiresKey && p.id !== selectedProvider && getApiKey(p.id)).map((p) => (
                <span key={p.id} className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                  {p.label} key saved
                </span>
              ))}
            </div>

            {selectedProvider !== "default" && (
              <p className="text-xs text-muted-foreground">
                Keys are stored locally in your browser and only sent to the respective AI provider.
              </p>
            )}
          </div>
        </section>

      </div>
    </div>
  );
};

export default PMBrain;
