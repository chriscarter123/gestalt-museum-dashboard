# Gestalt Museum Dashboard

**Standalone React admin dashboard for museum and gallery owners.**
GitHub: https://github.com/chriscarter123/gestalt-museum-dashboard

---

## Overview

A multi-tier React admin dashboard for museum and gallery owners. The institution tier provides a full 6-page ADA compliance and content management experience. The Gallery Lite tier (starter/gallery) provides a simplified 4-page dashboard with onboarding wizard, QR/sharing tools, and visitor insights. Data is currently mock/static — real Firestore integration is a planned future milestone.

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

## Gallery Lite — added in Session 3

### New pages (Gallery Lite tier)

#### My Gallery (`gallery-home`)
- **Component:** `src/pages/GalleryHome.js`
- Health score card: large accessibility score (0–100), plain-English breakdown (audio coverage, QR labels, wheelchair access), improvement prompt
- Setup checklist: 5 items, dynamically checked against venue state
- Exhibitions section: gated for `starter` tier with upgrade prompt; `gallery`/`institution` shows exhibition list with status badges and Edit links
- Recent activity feed: 5 static mock items

#### QR & Sharing (`qr-sharing`)
- **Component:** `src/pages/QRSharing.js`
- Mock QR code (deterministic 10×10 SVG grid pattern)
- Artwork selector dropdown, Print label button (`window.print()`), Download PNG (disabled, "Coming soon")
- Three label template options: Minimal / Standard / Branded (Branded locked for `starter`)
- Phone frame preview: CSS-drawn rounded rect with viewfinder corner brackets, Gestalt AR app UI mock
- Share section: readonly gallery link with clipboard copy, 280×280 social card preview with venue name

#### Visitor Insights (`visitor-insights`)
- **Component:** `src/pages/VisitorInsights.js`
- Locked state for `starter` tier: gate card with blurred placeholder behind it
- Unlocked (`gallery`+): 4 metric cards, CSS-only bar chart (7-day scans, no chart library), artwork breakdown table, language demand bars with "top unmet request" note
- Date range filter: This week / This month / All time

#### Plan & Billing (`plan-billing`)
- **Component:** `src/pages/PlanBilling.js`
- Current plan card with left green border, usage progress bar, features list
- Full 3-plan comparison (Free / Gallery / Institution), current plan badged, others have Upgrade button
- Billing section hidden for Free tier; shows payment method, next charge, Download invoice, Cancel subscription

### New components

#### Onboarding Wizard (`src/components/OnboardingWizard.js`)
Full-screen overlay shown when `venue.onboardingComplete === false`. 5 steps:
1. **Venue Profile** — name (required), venue type (radio cards), floor count + artwork count (segmented controls). Derives tier from artwork range.
2. **Add First Artwork** — photo drag-drop upload, title/artist/year fields. After upload: 1500ms "generating" spinner, then mock audio player with waveform bars and play/pause toggle.
3. **Accessibility Quick Check** — 3 yes/no/not-sure toggle questions, live score calculation (Yes=33, Not sure=11, No=0).
4. **Choose Your Plan** — 3 plan cards, recommended badge on tier-matched plan. Selecting a plan advances to step 5.
5. **You're Ready** — unchecked action checklist, "Open my dashboard" primary CTA calls `onComplete`.

#### Gallery Lite Sidebar (`src/components/GalleryLiteSidebar.js`)
Same structure as `Sidebar.js` but with 5 nav items across 4 sections (My Gallery / Content / Insights / Account). Tier pill above footer shows plan name + artwork usage count; clicking navigates to `plan-billing`.

#### Exhibition Modal (`src/components/ExhibitionModal.js`)
Fixed-position overlay. Fields: name (required), start/end date, description, artwork multi-select checkboxes. Submit adds to `exhibitions` state in App.js.

### Modified files

#### `src/App.js`
Replaced static single-layout render with full tier routing:
- `venue.onboardingComplete === false` → `<OnboardingWizard />`
- `venue.tier === "institution"` → existing Sidebar + institution pages
- else → `<GalleryLiteSidebar>` + Gallery Lite pages

New state: `venue`, `exhibitions`, `artworks`, `activeModal`

Demo mode toggle: "Preview Gallery Lite" pill in institution header swaps venue state to `venueGalleryDemo`. Demo banner in Gallery Lite header links back.

#### `src/data/mockData.js`
Added three new exports:
- `venue` — institution config (`tier: "institution"`, `onboardingComplete: true`)
- `venueGalleryDemo` — demo config (`tier: "starter"`, `onboardingComplete: false`, 5-artwork limit)
- `exhibitions` — 2 sample exhibitions (Spring Acquisitions 2026 active, Winter Show 2025 archived)

#### `src/pages/Artworks.js`
- Now accepts optional `venue`, `artworks`, `onArtworkAdded` props for Gallery Lite mode; falls back to mock data when used in institution context
- Tier limit banner when `starter` tier hits 5-artwork cap
- Empty state: SVG picture frame illustration + "Add your first artwork" CTA
- Right-side add drawer (`position: absolute`, 420px wide) with photo upload, all fields, mock audio generation flow, Save Artwork submits to parent state

#### `src/components/Sidebar.js`
Added Institution Plan tier badge (green tint, `#14B860`) above user footer.

#### `src/components/StatusBadge.js`
Added variants: `active` (green), `archived` (warm grey), `upcoming` (olive), `locked` (grey + 🔒 icon).

---

## Design tokens

| Token | Value |
|---|---|
| Green (positive) | `#14B860` |
| Gold (caution) | `#D4AF37` |
| Red (alert) | `#E24B4A` |
| Dark navy (sidebar, CTA) | `#111827` |
| Surface | `#FCFCFC` |
| Mist background (Gallery Lite) | `#F4F6F3` |
| Light green fill | `#E8F7EF` |
| Dark green text | `#0D7A3E` |
| Subtext | `#6B7280` |
| Card border | `#E5E7EB` |
| Display font | Newsreader (serif) |
| UI font | Outfit (sans) |

---

## Component structure

```
src/
├── components/
│   ├── Sidebar.js              # Institution nav sidebar (+ tier badge added S3)
│   ├── GalleryLiteSidebar.js   # Gallery Lite nav (5 items, tier pill) — added S3
│   ├── OnboardingWizard.js     # 5-step onboarding flow — added S3
│   ├── ExhibitionModal.js      # New exhibition form modal — added S3
│   ├── PageShell.js            # Page wrapper: title, subtitle, optional action button
│   ├── MetricCard.js           # Ring chart + value + detail + trend badge
│   ├── RingChart.js            # SVG ring chart (r=28, stroke-dashoffset animation)
│   └── StatusBadge.js          # Colored pill badge (+ active/archived/upcoming/locked added S3)
├── pages/
│   ├── ADAScorecard.js         # Institution only
│   ├── VisitorAnalytics.js     # Institution only
│   ├── Artworks.js             # Shared — institution + Gallery Lite (updated S3)
│   ├── AudioDescriptions.js    # Institution only
│   ├── ARAnchors.js            # Institution only
│   ├── GrantReports.js         # Institution only
│   ├── GalleryHome.js          # Gallery Lite home — added S3
│   ├── QRSharing.js            # Gallery Lite QR/share — added S3
│   ├── VisitorInsights.js      # Gallery Lite insights (locked for starter) — added S3
│   └── PlanBilling.js          # Gallery Lite plan/billing — added S3
└── data/
    └── mockData.js             # All static data (+ venue, venueGalleryDemo, exhibitions added S3)
```

---

## Planned — next milestones

- [ ] Wire artworkService.js from museum-ar-app as real data source (Firestore)
- [ ] Audio playback (Web Audio API) for published tracks
- [ ] PDF export via jsPDF or server-side rendering
- [ ] Multi-institution support (institution switcher in Sidebar footer)
- [ ] Auth gate (Firebase anonymous -> staff SSO)
- [ ] Mobile-responsive layout (currently desktop-first)
- [ ] Real QR code generation (replace SVG placeholder)
- [ ] Onboarding data persistence (currently resets on reload)

---

## Session log

| Session | Date | Work |
|---|---|---|
| 1 | 2026-03-23 | Initial build — all 6 pages, shared components, mock data, full-width layout, GitHub push |
| 2 | 2026-03-23 | Debugged Chrome blank page (webpack HMR WebSocket blocked at `0.0.0.0`); fixed with `HOST=localhost` in `.env`; switched to `npx serve -s build` as primary dev workflow; fixed `GrantReports.js` CSS string bug (stray quote in `fontFamily` value); confirmed full 6-page feature set against spec |
| 3 | 2026-03-28 | Built Gallery Lite feature set per `gallery_lite_spec.md` — onboarding wizard (5 steps), venue tier system, Gallery Lite sidebar, 4 new pages (GalleryHome, QRSharing, VisitorInsights, PlanBilling), ExhibitionModal, artwork add drawer, tier routing in App.js, demo mode toggle, new StatusBadge variants, Sidebar tier badge, mockData venue/exhibitions additions |
