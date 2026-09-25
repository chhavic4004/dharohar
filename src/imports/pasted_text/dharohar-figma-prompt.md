# Dharohar — Master Figma Design Prompt

Paste everything below into Figma (or Figma AI / First Draft). It is written as one continuous brief, organized so nothing from your research gets lost — every screen is tagged with which USP(s) it covers.

---

## 1. One-line positioning

**"India's first bottom-up living cultural knowledge engine and vulnerability tracker — not another static heritage catalog."**

Design against this contrast on every screen: Indian Culture Portal, Vastra Shilpa Kosh and Incredible India are top-down, read-only, government-archive-feeling. Dharohar should feel **alive, oral, community-authored, and slightly urgent** — like you're watching a living archive fill in real time, not browsing a museum website.

---

## 2. Emotional design direction

- Hero imagery: warm, documentary-style portraits of real elders, artisans and weavers — golden-hour light, hands mid-craft, eyes mid-story. No generic stock-smile photography.
- The feeling to chase: **a grandmother's voice being saved just in time.** Quiet urgency, not corporate polish.
- Bilingual moments throughout: every hero/CTA carries a one-line vernacular echo under the English (Hindi/Punjabi), set in a warm accent color — this is doing real emotional work, keep it everywhere, not just the homepage.
- Numbered "how it works" flows use circular badges (as in your reference screenshots) — this device says "a process, not a feature list," so reserve it only for genuinely sequential content.
- Avoid: generic SaaS card grids with identical rounded corners and soft grey shadows; ALL-CAPS eyebrow labels stacked on every section; a single word italicized in headlines. Keep those instincts out.

---

## 3. Design system

**Color** (follow the reference screenshots as the pinned direction, extended with two supporting accents so it doesn't read as flat cream-and-terracotta):
- `Parchment` #F3ECDA — base background
- `Ink` #241B1D — body text, near-black with warmth
- `Maroon` #7A1F35 — wordmark, headings, primary structural color
- `Terracotta` #C9622E — primary CTA buttons, active states
- `Turmeric Gold` #C68A1D — badges, AI-assisted tags, highlight accents
- `Heritage Green` #3E6B4F — "verified / community reviewed" states only (never decorative)
- `Alert Rust` #A83E22 — Vulnerability Index "Critical" zone only

**Type**
- Display/headings: a high-contrast serif with real character (Fraunces, Playfair Display, or Canela) — this carries the "archival ledger" feeling
- Body/UI: a clean humanist sans (Source Sans 3, Work Sans, or Inter)
- Companion script: Noto Sans Devanagari + Noto Sans Gurmukhi for every bilingual line — never transliterate, use real script

**Motifs**
- A single Phulkari-diamond geometric pattern, used sparingly as a background texture on section dividers only — not on every card
- Dashed stitch-line as a border treatment for story/archive cards (echoes embroidery, ties back to the craft content itself)
- Circular numbered badges only for genuine step sequences

**Card style**: flat 1–2px border, small radius (2–4px), a crisp offset drop-shadow (not blurred) — avoid the identical-rounded-SaaS-card look.

---

## 4. Full site map (23 screens/flows)

1. Landing / Home
2. Language & Onboarding
3. Record a Story (voice-first capture)
4. AI Processing / Knowledge Graph Extraction
5. Review & Consent
6. Story Preserved (confirmation)
7. Story Profile (individual archive record)
8. Heritage Discovery Map (spatio-temporal)
9. Craft & Provenance Passport (QR + crypto)
10. Authentic Heritage Scanner (GI Shield)
11. AR Heritage Walk / Time Machine
12. Tradition Bearer Directory & Mentorship Booking
13. Heritage Skill Micro-Learning Marketplace
14. Heritage Recipe Time Machine
15. Dying Languages & Scripts Trainer
16. Festival & Ritual Calendar
17. Digital Twin Restoration Crowdsourcing
18. Traditional Games Revival
19. Adopt-a-Monument (Student/NEP 2020)
20. Discover / AI Heritage Guide (RAG search)
21. Public Heritage Vulnerability Dashboard
22. Admin/Institutional HVI Heatmap (AICTE/Gov)
23. Gamification Hub (quizzes, badges, pose-estimation, script tracing)

---

## 5. Screen-by-screen briefs

### 1. Landing / Home
*USP: overall positioning*
- Full-bleed hero photo of an elder mid-story, headline "Preserve the voices that carry our heritage," Hindi echo line beneath
- Live counter strip: stories preserved / traditions documented / languages supported / active tradition bearers
- Three pillars: Preserve · Discover · Pass On
- "How a story gets preserved" 5-step numbered flow (Choose language → Record → AI assists → Review & consent → Story preserved)
- Featured story cards (mix of oral history, craft, folk song, Partition memory) with category chip + AI-assisted/Community-reviewed badge
- Footer teaser of the map with a "Explore the living archive" CTA

### 2. Language & Onboarding
*USP: Bhashini/dialect-preserving AI*
- Three large language cards (Hindi/Devanagari, Punjabi/Gurmukhi, English), each showing native script
- Micro-copy: "Speak in the language you dream in — we'll never flatten it."

### 3. Record a Story
*USP: Dialect-Preserving AI + Verified Archive; Living Oral Traditions crowdsourcing; NEP 2020 Vidya Daan*
- Large mic button, animated waveform, timer, pause/stop/restart, upload-instead option
- "Recording as: [Student / Community Member / Researcher]" toggle — this is the Vidya Daan / Adopt-a-Tradition entry point; students recording for course credit selects a school/college field
- Ambient-noise indicator (Web Audio API note) since rural/outdoor recordings are expected
- Small live badge: "Domain lexicon active" — signals dialect-specific craft terms (e.g. Chope, Subhar embroidery stitches) are being recognized, not generic transcription

### 4. AI Processing / Knowledge Graph Extraction
*USP: Knowledge Graph construction, entity linking to Wikidata/NVLI*
- Step pipeline visual: Audio → Bhashini ASR → Entity Extraction → Knowledge Graph → Archive
- Show the extraction as a small interactive graph, not flat JSON: a node for the craft/tradition (e.g. "Phulkari") with edges to Region, Materials, Related Songs, Time Period — annotate one edge "linked to Wikidata Q1158223"
- AI-transparency note: "AI-extracted facts are suggestions, not verified history — you review everything next."

### 5. Review & Consent
*USP: Community-Owned & Student-Led Mapping (consent/usage-rights chain); DPDP Act 2023 compliance*
- Two-column: original-language transcript (in native script) + English/Hindi translation tabs
- Editable AI-suggested fields (tradition, category, related topics)
- Visibility picker: Public / Community-Only / Restricted / Private — each with a one-line consequence explainer
- Consent checkbox referencing informed-consent + withdrawal rights (DPDP Act 2023)
- If category = Partition Memory: show a "pre-1947 origin" field

### 6. Story Preserved
- Quiet, restrained success screen — archive ID, a small animation of the story "joining" the map, not celebratory confetti (this is a memory being preserved, not a game win)

### 7. Story Profile
*USP: Voice Archive; Dialect-Preserving Archive*
- Museum-archive layout: hero image/waveform, audio player, 3-tab transcript (Original / Hindi / English), metadata sidebar (tradition, category, location, verification status, contributor), small embedded map preview, related stories rail

### 8. Heritage Discovery Map
*USP: Heritage Memory Map; Spatio-Temporal GeoJSON layers; Partition Migration Mapping; Geo-Fenced Intangible Discovery*
- Full map, category-colored pins (craft/song/ritual/Partition memory/historical place)
- **Temporal slider**: drag from 1850 → present; historical district-boundary overlays fade in/out (pre-1947 undivided Punjab, colonial-era provinces)
- Partition-memory pins draw a dashed migration line from origin (e.g. Lahore) to present settlement
- Sidebar list + filters (category, region, language, verification status)
- "Near you" panel: geo-fenced discovery of offbeat living traditions — "a pottery cluster 3 km away," "an unrecorded folk performance this week" (differentiates directly from Incredible India's static destination lists)

### 9. Craft & Provenance Passport
*USP: Craft & Tradition Digital Passport; Authenticity & Provenance for Handicrafts; Cryptographic Provenance Passport*
- Full profile per craft: origin, technique, materials, linked artisan, linked oral stories, learning resources
- "Generate certificate" flow: craft + artisan + origin + story → tamper-evident certificate with a cryptographic signature and scannable QR
- Audio-provenance watermark badge: "original recording watermarked against unauthorized AI scraping"
- Buyer-facing verification view: scan QR → see artisan's real story + confirm authenticity

### 10. Authentic Heritage Scanner (GI Shield)
*USP: AI "Authentic Heritage" Scanner & GI Shield*
- Mobile camera viewfinder mockup: "Point your camera at the textile"
- Scan result card: authenticity verdict (Handloom / Power-loom replica), confidence indicator, weave-texture and knot-density visual callouts
- "This matches [GI-registered cluster name]" → links to the artisan's provenance passport (screen 9)
- Framing note for judges: this directly attacks fast-fashion knockoffs undercutting real artisans

### 11. AR Heritage Walk / Time Machine
*USP: AR Heritage Walks; Spatial AR & Conversational Time Machine*
- Camera-viewfinder-styled frame with corner brackets ("AR overlay detected" tag)
- Monument gallery: Golden Temple, Jallianwala Bagh, Hawa Mahal, Qutub Minar (extendable)
- Tabbed info panel: Story / Built by / Why built / When
- "Ghost guide" voice button (multilingual narration — English/Hindi/Punjabi)
- Conversational persona chat bubble: "Ask this place a question" → sample Q "Why are the pillars hollow here?" with a grounded answer
- Small disclaimer chip: "Simulated AR for demo — full build anchors to a live camera feed"

### 12. Tradition Bearer Directory & Mentorship
*USP: Tradition Bearer Directory; Living Heritage Learning Hub; Tradition Mentorship Channel*
- Grid of practitioner profiles (folk singer, weaver, potter, storyteller) — name, craft, consent-controlled location, linked stories
- "Book a micro-apprenticeship" flow: student selects a tradition bearer, picks a session type, confirms — framed as a livelihood channel, not a free service

### 13. Heritage Skill Micro-Learning Marketplace
*USP: Heritage Skill Micro-Learning Marketplace*
- Paid short-course cards (a weaving technique, a dance mudra, a recipe) with price, duration, certification badge
- Artisan payout note visible: "70% goes directly to the tradition bearer"

### 14. Heritage Recipe Time Machine
*USP: Heritage Recipe Time Machine*
- Region/festival selector → reconstructed traditional recipe with a home-cook video
- "Taste lineage" visual: how the same dish varies village to village (small comparative map/strip)
- Ingredient-sourcing tips ("where to find this grain locally")

### 15. Dying Languages & Scripts Trainer
*USP: Dying Languages & Scripts Trainer; Vedic Math/Script Gamification*
- Duolingo-style lesson path for an endangered script (Modi, Grantha, Brahmi, Sharada) or tribal language
- Native-speaker pronunciation clips, gamified streaks, "X people learned Y script this month" impact counter
- Interactive script-tracing canvas with real-time recognition feedback

### 16. Festival & Ritual Calendar
*USP: Festival & Ritual Calendar with Local Context*
- Calendar view; each festival opens local, community-sourced context (not generic Wikipedia-style facts) — "why this ritual is performed this way in your region," sourced from local elders/priests
- Reminder + "how-to" guide toggle for younger users who've lost the practice

### 17. Digital Twin Restoration Crowdsourcing
*USP: Heritage Building "Digital Twin" Restoration Crowdsourcing*
- Upload flow: photos/measurements of a crumbling haveli/temple/stepwell
- Rough 3D reconstruction preview (mockup as a simple extruded/wireframe model, not photoreal)
- Crowdfunding progress bar + volunteer sign-up + "flag to ASI" action

### 18. Traditional Games Revival
*USP: Traditional Games Revival Platform*
- Game tile grid (gilli-danda, kho-kho, pallanguzhi, regional chess variants) — playable-online badge, regional-variant map toggle

### 19. Adopt-a-Monument (Student/NEP 2020)
*USP: Heritage Site "Adopt-a-Monument" for Students; NEP 2020 Vidya Daan integration*
- College/school selects an assigned lesser-known local site
- Research → document → promote workflow tracker, with a public leaderboard of colleges by sites adopted
- "Cultural credits" earned, tied into NEP 2020 Indian Knowledge Systems mandate messaging

### 20. Discover / AI Heritage Guide
*USP: Semantic search; Hybrid BM25+dense+reranked search; AI Heritage Guide (RAG)*
- Search bar with filters (tradition, region, language)
- Conversational panel: ask a question in any language, get an answer **grounded only in archived stories**, with source story citations and an explicit "not enough data yet" fallback when nothing matches — call this out visually as the anti-hallucination safeguard

### 21. Public Heritage Vulnerability Dashboard
*USP: Heritage-at-Risk Intelligence / Heritage Vulnerability Index (HVI) — your strongest differentiator*
- Traditions list sorted by risk, color-coded bars (green/amber/red)
- Formula shown transparently: V = 0.30·Transmission + 0.25·Practitioners + 0.20·Documentation + 0.15·Community Interest + 0.10·Frequency
- "Illustrative prototype indicator, not an official ranking" disclaimer, always visible

### 22. Admin/Institutional HVI Heatmap
*USP: Dynamic Telemetry-Driven HVI Scoring; AICTE/Gov decision-intelligence layer — this is the "elevate from archive to intelligence platform" screen*
- Regional heatmap: Red Zone (V<30, urgent field documentation needed) vs Green Zone (well-documented)
- Telemetry panel per tradition: practitioner age-distribution decay curve, new-submission rate per quarter, query-demand-vs-supply gap
- "Direct a field documentation team" action button — framed for a policymaker user, not a public visitor

### 23. Gamification Hub
*USP: Living Heritage Learning Hub gamified layer; Heritage Challenge; NEP 2020 CV Gamification*
- Quiz cards (guess-the-craft, match-the-song-to-region, identify-the-instrument)
- Digital heritage badges + a "virtual heritage trail" progress map
- **Pose-estimation classical dance module**: camera view scoring a Bharatanatyam/Kathak mudra or a Kalaripayattu stance against a reference pose, live accuracy meter
- Vedic-math interactive visualizer as a secondary tile

---

## 6. Consent & ethics — show this everywhere, not just once

Every screen touching a real person's story or image should visibly carry: consent status badge, "AI-assisted" or "community-reviewed" tag, and a withdrawal/takedown path. This is your strongest maturity signal against every competing platform in the docs — design it as a recurring, unmissable pattern, not a settings-page afterthought.

---

## 7. Prototype/interaction notes for Figma

Wire these as clickable hotspots so the Figma prototype itself feels like a working product, not static slides:
- Every nav item and homepage pillar card
- Monument tiles → AR viewer; AR viewer info tabs
- Map pins → story profile popover; temporal slider → boundary overlay fade
- "Generate certificate" → QR/certificate reveal
- Category filter chips on Discover and Map
- Quiz answer options → explanation reveal
- Language selector → subsequent screens reflect chosen script

---

## 8. Deck alignment

Structure your final SIH slides to mirror this file's order: Problem → Solution (Dharohar) → Innovation/USP (lead with the Heritage Vulnerability Index, not the archive) → Technical architecture → Feasibility & NEP 2020 alignment → Scalability. Screens 21–22 (Vulnerability Dashboard, Admin Heatmap) are your strongest differentiation slides — put screenshots of those first among the "working prototype" slides, not last.