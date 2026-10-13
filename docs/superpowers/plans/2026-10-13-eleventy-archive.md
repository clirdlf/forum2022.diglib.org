# DLF Forum 2022 Archive Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Build a faithful, locally self-contained Eleventy archive of the reachable public DLF Forum 2022 site, ready for GitHub Pages at its existing domain.

**Architecture:** Import the WordPress XML and anonymous rendered pages into saved content records, shared layout fragments, and local assets. Eleventy builds from these saved inputs without WordPress access. Focused browser scripts replace the original server-dependent and Elementor interactions.

**Tech Stack:** Node.js 24 in CI; Eleventy 3.1.6; ESM JavaScript; Nunjucks; Cheerio for HTML; fast-xml-parser for WXR; PostCSS and postcss-value-parser for CSS dependencies; built-in Node test runner. Pin installed dependencies in `package-lock.json`.

**Spec:** `docs/superpowers/specs/2026-10-13-eleventy-archive-design.md`

## Global Constraints

- Preserve the current public site's appearance, responsive layouts, published content, URL paths, and visitor interactions, except for the accessibility widget.
- Preserve baseline accessibility, including keyboard operation, visible focus, descriptive image text, and skip links.
- The user selected content reachable through public navigation and links, rather than every published item in the export.
- Retain the XML unchanged.
- Fetching belongs to import, not normal builds.
- Never capture authenticated admin UI, cookies, credentials, WordPress statistics, drafts, private pages, or admin endpoints in the archive.
- Normal generation must succeed from the checked-in source and assets without contacting WordPress.
- Set `CNAME` to `forum2022.diglib.org`.
- Use original trailing-slash permalinks and root-relative internal URLs.
- Pushing, enabling Pages in GitHub settings, changing DNS, and switching the live domain are separate deployment operations, outside this implementation scope.

## Review Focus

- Pagination and older post links: recursively discover content beyond the homepage and the first news page (Task 1).
- Invalid responses: a 200 response containing a challenge page must not become archived content; failures must be resumable (Tasks 1–2).
- CSS and responsive image dependencies: relative font/image URLs and `srcset` must resolve locally without filename collisions (Task 2).
- Removed Elementor initialization: animation-hidden content must remain visible, with working tabs and carousel controls (Tasks 3–4).
- Legacy search and deep links: `?s=`, nested trailing-slash paths, and content fragments must work on a static server (Tasks 4–5).

## File and data structure

- `scripts/import-site.mjs`: orchestrates the explicit online import.
- `scripts/lib/wxr.mjs`: exported records and Elementor/menu metadata.
- `scripts/lib/crawl.mjs`: public page traversal, cache, validated responses.
- `scripts/lib/assets.mjs`: asset inventory, downloads, URL mapping, nested CSS rewrites.
- `scripts/lib/normalize.mjs`: HTML extraction and static normalization.
- `scripts/check-site.mjs`: built-site route/link/asset/fragment validation.
- `data/archive/manifest.json`: capture provenance, included/excluded inventory, discrepancies and asset mappings.
- `data/archive/pages.json`: page records consumed by Eleventy.
- `data/archive/bodies/<id-or-route-key>.html`: saved body fragments.
- `src/_data/archive.js`: loads saved records and body fragments; no fetching.
- `src/_includes/layouts/base.njk`, `src/_includes/partials/{head,header,footer}.njk`: shared document and chrome.
- `src/pages.njk`: one generated page per saved record using Eleventy pagination.
- `src/search-index.11ty.js`, `src/sitemap.11ty.js`, `src/404.njk`: static supporting outputs.
- `src/assets/vendor/`: captured CSS/fonts/media/downloads with deterministic mapped paths.
- `src/assets/css/archive.css`: narrowly scoped compatibility and interaction styling.
- `src/assets/js/{navigation,search,disclosures,carousels,site}.js`: independent visitor interactions.
- `test/{wxr,crawl,assets,normalize,output}.test.mjs`: meaningful importer and output regression tests.
- `eleventy.config.js`, `package.json`, `package-lock.json`, `.gitignore`, `.nvmrc`, `.github/workflows/pages.yml`, `src/CNAME`, `src/.nojekyll`, `README.md`.
- `docs/migration-report.md`: reconciliation, verification results, and concrete limitations.

**Data contracts:** `ExportRecord = { id, type, status, title, url, path, date, contentHtml, metadata }`; `PageCapture = { url, path, html, sourceHash }`; `PageRecord = { id, type, title, path, date, bodyFile, bodyClasses, headHtml, searchText }`. Shared chrome is saved as normalized template partials. `AssetMap` maps absolute original URLs to root-relative local URLs; equivalent URL variants may share a destination only when their content is equivalent.

### Task 1: Reproducible public content inventory

**Files:** Create package/configuration prerequisites, `scripts/import-site.mjs`, `scripts/lib/wxr.mjs`, `scripts/lib/crawl.mjs`, `test/wxr.test.mjs`, `test/crawl.test.mjs`; retain the provided XML unchanged.

**Interfaces:** `parseExport(xml: string): ExportRecord[]`; `crawlPublicSite({ origin, records, fetchPage, cacheDir }): Promise<{ captures: PageCapture[], included: ExportRecord[], excluded: ExportRecord[], issues: object[] }>`; injectable `fetchPage(url): Promise<{ status, contentType, body, finalUrl }>` for fixture tests.

- [x] Add fixtures and failing tests: XML CDATA and escaped titles survive parsing; private/draft/statistics records cannot enter public content; a fixture homepage links to news page 1, page 2, an older post, and a nested page, and all are discovered while an unlinked test page is excluded.
- [x] Run `node --test test/wxr.test.mjs test/crawl.test.mjs`; confirm failures establish the missing importer behavior.
- [x] Implement parsing and traversal. Start from `/`, follow same-origin public HTML links, resolve query pagination and canonical paths, classify backend endpoints, and reuse cached anonymous captures. Keep provenance hashes. Use validated public requests without browser cookies; the initial audit found curl succeeds where Python urllib returned 403, so provide a curl transport if native fetch is rejected.
- [x] Test rejection of a challenge/error response and a resumable partial download failure; only validated responses may populate the cache.
- [x] Run importer tests to PASS, run an inventory import against the live site, compare with the spec's 41-record baseline, and document any newly discovered routes.
- [x] Commit the importer and inventory with `feat: inventory reachable WordPress content`.

### Task 2: Complete local asset capture

**Files:** Create `scripts/lib/assets.mjs`, `test/assets.test.mjs`, `src/assets/vendor/`; extend import manifest and orchestrator.

**Interfaces:** `collectAssetUrls(html: string, pageUrl: string): Set<string>`; `localizeAssets({ urls, fetchAsset, outputDir }): Promise<{ assetMap: AssetMap, issues: object[] }>`; `rewriteCss(css: string, sourceUrl: string, assetMap: AssetMap): string`. `fetchAsset` returns status, content type, and bytes.

- [x] Add failing fixtures for HTML `src`, `srcset`, linked styles, inline background images, favicon, PDFs, CSS `@import`, relative font URLs, and same basenames in different source directories. Assert all referenced local destinations exist and distinct source files do not collide.
- [x] Run `node --test test/assets.test.mjs`; verify the missing localization behavior fails.
- [x] Implement deterministic URL mapping, recursive CSS dependency capture, response validation, cache reuse, and asset type checks. Capture responsive variants and public downloads. Keep external iframe services external; remove tracking/widget resources from the capture queue.
- [x] Run the asset tests to PASS and import real assets. Confirm no required download errors remain and report genuinely unavailable source files with referring pages.
- [x] Commit with `feat: preserve local theme and media assets`.

### Task 3: Faithful Eleventy rendering

**Files:** Create normalization module/tests, saved page/body inputs, archive data loader, page/layout templates, supporting outputs, Eleventy configuration, and compatibility CSS.

**Interfaces:** `normalizePage(capture: PageCapture, record: ExportRecord | null, assetMap: AssetMap): { page: PageRecord, bodyHtml: string, chrome: { headerHtml, footerHtml }, issues: object[] }`; `src/_data/archive.js` returns `PageRecord[]` with loaded `bodyHtml`. Templates render each record at `page.path`.

- [x] Add failing normalization fixtures proving local rewrites, anchor retention, Cloudflare email decoding, skip-link preservation, toolbar/admin/tracking removal, and content visibility after runtime removal. Assert substantive text remains and no admin/REST request hooks survive.
- [x] Run `node --test test/normalize.test.mjs`; confirm failure before implementing normalization.
- [x] Extract shared head/header/footer and per-page body structure, preserving page-specific classes, inline styles, generated Elementor CSS, titles, dates, canonical metadata, and expanded shortcode output. Reconcile XML text with rendered text and record material differences.
- [x] Configure Eleventy 3.1.6 with `src` input and `_site` output, passthrough assets, original permalinks, Nunjucks layouts, static sitemap/404, and no build-time networking. Avoid interpreting imported content as template expressions.
- [x] Run normalization tests and `npm run build` to PASS. Check all 41 baseline routes and captured pagination/archive routes exist. Confirm news pages display all 11 reachable posts with working older/newer navigation.
- [x] Commit with `feat: render the archive with Eleventy`.

### Task 4: Restore visitor interactions

**Files:** Create browser interaction modules and integrate them into the shared layout; extend compatibility CSS and generate `search-index.11ty.js`.

**Interfaces:** Each browser module exports `init(root = document)`. `site.js` initializes modules once. Search records are `{ title, path, text, type }[]` at `/search-index.json`; query parameter `s` provides legacy search input.

- [x] Inspect original controls and settings on representative pages; record expected menu, accordion/tab, slideshow, sponsor, and video/lightbox behavior before replacing their runtimes.
- [x] Implement navigation toggles and dismissal, static search with safe text rendering and no-results output, disclosures/tabs with correct focus/ARIA, table-of-contents links, back-to-top, carousels with original timing and controls, pause/reduced-motion handling, and lightboxes where used. Keep external services and embeds at their existing destinations.
- [x] Start local preview on an unused port. Use the supported browser interface to exercise search via header and `?s=`, empty queries and no results; desktop/mobile menus; keyboard tab/accordion activation; previous/next/pagination and pause controls; anchor navigation; video/lightbox and back-to-top. Confirm visible state changes, not just event-handler presence.
- [x] Confirm all content remains visible without Elementor initialization; disable motion through the supported browser capability when available and verify a readable fallback. Record any browser verification limit rather than claiming unperformed checks.
- [x] Commit with `feat: restore static site interactions`.

### Task 5: Link integrity and visual reconciliation

**Files:** Create `scripts/check-site.mjs`, `test/output.test.mjs`, `docs/migration-report.md`; repair imported records/assets/templates as failures require.

**Interfaces:** `checkSite(outputDir: string): Promise<{ errors: object[], warnings: object[], routes: string[] }>`; command exits nonzero on missing routes/assets or unintended backend dependencies. Source-dead destinations must be explicitly attributed in the report.

- [x] Add failing checker fixtures: nested trailing-slash links, missing HTML route, missing responsive image/font, valid and invalid cross-page fragments, query-only search links, and forbidden WordPress endpoints. Assert valid static routes pass and missing resources fail with referring file locations.
- [x] Run `node --test test/output.test.mjs`; confirm the checker failures, then implement route/asset/fragment checks and known-source-link reporting.
- [x] Run `npm test`, `npm run build`, and `npm run check`; resolve all generated errors. Compare exported content inventory to generated routes and confirm every reachable post is represented.
- [x] Compare original and local home, standard page, news/post, FAQ, schedule, and sponsors at desktop and mobile widths through the supported browser interface. Check every remaining page for obvious overflow, hidden sections, missing images, and broken presentation; adjust only observed differences.
- [x] Record screenshot evidence and actual interaction/content verification results in the migration report, including external dependencies and source-dead links.
- [x] Commit with `test: verify archive fidelity and link integrity`.

### Task 6: GitHub Pages readiness and handoff

**Files:** Create `.github/workflows/pages.yml`, `.nvmrc`, `src/CNAME`, `src/.nojekyll`; finalize package scripts, `.gitignore`, `README.md`, and migration report.

**Interfaces:** `npm run import` performs explicit source refresh; `npm run build` runs Eleventy; `npm start` serves local preview; `npm test` runs importer/checker tests; `npm run check` validates `_site`.

- [x] Configure Node 24 and npm lockfile installation in CI. Follow GitHub's official Pages workflow with configure-pages, upload-pages-artifact targeting `_site`, and deploy-pages; grant Pages write/id-token write only where needed, and use the github-pages environment/concurrency.
- [x] Set the exact custom-domain content `forum2022.diglib.org` in `CNAME`; passthrough `CNAME` and `.nojekyll`; ignore `_site`, dependencies, and raw import caches, while retaining generated archive source inputs and needed assets.
- [x] Document clean install, build, preview, refresh/overwrite behavior, repository Pages source settings, custom-domain setup, source structure, external service dependencies, and explicit absence of live cutover.
- [x] Perform a clean `npm ci`, run `npm test`, `npm run build`, `npm run check`, and `git diff --check`. Demonstrate building from local saved inputs with WordPress fetching disabled. Verify emitted `CNAME` and workflow artifact path.
- [x] Commit with `ci: prepare archive for GitHub Pages`; complete the development review workflow and report verified local results, preview location, and remaining deployment steps. Do not push or change DNS as part of this plan.

## Execution recommendation

Use native execution in this session. The six tasks share importer records, URL mappings, and captured markup, so keeping implementation context together should reduce coordination cost. Perform an independent whole-branch review after checks pass, as required by the execution workflow.

## Reference checks

- Eleventy official documentation identifies 3.1.6 as stable and documents Node 18+ compatibility: https://www.11ty.dev/docs/
- GitHub Pages custom workflows: https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
