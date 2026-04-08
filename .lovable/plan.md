

## Dashboard Redesign — Clean, Executive-Grade Layout

The current dashboard stacks 5 dense sections vertically (error, stats, bar chart, category grid, table), creating visual overload. The goal is to simplify the layout so it feels polished and effortless — something a CPO would appreciate at a glance.

### Design Philosophy
- Increase whitespace and breathing room
- Reduce visual noise (fewer borders, softer cards)
- Combine the stat cards into a more compact, inline summary
- Make the bar chart the hero — it tells the story immediately
- Collapse category grid into a horizontal pill/filter bar instead of a card grid
- Clean up the table with softer styling and remove the Signal column (it's confusing for non-PMs)
- Refine header to feel more product-grade

### Changes

**1. Header — Refined & minimal**
- Larger title: "Feature Requests" with a subtle tagline showing sync time
- Move PM Brain and Settings into a single icon group, right-aligned
- Remove the inline "X features · Y requests" pill — redundant with stat row

**2. Stat cards → Inline stat row**
- Replace the 4-card grid with a single sleek horizontal strip inside a card
- Four metrics displayed inline as `value + label` pairs separated by subtle dividers
- Much less vertical space, same information

**3. Bar chart — Hero section**
- Remove the category legend footer (categories are shown in the filter bar)
- Slightly taller bars for better readability
- Remove rank numbers (visual order is enough)
- Cleaner spacing

**4. Category grid → Horizontal filter pills**
- Replace the 4-column card grid with a single row of clickable pills/chips
- Each pill shows: `Category name (count)`
- Active pill gets primary color fill
- Dramatically reduces vertical space while keeping interactivity

**5. Feature table — Simplified**
- Remove the Signal column entirely (confusing for executives)
- Softer row borders, more padding
- Keep search and category filter chip
- Cleaner pagination

**6. Global styling tweaks**
- Increase section spacing from `space-y-7` to `space-y-8`
- Remove `card-shadow` in favor of border-only cards (flatter look)
- Slightly larger max-width for breathing room on wide screens

### Files to modify
- `src/pages/Index.tsx` — restructure layout, replace category grid with pills
- `src/components/StatCard.tsx` — replace with inline stat strip component
- `src/components/CategoryGrid.tsx` — rewrite as horizontal pill bar
- `src/components/FeatureBarChart.tsx` — remove legend, rank numbers; cleaner bars
- `src/components/FeatureTable.tsx` — remove Signal column, softer styling
- `src/index.css` — minor tweaks to shadow utilities

