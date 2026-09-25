Implement a complete Explore Archive & Tradition Detail user flow across the website matching the provided screenshots in styling (#FBF7EE beige background, terracotta/maroon accents, serif typography, warm heritage archive theme):

1. Homepage Entry Point:
- Add a primary CTA button on the Homepage labeled "Explore the Archive".
- Clicking this button navigates directly to the "Explore Heritage" archive page.

2. "Explore Heritage" Archive Page (Screenshots 1, 2 & 3):
- Header: Label "LIVING ARCHIVE", title "Explore Heritage", subtext "Search and discover preserved oral histories, crafts, folk songs and living traditions from across Punjab, Haryana and Delhi."
- Search Bar: Full-width input with placeholder `Search "Phulkari embroidery" or "Partition memories"...`
- Filter Bar & Interactive Controls:
  • Category pills: "All" (active maroon), "Oral History", "Craft & Tradition", "Folk Song", "Living Tradition".
  • Dropdown 1 ("All Regions ⌄"): Options for "All Regions", "Punjab", "Delhi", "Haryana".
  • Dropdown 2 ("All Languages ⌄"): Options for "All Languages", "Hindi", "English", "Urdu", "Punjabi".
  • Dropdown 3 ("All ⌄" / Status): Options for "All", "Community Reviewed", "AI-assisted".
  • Right-side view toggle: Grid vs. List icons.
- Interactive Story Grid:
  • Item count text: "5 stories found".
  • 6-card responsive grid featuring:
    1. "Lahore Se Amritsar — 1947 Ki Yaadein" (Amritsar, Punjab · Punjabi · Community Reviewed badge · 07:23 timer tag)
    2. "Phulkari — Mere Nani Ki Ungliyon Ki Kala" (Patiala, Punjab · Punjabi · Community Reviewed badge · 12:47 timer tag · Craft & Tradition tag)
    3. "Mirza Sahiban — Ludhiane Da Lok Geet" (Ludhiana, Punjab · Punjabi · AI-assisted badge · 05:12 timer tag)
    4. "Vaisakhi Mele Ki Paramparaa" (Amritsar, Punjab · Hindi · AI-assisted badge · 09:34 timer tag)
    5. "Dilli Ke Mohalle Ka Kissa — Shahjahanabad" (Delhi · Hindi · Community Reviewed badge · 14:02 timer tag)
  • Interaction: Add smooth CSS hover transitions to cards (subtle scale-up `scale-[1.02]`, shadow elevation, and smooth cursor pointer).
- Bottom Section ("Documented Traditions"):
  • Headline "Documented Traditions" with link "View vitality dashboard →".
  • 4 overview cards with vitality badges:
    - Phulkari (72 — Stable, 34 stories · Punjab)
    - Punjabi Wedding Folk Songs (42 — Vulnerable, 18 stories · Punjab, Haryana)
    - Traditional Village Storytelling (26 — Needs Attention, 9 stories)
    - Partition Oral Histories (31 — Needs Attention, 12 stories)

3. Tradition Detail Page: Phulkari (Screenshots 4, 5 & 6):
- Trigger: Clicking the Phulkari card from Explore opens `/explore/phulkari`.
- Header: Hero banner with Craft & Tradition badge, title "Phulkari", Gurmukhi "ਫੁਲਕਾਰੀ", Hindi "फूलों का काम", and breadcrumb trail `Home > Explore > Phulkari`.
- Main Left Column (70%):
  • "About the Tradition": Detailed multi-paragraph narrative on darning stitch, khaddar, Bagh patterns, and post-1947 Partition significance.
  • "Voice from the Archive": Inline player with Bibi Surjit Kaur quote ("Phulkari is not merely embroidery. It was a woman's voice when she could not speak."), audio progress bar (12:47), and multi-script transcript toggle (Punjabi original, Hindi, English).
  • "Materials & Technique" Grid (2x3 cards with subtle icons):
    - Base Cloth: Khaddar (hand-spun, hand-woven coarse cotton)
    - Thread: Pat (untwisted silk floss) in vibrant colours
    - Stitch: Darn stitch worked from the back
    - Patterns: Geometric — lozenges, chevrons, flowers
    - Types: Phulkari (partial coverage) · Bagh (full coverage) · Vari Da Bagh
    - Learning: Traditionally passed mother to daughter
  • Contextual photo block showcasing artisan at a traditional loom.
  • "Stories from the Archive": Horizontal card list linking related stories.
- Sticky Right Column (30%):
  • "HERITAGE PROFILE" specs card (Local Name, Region: Punjab India & Pakistan, Practitioners: ~210, Archived Stories: 34, Languages: Punjabi/Hindi/Urdu, UNESCO Status: Not formally listed).
  • "HERITAGE VITALITY" summary card: Displays score `72 / 100`, green status `72 — Stable`, brief explanation, and clickable text link "View Vitality Detail →".
  • "SOURCE & VERIFICATION" card with green `✓ Community Reviewed` badge.

4. Heritage Vitality Analytics Dashboard: Phulkari (Screenshots 7, 8 & 9):
- Trigger: Clicking "View Vitality Detail →" opens `/dashboard/phulkari`.
- Header: Breadcrumb `Dashboard > Phulkari`, title "Phulkari फुलकारी", subtitle "Punjab · 34 stories in archive", and pill tag `72 — Stable`.
- Top Visualizations Panel (2 columns):
  • Left Card: Donut progress gauge displaying center score `72 / 100`, green status badge `72 — Stable`, and supporting text.
  • Right Card: 5-axis Radar / Spider chart plotting: Transmission, Practitioners, Documentation, Community, Practice.
- Middle Section ("Score Breakdown"):
  • Horizontal bar chart comparison of all 5 parameters (Transmission: 68, Practitioners: 74, Documentation: 80, Community Interest: 70, Practice Frequency: 62).
- Lower Section ("Five Factors Explained"):
  • 5 stacked numbered cards with progress indicator bars and weighted percentages:
    1. Transmission (30% weight) — 68 (Knowledge passed to younger generations)
    2. Practitioners (25% weight) — 74 (Active practitioners in the community)
    3. Documentation (20% weight) — 80 (Written, audio, and video records available)
    4. Community Interest (15% weight) — 70 (Community engagement and awareness)
    5. Practice Frequency (10% weight) — 62 (How often the tradition is actively practised)
- Footer Actions:
  • Primary button: "Preserve a Story for this Tradition →" (routes to recording flow).
  • Secondary outline button: "Explore Archive Stories" (routes back to Explore grid).
  • Prototype disclaimer text at the bottom.