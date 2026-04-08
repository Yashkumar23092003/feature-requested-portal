import { useState } from "react";
import { Eye, EyeOff, X } from "lucide-react";
import { getStoredCredentials, saveCredentials } from "@/hooks/useFeatureData";

interface CredentialsDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
}

const CredentialsDialog = ({ open, onClose, onSave }: CredentialsDialogProps) => {
  const stored = getStoredCredentials();
  const [spreadsheetId, setSpreadsheetId] = useState(stored.spreadsheetId);
  const [apiKey, setApiKey] = useState(stored.apiKey);
  const [sheetTab, setSheetTab] = useState(stored.sheetTab || "Feature memory");
  const [showKey, setShowKey] = useState(false);

  if (!open) return null;

  const handleSave = () => {
    saveCredentials(spreadsheetId, apiKey, sheetTab);
    onSave();
    onClose();
  };

  const canSave = spreadsheetId.trim() && apiKey.trim();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/10 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-card border border-border rounded-2xl w-full max-w-md mx-4 p-6 space-y-5 card-shadow-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Google Sheets Credentials</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">Spreadsheet ID</label>
            <input
              type="text"
              value={spreadsheetId}
              onChange={(e) => setSpreadsheetId(e.target.value)}
              placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms"
              className="w-full px-3 py-2 text-sm border border-border rounded-xl bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
            />
            <p className="text-xs text-muted-foreground mt-1.5">
              The ID between <code className="font-mono">/d/</code> and <code className="font-mono">/edit</code> in your Sheet URL
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">API Key</label>
            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIza..."
                className="w-full px-3 py-2 pr-9 text-sm border border-border rounded-xl bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">
              Enable the Google Sheets API and create a key in Google Cloud Console
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">Sheet Tab Name</label>
            <input
              type="text"
              value={sheetTab}
              onChange={(e) => setSheetTab(e.target.value)}
              placeholder="Feature memory"
              className="w-full px-3 py-2 text-sm border border-border rounded-xl bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
            />
            <p className="text-xs text-muted-foreground mt-1.5">
              Exact tab name (case-sensitive)
            </p>
          </div>
        </div>

        <div className="flex gap-2 pt-1">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sm font-medium border border-border rounded-xl text-foreground hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave}
            className="flex-1 px-4 py-2 text-sm font-medium rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40"
          >
            Save & Fetch
          </button>
        </div>
      </div>
    </div>
  );
};

export default CredentialsDialog;
