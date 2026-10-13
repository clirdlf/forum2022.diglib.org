# DLF Forum 2022 static migration

## Captured scope

The archive contains 31 public pages, all 11 public blog posts, 12 reachable news/author/date listing routes, two original redirect aliases, and a 404 page. Reachability is recursive from the homepage, including news pagination and links within posts. This expanded the initial 41-record baseline to 42: David Nemer's page is reached through an original misspelled URL which WordPress redirects.

The seven unlinked exported pages remain excluded. See `data/archive/manifest.json` for the complete inclusion/exclusion inventory, capture hashes, redirect targets, and original-to-local asset mapping. The WordPress XML is retained unchanged. The site has 447 locally captured vendor files, including fonts, CSS and dependencies, responsive image variants, hotel slideshow photos, the homepage video, and sponsorship PDFs.

## Content and behavior

Eleventy renders saved HTML bodies through shared Neve/Elementor header/footer templates at their original URL paths. Ordinary builds use only retained local content and assets. The importer reconciles substantive exported paragraphs/list items/headings with rendered text, ignoring typographic punctuation and whitespace differences. The final capture has no outstanding substantive text discrepancies. WordPress shortcode expansion, public email decoding, lazy-loaded photos, YouTube embed settings, and table-of-contents anchors are preserved.

The accessibility toolbar, analytics, authenticated admin UI, and WordPress runtime scripts are removed. Baseline keyboard navigation and skip links remain. Replacement browser scripts implement search, mobile and desktop menus, footer toggles, accordions, tabs, back-to-top, and carousel initialization. The original locally captured Swiper 8 library preserves touch controls and slide/cube effects, with pause controls and reduced-motion handling.

Two static alias routes reproduce the source redirects:

- `/learndlf/` → `/affiliated-events/learndlf/`
- `/schedule/keynote-speakers/david-neimer/` → `/schedule/keynote-speakers/david-nemer/`

## Verification performed

- Importer/normalization/checker regression tests: 22 passed at the content-verification milestone, including pagination traversal, public/private filtering, challenge rejection, resumable fetch failure, redirect discovery, nested CSS/fonts, responsive/lazy assets, protected email decoding, YouTube/Sched retention, and link/fragment checks.
- Eleventy build: 54 captured routes plus two aliases, 404, sitemap, and search index emitted successfully.
- Generated link/asset/fragment scan: 57 HTML routes, zero new errors, one pre-existing source-link warning.
- Browser route layout scan: all 53 routes other than the external schedule embed reviewed at 1440px desktop and 390px mobile widths; zero horizontal overflow or animation-hidden sections after corrections. The schedule page was reviewed separately at both sizes; its embed script and content render without mobile overflow.
- Visual comparisons against the original: home, About, news listing, a blog post, FAQ, schedule, and sponsors. Compared representative mobile page widths and presentation, and saved local screenshots under `docs/qa/`.
- Browser interactions: header search with results, no results, and empty query; desktop dropdown expansion; mobile sidebar open/close and footer menu toggles; keyboard accordion and tab activation; mobile tab selection; table-of-contents deep link; photo/hotel carousel previous/next and pause; back-to-top; local video keyboard playback (five-second video, ready state 4, playback starts).

The source theme itself clipped large hero headings on mobile. The archive sizes those headings responsively and wraps long URLs to retain readable content. This deliberately changes some narrow-screen line breaks. Desktop branding and presentation retain the original assets and styling. Elementor's full-width sections and Neve's search-panel alignment/current-menu styling are restored explicitly.

## Existing source issues and external dependencies

The link `/affiliated-events/learnatdlf` in `/forum-cfp/` already returns 404 on the source site. It is retained and reported by the checker as a known-source warning; no destination was fabricated.

Sched, YouTube, Spotify, Google Maps, newsletter forms, OSF, and other external services remain external. The Sched embed showed its loading state on both the original and local sites during inspection; successful third-party event-data loading was not verified. Browser autoplay policies may require starting videos manually. Reduced-motion support is implemented, but changing the browser/system motion preference was not exercised with the available browser controls. No image lightboxes were found in the included source markup; a handler supports them if imported later. Social-share destinations are generated without submitting posts during QA.

Local browser QA uses the Eleventy development server; GitHub Pages deployment and live domain cutover have not been performed. A clean `npm ci --offline` using the retained npm cache succeeded. The full suite then passed 23/23 tests, the build succeeded under the network-restricted sandbox, and the generated checker again reported zero errors and the one documented source warning. `CNAME` and `.nojekyll` are present in `_site`; the workflow publishes only the `_site` artifact. Local verification used Node.js 26.11.1; the workflow selects Node.js 24. GitHub Actions itself has not been run.

A refresh-failure regression test also verifies that a failed required asset download leaves the previous build manifest intact. The import now saves final build manifests only after fetching and normalization succeed. The inventory-only mode writes a separate `inventory.json`.

## Final independent review

The independent review found no critical issues, two important issues, and one minor issue. All three were resolved: focusing the pause button no longer reverses its first click; asset MIME compatibility and CSS parsing are validated before caching, and invalid cached assets are discarded and refetched; obsolete Windows tile-image metadata is removed and ordinary metadata text remains unchanged. Regression tests reproduced the important failures before their fixes. The final suite passes 28 tests, the importer successfully validates retained assets, and the build/checker still reports 57 HTML routes with zero errors and one documented source warning. The slideshow pause control was also checked in the browser. The retained XML matches the original byte for byte. No review findings are deferred.

Execution decisions: an isolated local worktree protects main (cost: an extra reversible checkout); retaining original Swiper 8 preserves effects and touch behavior (cost: roughly 140 KB of vendor JavaScript); responsive hero sizing and long-URL wrapping keep mobile content readable (cost: deliberate changes to narrow-screen line breaks).
