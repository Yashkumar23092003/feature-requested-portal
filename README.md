# ReqWise — Feature Request Dashboard

A lightweight dashboard for product managers to track, visualize, and prioritize customer feature requests — powered by Google Sheets and AI.

---

## What it does

ReqWise turns a Google Sheet of feature requests into a clean, actionable dashboard. Connect your sheet once and get:

- **Stats strip** — total unique features, total request volume, top category, most-requested feature
- **Bar chart** — top features ranked by request count
- **Category pills** — filter the table by category with a single click
- **Full table** — search and explore every request
- **PM Brain** — upload your expertise (`.txt` / `.md` docs) and let an AI rank which features *you* should own, matched against your domain knowledge

An **n8n workflow** sits upstream: it watches a raw intake sheet, runs each new customer transcript through an AI agent that extracts, normalizes, deduplicates, and categorizes feature requests, then writes the results back to a structured "Feature memory" sheet that this dashboard reads.

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Build tool | Vite |
| Styling | Tailwind CSS + shadcn/ui (Radix UI) |
| Routing | React Router v6 |
| Charts | Recharts |
| Data source | Google Sheets API v4 |
| AI (PM Brain) | Claude / OpenAI / Gemini (your key) |
| Automation | n8n workflow |
| Testing | Vitest (unit) + Playwright (e2e) |

---

## Getting started

### Prerequisites

- Node.js 18+ (or [Bun](https://bun.sh))
- A Google Sheet set up as described below
- A Google Sheets API key (read-only is fine)

### 1. Clone and install

```bash
git clone https://github.com/your-org/reqwise.git
cd reqwise
npm install        # or: bun install
```

### 2. Set up your Google Sheet

Your sheet needs a tab named **`Feature memory`** with these columns (header row):

| feature_name | normalized_feature_name | feature_key | category | count |
|---|---|---|---|---|
| Salesforce sync | Salesforce Sync | salesforce_sync | integrations | 4 |

- `feature_key` — snake_case identifier
- `category` — must be one of: `integrations` `reporting` `automation` `permissions` `admin_panel` `analytics` `workflow` `onboarding` `communication` `notifications` `dashboard` `data_export` `ai` `billing` `mobile` `security` `compliance` `ux` `other`
- `count` — number of times this feature has been requested

Share the sheet as **"Anyone with the link → Viewer"** and enable the [Google Sheets API](https://console.cloud.google.com/apis/library/sheets.googleapis.com) for your project.

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). On first load, click **Settings** (gear icon) and paste:

- **Spreadsheet ID** — the long ID from your sheet URL: `docs.google.com/spreadsheets/d/<ID>/edit`
- **Google API Key** — starts with `AIza…`
- **Sheet tab name** — defaults to `Feature memory`

Credentials are stored in `localStorage` — nothing is sent to any server.

### 4. (Optional) Environment variables

Instead of entering credentials in the UI, you can set them in a `.env.local` file:

```env
VITE_SPREADSHEET_ID=your_spreadsheet_id
VITE_GOOGLE_API_KEY=AIza...
```

---

## PM Brain

Navigate to `/brain` (or click the brain icon in the header).

1. **Upload reference docs** — `.txt` or `.md` files describing your expertise, past projects, or domain knowledge. You can also paste text directly.
2. **Choose an AI provider** — use the built-in default (no key needed), or bring your own Claude, OpenAI, or Gemini API key.
3. **Analyze & Prioritize** — the AI reads your docs and the current feature list, then returns a ranked list of features matched to your expertise with High / Medium / Low priority labels and a reason for each.

API keys are stored only in your browser's `localStorage`.

---

## n8n automation workflow

The `n8n-workflow/ReqWise.json` file contains a ready-to-import n8n workflow.

**What it does:**

1. **Trigger** — watches a raw intake Google Sheet for new rows (customer meeting transcripts)
2. **AI agent** — extracts feature requests from the transcript, normalizes them into PM-style names, and semantically matches them against the existing Feature memory sheet
3. **Decision** — if a feature already exists, increments its count; if it's new, creates a new row
4. **Write back** — updates the Feature memory sheet accordingly

**To use it:**

1. In n8n, go to **Workflows → Import** and upload `n8n-workflow/ReqWise.json`
2. Connect your Google Sheets OAuth2 credentials
3. Update the Spreadsheet ID in the trigger and write nodes to point to your sheet
4. Activate the workflow

The AI prompt instructs the agent to classify requests by support status, assign categories from the allowed list, and always return valid JSON — so the downstream write step stays reliable.

---

## Running tests

```bash
# Unit tests
npm run test

# End-to-end tests (requires a running dev server)
npm run dev &
npx playwright test
```

---

## Project structure

```
src/
├── pages/
│   ├── Index.tsx        # Main dashboard
│   └── PMBrain.tsx      # AI prioritization page
├── components/
│   ├── StatStrip.tsx    # Key metrics row
│   ├── FeatureBarChart.tsx
│   ├── CategoryPills.tsx
│   ├── FeatureTable.tsx
│   └── CredentialsDialog.tsx
├── hooks/
│   ├── useFeatureData.ts  # Google Sheets fetch + data transforms
│   └── usePMBrain.ts      # AI provider logic + document management
n8n-workflow/
└── ReqWise.json           # Importable n8n workflow
```

---

## Roadmap

- Trend tracking — see which requests are accelerating over time
- Client attribution — tie requests to accounts and revenue
- Feature status tracking — mark features as Planned / In Progress / Shipped
- Export — one-click PDF/CSV for board decks
- Per-feature notes — attach blockers and dependencies
- Smart alerts — notify when a feature crosses a request threshold

---

## Contributing

Pull requests are welcome. For larger changes, open an issue first to discuss the approach.

## License

MIT
