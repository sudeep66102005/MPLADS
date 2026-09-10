# MPLADS AI Monitoring & Audit Intelligence — Web Dashboard

React / Next.js (App Router) + TypeScript + Tailwind CSS dashboard, per the
"Person 5 – Dashboard Developer" role in the team structure (React/Next.js
frontend, Dashboard UI/UX, charts, maps, visualizations, user role based
views).

Screens are built to match the reference dashboard mockups (Bengaluru Urban
and Bhopal/Madhya Pradesh views) pixel-for-pixel in layout: sidebar nav,
header, KPI rows, filter bars, map panel + legend + side panels, and the
bottom chart row (sector pie, trend, AI insights).

## Pages

| Route | Screen |
|---|---|
| `/` | Dashboard / MPLADS Project Map — Bengaluru Urban view |
| `/map` | Map View — Madhya Pradesh / Bhopal view with selected-project popup |
| `/projects` | Projects list — KPI row, filters, sortable/paginated table |
| `/projects/[id]` | Project Detail — tabs, AI health/delay scores, radar analysis, financial/physical progress, timeline, risk indicators |
| `/constituency-insights` | Constituency Insights — sector gap analysis, coverage vs need, ward-level gaps, agency contribution, investment trend, recommendations |
| `/priority-queue` | AI Priority Queue — ranked, explainable list ("why this needs review") |
| `/agency-performance` | Implementing Agency Performance Score cards |
| `/mp-attention-centre` | MP Attention Centre — single summary of everything needing attention |
| `/inspection-dossiers`, `/reports`, `/feedback`, `/settings` | Supporting screens (some intentionally lighter-weight — see below) |

## Data layer

All screens currently read from `src/lib/mockData.ts`, a static mock data
module whose numbers were chosen to match the reference screenshots. This
is a deliberate seam: swap the imports in each page for real `fetch()` calls
against the Backend API (see `/backend`) once it's live — the TypeScript
types in `src/lib/types.ts` mirror the backend's Pydantic schemas 1:1.

## Map

Uses a **real Leaflet map** via `react-leaflet`, with **no API key required**:

- **Street basemap:** OpenStreetMap standard tiles
- **Satellite basemap:** Esri World Imagery
- Both are key-free, so the dashboard runs with zero configuration and no
  billing account. Swap the URLs in `src/components/map/LeafletMap.tsx`
  (`TILE_LAYERS`) if you later move to Mapbox/Google/MapmyIndia.

Components:

| File | Role |
|---|---|
| `src/components/map/types.ts` | `GeoPin` / `GeoHeatZone` contracts (real WGS84 lat/lng) |
| `src/components/map/LeafletMap.tsx` | The actual Leaflet map — client-only |
| `src/components/map/MapPanel.tsx` | Wrapper: `next/dynamic` with `ssr: false`, Map/Satellite switcher, risk-heatmap toggle |
| `src/components/map/MapLegend.tsx` | Project-status legend + layer checkboxes |

Implementation notes:

- Leaflet dereferences `window` at import time, so `LeafletMap` is loaded
  exclusively client-side through `next/dynamic({ ssr: false })`. Don't
  import it directly from a server component.
- Project markers are `CircleMarker`s, not default Leaflet markers — this
  sidesteps the well-known broken-marker-icon-URL problem under bundlers,
  and matches the reference design's colored dots.
- Risk hotspots are Leaflet `Circle`s with radii in **metres** (not pixels).
- `scrollWheelZoom` is off so the map doesn't hijack page scrolling.
- Coordinates live in `src/lib/mockData.ts` (`bengaluruMapPins`,
  `bhopalMapPins`, `berasiaMapPins` + matching heat zones) and are real
  lat/lng, so they can be replaced by the backend's `location` field with
  no transformation.

## Running locally

This sandbox has no outbound access to the npm registry (requests to
`registry.npmjs.org` return `403` through the environment's proxy), so
`npm install` could not be run or the app build-verified here. On a machine
with normal internet access:

```bash
cd frontend
npm install
npm run dev
```

Then open `http://localhost:3000`.

```bash
npm run build   # production build
npm run lint    # ESLint
```

## Stack

- Next.js 14 (App Router) + React 18 + TypeScript
- Tailwind CSS for styling
- Recharts for pie/bar/line/radar charts
- lucide-react for icons

## Known gaps / next steps

- Wire pages to the real Backend API instead of `mockData.ts`.
- Add authentication (role-based view scoping per MP / Nodal Authority /
  MoSPI / Agency / Officer) — currently the header always renders a fixed
  demo user.
- `inspection-dossiers`, `reports`, `feedback` are intentionally lighter
  ("coming soon" style) screens since they weren't in the provided
  reference mockups — flesh out once their reference designs exist.
- No automated tests were added per the task instructions (tests were not
  explicitly requested).
