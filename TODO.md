# Gestalt Museum Dashboard — TODO

## Features
- [ ] **Mobile-responsive layout** — Currently desktop-only. All 6 institution pages + 4 Gallery Lite pages need responsive breakpoints for tablet and mobile
- [ ] **Visitor Analytics data layer** — Page is full placeholder. Requires an event tracking system (artwork scans, audio plays, session duration, device type) piped to Firestore or analytics backend
- [ ] **Plan & Billing** — Hardcoded tier display. Needs Stripe integration for subscription management, payment method handling, invoice generation
- [ ] **Member management UI** — Architecture supports it (`venues/{venueId}/members/{uid}` subcollection + `addMember`/`removeMember` in venueService.js). Needs a Settings page with invite-by-email, role assignment (owner/admin/curator/viewer), and member list

## Improvements
- [ ] **Composite Firestore indexes** — The `artworks` query (`where venueId + orderBy createdAt`) and `exhibitions` query (`where venueId + orderBy startDate`) require composite indexes. On first use, Firestore logs an error with a URL to create them — click those links, or add them to `firestore.indexes.json`
- [ ] **Audio Descriptions — Generate button** — The track library table has a "Generate" button for missing/pending artworks but it's not wired to `callDescribeArtwork()` yet. Needs to open the ArtworkEditorModal or call the Cloud Function directly
- [ ] **Report history persistence** — Grant Reports generates PDFs client-side but doesn't save a record. Add a `reports` subcollection under venues to track generated reports with download URLs
- [ ] **AI report summary** — The Grant Reports preview pane has a placeholder for AI-generated compliance summaries. Could call Claude with artwork metrics to generate a narrative paragraph
