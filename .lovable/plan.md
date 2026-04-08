

## Plan: Add "Coming Soon" Hover Button to Dashboard

A small, subtle button (e.g., a sparkle/rocket icon with "Coming Soon" label) placed in the header area. On hover, it reveals a tooltip/hover card listing upcoming features with brief product-reasoning for each.

### What the PM will see

A small pill-style button in the header row (next to the existing Brain/Settings/Refresh icons) labeled "Coming Soon" with a sparkle icon. Hovering over it shows a popover card with 5-6 upcoming features, each with a name and a one-line product rationale.

### Upcoming features to list

1. **Trend Tracking** — See which requests are accelerating so you can get ahead of demand, not react to it.
2. **Client Attribution** — Tie requests to accounts and revenue so you prioritize by business impact, not just volume.
3. **Feature Status Tracking** — Mark features as Planned/In Progress/Shipped so stakeholders see progress without asking.
4. **Export & Share** — One-click PDF/CSV export to drop into board decks and stakeholder updates.
5. **Per-Feature Notes** — Attach context (blockers, dependencies, roadmap rationale) directly to each request.
6. **Smart Alerts** — Get notified when a feature crosses a request threshold so nothing slips through the cracks.

### Files to modify

- **`src/pages/Index.tsx`** — Add a "Coming Soon" button in the header icon group. Use the existing `HoverCard` component from `src/components/ui/hover-card.tsx` to show the feature list on hover. Import `Sparkles` icon from lucide-react.

### Implementation details

- Use `HoverCardTrigger` wrapping a small pill button (`text-xs`, muted styling, sparkle icon + "Coming Soon" text)
- `HoverCardContent` contains a list of features, each as a `<div>` with a bold feature name and a `text-muted-foreground` one-liner explaining the product reason
- No new components needed — all inline in `Index.tsx` header section
- Keeps the clean, minimal aesthetic of the redesigned dashboard

