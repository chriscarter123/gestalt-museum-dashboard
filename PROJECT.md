# Gestalt Museum Dashboard

**Standalone admin dashboard for museum and gallery accessibility management.**

> Stripe meets MoMA — dark sidebar, serif headings, clean data tables.

---

## Overview

A React-based web application that gives museum accessibility officers and gallery administrators a unified view of their ADA compliance status, visitor engagement, artwork coverage, AR anchor reliability, and grant reporting. Data is currently mock/static; Firestore integration is planned.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 18 (Create React App) |
| Routing | In-component `useState` switch (no router library) |
| Styling | Inline styles + global `index.css` |
| Fonts | Outfit (UI), Newsreader (headings) via Google Fonts |
| Data | Mock/static (`src/data/mockData.js`) |
| Deployment | TBD (Firebase Hosting or Vercel) |

---

## Repository Structure

```
gestalt-museum-dashboard/
├── public/
│   └── index.html
├── src/
│   ├── data/
│   │   └── mockData.js          # All mock data for all 6 pages
│   ├── components/
│   │   ├── Sidebar.js           # Dark left nav with section groups
│   │   ├── PageShell.js         # Shared page wrapper (title bar + action button)
│   │   ├── MetricCard.js        # KPI card with ring chart + trend badge
│   │   ├── RingChart.js         # SVG ring/donut chart component
│   │   └── StatusBadge.js       # Pill badge (Excellent / Good / Needs work etc.)
│   ├── pages/
│   │   ├── ADAScorecard.js      # ADA compliance overview + gallery table
│   │   ├── VisitorAnalytics.js  # Visitor metrics + traffic charts
│   │   ├── Artworks.js          # Filterable artwork management table
│   │   ├── AudioDescriptions.js # Audio coverage + generation queue
│   │   ├── ARAnchors.js         # AR anchor reliability management
│   │   └── GrantReports.js      # Report generation + history
│   ├── App.js                   # Root layout + page router + ErrorBoundary
│   ├── index.js                 # React 18 root render
│   └── index.css                # Global reset, fonts, scrollbar
└── PROJECT.md
```

---

## Pages

### ADA Scorecard
Primary landing page. Four KPI metric cards (audio coverage, languages, wheelchair access, AR reliability), gallery breakdown table with progress bars, audio plays bar chart, and language demand chart.

### Visitor Analytics
Monthly visitor metrics with day-of-week bar chart, gallery traffic ranking, device breakdown (iOS / mobile web / desktop), and peak hour context.

### Artworks
Full artwork table with search, gallery filter, type filter, and status filter. Columns: title, artist, gallery, type, audio status, AR score, status badge, actions.

### Audio Descriptions
Coverage summary cards, audio track table with language, duration, source (AI vs. manual), and status. Actions: Generate, Edit, Preview per track.

### AR Anchors
Anchor reliability table with calibration dates, status badges (Calibrated / Needs Recalibration / Flagged). Metric cards for total anchors, avg reliability, below-threshold count, and calibrated today.

### Grant Reports
Report type selector, date range inputs, live metrics preview, export button, and historical report log with status (draft / final).

---

## Design System

Inherits Gestalt brand tokens:

| Token | Value |
|---|---|
| Green (primary) | `#14B860` |
| Gold (secondary) | `#D4AF37` |
| Red (alert) | `#E24B4A` |
| Dark navy (sidebar) | `#111827` |
| Off-white (content bg) | `#FCFCFC` |
| Heading font | Newsreader (serif) |
| UI font | Outfit (sans-serif) |

---

## Running Locally

```bash
npm install
npm start          # dev server → http://localhost:3000
npm run build      # production build
```

---

## Session Log

### Session 1 — 2026-03-23
- Scaffolded standalone CRA project (`gestalt-museum-dashboard`)
- Built all 6 pages with mock data (ADA Scorecard, Visitor Analytics, Artworks, Audio Descriptions, AR Anchors, Grant Reports)
- Full shared component library: Sidebar, PageShell, MetricCard, RingChart, StatusBadge
- Full-screen layout (no max-width constraint, sidebar + scrollable content pane)
- Initialized repo and pushed to `github.com/chriscarter123/gestalt-museum-dashboard`

---

## Roadmap

- [ ] Wire to Firestore (shared data layer with main Gestalt app)
- [ ] Auth — restrict to institution admins
- [ ] PDF export for grant reports
- [ ] AI audio description generation trigger from Audio Descriptions page
- [ ] AR anchor recalibration workflow
- [ ] Multi-institution support (institution switcher in sidebar)
