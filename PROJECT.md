# Gestalt Museum Dashboard

**Standalone React admin dashboard for museum and gallery owners.**
GitHub: https://github.com/chriscarter123/gestalt-museum-dashboard

---

## Overview

A six-page accessibility and content management dashboard scoped to a single institution. Designed to surface ADA compliance metrics, manage audio descriptions and AR anchors, and generate grant-ready reports. Data is currently mock/static — real Firestore integration is a planned future milestone.

Stack: React 18 (Create React App), inline styles, Outfit (UI) + Newsreader (display) typefaces.

---

## Running locally

```bash
npm install
npm start          # dev server on localhost:3001 (HOST=localhost via .env)

# or serve the production build (more reliable in Chrome):
npm run build
npx serve -s build -l 3001
```

> **Note:** The `.env` file locks `HOST=localhost` to prevent Chrome from blocking the webpack HMR WebSocket at `0.0.0.0`. Always use the production build path if the dev server renders blank.

---

## Pages

### ADA Scorecard
The primary compliance overview page.
- 4 ring-chart metric cards: Audio descriptions (73%), Languages (4), Wheelchair access (91%), AR reliability (0.74)
- Gallery breakdown table with progress bars, wheelchair dot indicators, AR scores, and status badges
- Floor filter pills (All / Ground / Floor 2 / Floor 3)
- Audio plays bar chart (last 7 days)
- Language demand horizontal bars (EN / ES / ZH / FR)

### Visitor Analytics
Traffic and engagement data.
- 4 metric cards: Total visitors, Avg session, Audio engagement, Return rate
- Daily visitors bar chart with 7d / 30d / 90d range filter
- Gallery traffic horizontal bar chart
- Device breakdown stacked bar: iOS app / Web (mobile) / Web (desktop)

### Artworks
Full artwork inventory with filtering.
- Summary strip: total count, with audio, missing audio, avg AR score
- Live search (title or artist) + 3 dropdown filters (gallery, type, status)
- Table: title, artist, gallery, type, audio indicator, AR score mini-bar, status badge, Edit CTA

### Audio Descriptions
Audio coverage management and AI generation queue.
- 4 metric cards: Covered, Pending generation, Missing, Languages
- Track library table filterable by All / Published / Pending / Missing
- Per-track actions: Play (published), Generate (pending/missing)
- AI-generated tracks flagged with ✦ AI in gold

### AR Anchors
Visual recognition anchor management.
- 4 metric cards: Total anchors, Avg reliability, Below threshold, Calibrated today
- Below-threshold callout banner (red/amber) with link to schedule recalibration
- Anchor registry table filterable by status
- Reliability bar per row, color-coded green (>=0.75) / gold (>=0.5) / red (<0.5)
- Per-row Recalibrate CTA on non-calibrated anchors

### Grant Reports
ADA compliance report builder for NEA and state arts council submissions.
- Report type card selector (ADA Annual / Audio Coverage / Accessibility Grant / AR Audit)
- Period picker (Q1 2026, FY 2025, etc.)
- Live preview panel: 4 key stats + AI summary paragraph
- Export as PDF action button
- Report history list with status badges and PDF download CTAs

---

## Component structure

```
src/
├── components/
│   ├── Sidebar.js          # Dark nav sidebar with Gestalt logo, section groups, user footer
│   ├── PageShell.js        # Page wrapper: title, subtitle, optional action button
│   ├── MetricCard.js       # Ring chart + value + detail + trend badge
│   ├── RingChart.js        # SVG ring chart (r=28, stroke-dashoffset animation)
│   └── StatusBadge.js      # Colored pill badge (up/down/flat)
├── pages/
│   ├── ADAScorecard.js
│   ├── VisitorAnalytics.js
│   ├── Artworks.js
│   ├── AudioDescriptions.js
│   ├── ARAnchors.js
│   └── GrantReports.js
└── data/
    └── mockData.js         # All static data: institution, metrics, artworks, anchors, etc.
```

---

## Design tokens

| Token | Value |
|---|---|
| Green (positive) | `#14B860` |
| Gold (caution) | `#D4AF37` |
| Red (alert) | `#E24B4A` |
| Dark navy (sidebar, CTA) | `#111827` |
| Surface | `#FCFCFC` |
| Display font | Newsreader (serif) |
| UI font | Outfit (sans) |

---

## Planned — next milestones

- [ ] Wire artworkService.js from museum-ar-app as real data source (Firestore)
- [ ] Audio playback (Web Audio API) for published tracks
- [ ] PDF export via jsPDF or server-side rendering
- [ ] Multi-institution support (institution switcher in Sidebar footer)
- [ ] Auth gate (Firebase anonymous -> staff SSO)
- [ ] Mobile-responsive layout (currently desktop-first)

---

## Session log

| Session | Date | Work |
|---|---|---|
| 1 | 2026-03-23 | Initial build — all 6 pages, shared components, mock data, full-width layout, GitHub push |
| 2 | 2026-03-23 | Debugged Chrome blank page (webpack HMR WebSocket blocked at `0.0.0.0`); fixed with `HOST=localhost` in `.env`; switched to `npx serve -s build` as primary dev workflow; fixed `GrantReports.js` CSS string bug (stray quote in `fontFamily` value); confirmed full 6-page feature set against spec |
