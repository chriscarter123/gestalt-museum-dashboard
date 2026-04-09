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

## Deployment

**Live URL:** https://gestalt-17ce0.web.app/institutions/

The dashboard is deployed via Firebase Hosting in the `museum-ar-app` project. The build output is copied into `museum-ar-app/deploy/institutions/` and served under the `/institutions/**` rewrite rule.

```bash
# 1. Build the dashboard
npm run build

# 2. Copy build output to the Firebase deploy folder
cp -r build/. ../museum-ar-app/deploy/institutions/

# 3. Deploy from museum-ar-app
cd ../museum-ar-app
firebase deploy --only hosting
```

> Firebase project: `gestalt-17ce0` (shared with `museum-ar-app` and the visitor AR app)


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

## Firebase Architecture

The dashboard shares the `gestalt-17ce0` Firebase project with the main museum-ar-app. Both apps read/write the same Firestore database and call the same Cloud Functions.

### Auth — `src/firebase.js`
Exports `auth` (Firebase Auth) and `db` (Firestore). Session is persisted automatically via `onAuthStateChanged`. Users are identified by `role: 'institution_admin'` in Firestore, distinguishing gallery owners from `role: 'visitor'` (museum-goer) accounts.

### Firestore — `users/{uid}`
```js
{
  uid, email, name, position, initials,
  role: 'institution_admin',
  accountType: 'institution',
  onboardingComplete: false,        // set to true after wizard
  createdAt: serverTimestamp(),
  venue: null,                      // populated after onboarding
}
```

### Cloud Functions (`museum-ar-app/functions/`)
| Function | Trigger | Purpose |
|---|---|---|
| `classify` | HTTP POST | 3-stage artwork classification (Vision API + Claude) |
| `submit` | HTTP POST | Submit artwork to Firestore |
| `transcribe` | HTTP POST | Voice → structured extraction via Claude |
| `describeArtwork` | HTTP POST | Generate visual description + audio script from images via Claude claude-sonnet-4-20250514 vision |
| `checkBadges` | Firestore trigger | Award visitor badges on submission events |

`ANTHROPIC_API_KEY` is stored in Firebase Secret Manager and injected at runtime — never in source code.

---

## ArtworkEditorModal — 7-tab editor

**File:** `src/components/ArtworkEditorModal.js`

Replaces the old single-panel add drawer. Used for both creating and editing artworks. Opens as a centered full-screen modal.

| Tab | Key fields |
|---|---|
| Basic Info | Images (URL paste + file upload + drag-and-drop grid), AR Recognition Embeddings generator, Visual Description with **real AI generation** |
| Classification | Title, artist, year, type, medium, dimensions, style, subject, tags |
| Location | Gallery / floor / room, proximity radius, lat/lng |
| Media | **AI-generated audio description** + animated waveform player, supplementary video/catalog/doc URLs |
| Accessibility | ADA notes, mobility access, sensory notes, wheelchair info |
| AR Anchor | Active toggle, anchor type, experience type, scan distance slider |
| Museum Details | Accession number, acquisition date, provenance, condition, valuation, storage, exhibition history |

**AI generation** (both buttons):
1. Uploaded images converted from blob URL → base64 client-side
2. URL images sent as-is
3. Firebase Auth ID token fetched from `auth.currentUser.getIdToken()`
4. POST to `describeArtwork` Cloud Function with `{ images, metadata }`
5. Claude claude-sonnet-4-20250514 vision analyses images + metadata
6. Returns `{ visualDescription, audioScript }` — applied to the appropriate field
7. Error surfaces inline with retry available

**In-place editing** uses a `localEdits` map in `Artworks.js`:
- Editing existing artwork → patches `localEdits[id]` instead of appending
- New artwork → calls `onArtworkAdded`
- `artworksList` computed as `baseList.map(a => localEdits[a.id] ? { ...a, ...localEdits[a.id] } : a)`

---

## Editorial Design System — Session 5

Visuals updated to match `museum-ar-app/design-system/badge-options.html`.

### Tokens
| Token | Value | Usage |
|---|---|---|
| Grid background | `rgba(17,24,39,0.025)` 40px | `body` via `index.css` |
| Eyebrow label | 10px / 600 / 0.2em / uppercase | Page section headers |
| Display serif | Newsreader 300 / -0.02em | All `h1` headings |
| Dispatch badge | Dot · rule · uppercase text | `StatusBadge.js` |
| Edition Tag | Left color strip + serif name | Tier badges in both sidebars |
| Archive Mark | Double-rule rectangular border | User avatar in sidebar footer |

### Components updated
- **`Sidebar.js` + `GalleryLiteSidebar.js`** — Numbered serif section labels (`01 ─ CONTENT`), Edition Tag tier badges (gold=Institution, green=Gallery, muted=Free), Archive Mark avatar
- **`PageShell.js`** — Tracking eyebrow prop, weight-300 serif `h1`, thin rule divider, outlined uppercase action button with hover fill-invert
- **`StatusBadge.js`** — Rebuilt as Dispatch style: `6px dot · 1px rule · uppercase tracking text` inside thin-bordered pill
- **`index.css`** — Editorial 40px grid background on `body`; scroll fix (`overflow:hidden` moved from `html` to `body, #root`)
- **All Gallery Lite pages** — Backgrounds `#F4F6F3` → `#FCFCFC`, headers rebuilt with eyebrow + weight-300 serif + `1px rgba` rule

---

## Planned — next milestones

- [ ] Mobile-responsive layout (currently desktop-first)
- [ ] Visitor analytics pipeline (currently placeholder)
- [x] Wire artworkService.js from museum-ar-app as real data source (Firestore)
- [x] Audio playback (Web Audio API) with real TTS — `describeArtwork` Cloud Function synthesizes speech via Google Neural2-F; real audio playback in AudioPlayer
- [x] Real QR code generation — `qrcode.react` renders scannable QR codes; auto-generates `qrCode` field on artworks; Download PNG enabled
- [x] Upload images to Firebase Storage — `storageService.js` uploads blob URLs to `artworks/{venueId}/` before Firestore save
- [x] PDF export for Grant Reports — `jsPDF` generates professional compliance PDFs with real artwork metrics
- [x] Multi-institution support — `venues/{venueId}` collection + `members` subcollection; venue switcher in sidebar; auto-migration for existing users
- [x] Proximity radius slider — 5–150m range, 50m default, synced with AR app fallback value

---

## Session log

| Session | Date | Work |
|---|---|---|
| 1 | 2026-03-23 | Initial build — all 6 pages, shared components, mock data, full-width layout, GitHub push |
| 2 | 2026-03-23 | Debugged Chrome blank page (webpack HMR WebSocket blocked at `0.0.0.0`); fixed with `HOST=localhost` in `.env`; switched to `npx serve -s build` as primary dev workflow; fixed `GrantReports.js` CSS string bug; confirmed full 6-page feature set |
| 3 | 2026-03-28 | Gallery Lite — onboarding wizard (5 steps), venue tier system, Gallery Lite sidebar, 4 new pages (GalleryHome, QRSharing, VisitorInsights, PlanBilling), ExhibitionModal, artwork add drawer, tier routing in App.js, demo mode toggle, new StatusBadge variants, Sidebar tier badge |
| 4 | 2026-03-29 | Firebase Auth + Firestore — `RegistrationForm.js` (2-step: credentials → name/position), `LoginForm.js` (signIn, password reset), `firebase.js` (shared project `gestalt-17ce0`), `onAuthStateChanged` session persistence, `role: 'institution_admin'` in Firestore; `ArtworkEditorModal.js` — 7-tab editor (Basic Info, Classification, Location, Media, Accessibility, AR Anchor, Museum Details), animated waveform audio player, AR embeddings generator; bug fixes: scroll blocked on onboarding, edit saving as new artwork (localEdits map), Generate Audio button not appearing |
| 5 | 2026-03-29 | Editorial visual redesign — 40px grid background in `index.css`; both sidebars rebuilt with numbered serif section labels, Edition Tag tier badges, Archive Mark avatars; `PageShell.js` editorial headers (tracking eyebrow + weight-300 serif + thin rule + outlined action button); Dispatch-style `StatusBadge`; all Gallery Lite + Institution page headers updated to match design system from `badge-options.html` |
| 6 | 2026-03-29 | AI integration — `describeArtwork` Cloud Function deployed to `us-central1` using Claude claude-sonnet-4-20250514 vision; accepts up to 4 images (URL or base64) + artwork metadata; returns `visualDescription` + `audioScript`; ANTHROPIC_API_KEY stored in Firebase Secret Manager; dashboard wired with `callDescribeArtwork()` helper (blob→base64 conversion, Firebase auth token, fetch POST); "Generate from Images" and "Generate Audio" buttons now call real Claude API with inline error handling and loading states |
| 7 | 2026-04-01 | **Real data integration** — `artworkService.js` + `exhibitionService.js` with Firestore onSnapshot subscriptions; App.js wired as data coordinator; onboarding saves first artwork to Firestore; image upload to Firebase Storage via `storageService.js`; `deriveMetrics.js` utility for computing page metrics from real artworks; institution pages (ADA Scorecard, Audio Descriptions, AR Anchors, Grant Reports) wired to real data with placeholder states for unavailable systems; Visitor Analytics full placeholder |
| 7b | 2026-04-01 | **TTS pipeline** — `describeArtwork` Cloud Function extended with Google Cloud TTS (Neural2-F voice, en-US); synthesizes audioScript → MP3, uploads to Firebase Storage, returns `audioUrl`; AudioPlayer component uses real `<audio>` element with seek/duration |
| 7c | 2026-04-01 | **QR codes** — `qrcode.react` replaces mock SVG pattern; auto-generates `qrCode` field on artworks missing one; Download PNG enabled; end-to-end flow: dashboard generates QR → visitor scans with jsQR → artwork lookup |
| 7d | 2026-04-01 | **Multi-tenant architecture** — `venueService.js` with `venues/{venueId}` collection + `members/{uid}` subcollection; `createVenue` atomic batch (venue + member + user update); venue switcher dropdown in both sidebars; `currentVenueId` state replaces uid-as-venueId pattern; auto-migration for existing users; Firestore security rules with membership checks |
| 7e | 2026-04-01 | **PDF export** — `generateReportPDF.js` using jsPDF; generates professional ADA/audio/accessibility/AR compliance reports with real metrics, gallery breakdown table, coverage bars, compliance statement; branded header/footer with page numbers |
| 8 | 2026-04-02 | **Proximity radius slider** — expanded range from 1–50m → 5–150m in 5m steps; default changed from 5m → 50m to match AR app fallback; hint text updated to guide curators (10–30m indoor, 50–150m street murals) |
| 9 | 2026-04-07 | **Pilot readiness fixes** — `ArtworkEditorModal.js`: corrected stale Cloud Run URL → `us-central1-gestalt-17ce0.cloudfunctions.net/describeArtwork` (was pointing to dead Cloud Run direct endpoint, breaking Generate AI Description); `Sidebar.js`: removed `mockData` import, replaced hardcoded institution user with real `userProfile` prop — name/email/role/initials now drawn from Firestore auth profile; added `getInitials()` helper for graceful fallback from display name → email prefix |
| 10 | 2026-04-08 | **Firestore composite indexes** — `subscribeToArtworks` and `subscribeToExhibitions` were silently returning empty (error caught by `onSnapshot` handler as `callback([])`); root cause: both queries combine `where venueId == X` with `orderBy` on a different field, requiring a composite index. Composite indexes created in `museum-ar-app/firestore.indexes.json` (shared Firebase project): `artworks(venueId, createdAt)`, `exhibitions(venueId, startDate)`, `submissions(is_first_finder, location.lat)`, `submissions(location.lat, is_first_finder)`. Deployed and confirmed in sync. |

### Session 11 — 2026-04-09 (Three-tier audio, voice picker, trust badges)

**Objective:** Implement multi-layer audio descriptions and curation UX from the Cowork ideation session.

#### `describeArtwork` Cloud Function integration — `ArtworkEditorModal.js`
- `callDescribeArtwork(data, voice)` now passes chosen voice to the CF.
- `generateAudio()` stores all 6 new fields (`overviewScript`, `detailsScript`, `contextScript`, `audioUrlOverview`, `audioUrlDetails`, `audioUrlContext`) plus `voice`, `descriptionTrust`, `descriptionEditedAt`; legacy `audioScript`/`audioUrl` preserved for backward compat.
- `data` state initialization extended with all new fields.
- `handleSave` evaluates `hasAudio` as `!!(data.overviewScript || data.audioScript)`.

#### Voice picker — `ArtworkEditorModal.js`
- `SUPPORTED_VOICES` array (6 Google Neural2 voices) and `DEFAULT_VOICE = 'en-US-Neural2-F'`.
- Curator-side `<select>` in the Media tab; voice is baked at generation time, not visitor-selectable.
- Voice stored on artwork Firestore doc; re-generating respects the current selection.

#### Trust badges — `ArtworkEditorModal.js`
- `TrustBadge({ trust })` component: amber pill "AI Generated" (with ⓘ tooltip warning of inaccuracies), green pill "Curator Approved".
- Editing any script textarea in `TieredAudioPlayer` sets `descriptionTrust: 'curator'` + `descriptionEditedAt` timestamp.

#### Tiered audio player — `ArtworkEditorModal.js`
- `TieredAudioPlayer({ data, onChange })`: tab strip (Overview / Details / Context) + `<audio>` player + editable script textarea.
- Tab switching remounts audio element; editing any script marks trust as `'curator'`.
- `TabMedia` rewritten around voice picker, TrustBadge, Generate button, and TieredAudioPlayer.

#### `artworkService.js` — `normalizeArtwork()`
- Maps all 6 new audio tier fields + `voice`, `descriptionTrust`, `descriptionEditedAt` from Firestore doc.

#### Session table update
| Session | Date | Work |
|---|---|---|
| 11 | 2026-04-09 | **Three-tier audio + voice picker + trust badges** — `ArtworkEditorModal.js` wired to new CF response shape (3 scripts + 3 audio URLs); curator voice picker (6 Neural2 voices, baked at generation); `TrustBadge` (AI Generated / Curator Approved); `TieredAudioPlayer` with tab strip and editable scripts; `artworkService.normalizeArtwork` extended; legacy fields preserved |
