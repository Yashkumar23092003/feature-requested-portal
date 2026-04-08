import { useState } from "react";
import { Settings, Eye, EyeOff, ExternalLink } from "lucide-react";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-card border border-border rounded-lg w-full max-w-md mx-4 p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2">
          <Settings size={18} className="text-primary" />
          <h2 className="text-base font-semibold text-foreground">Google Sheets Credentials</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Spreadsheet ID
            </label>
            <input
              type="text"
              value={spreadsheetId}
              onChange={(e) => setSpreadsheetId(e.target.value)}
              placeholder="e.g. 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms"
              className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <p className="text-xs text-muted-foreground mt-1">
              The long ID from your Google Sheet URL between <code className="text-xs">/d/</code> and <code className="text-xs">/edit</code>
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              API Key
            </label>
            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIza..."
                className="w-full px-3 py-2 pr-10 text-sm border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              <a
                href="https://console.cloud.google.com/apis/credentials"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline inline-flex items-center gap-0.5"
              >
                Get an API key <ExternalLink size={10} />
              </a>
              {" "}— enable Google Sheets API first
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Sheet Tab Name
            </label>
            <input
              type="text"
              value={sheetTab}
              onChange={(e) => setSheetTab(e.target.value)}
              placeholder="Feature memory"
              className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Exact name of the tab in your Google Sheet (case-sensitive)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sm font-medium border border-border rounded-md text-foreground hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave}
            className="flex-1 px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40"
          >
            Save & Fetch
          </button>
        </div>
      </div>
    </div>
  );
};

export default CredentialsDialog;
