# DLF Forum 2022 Eleventy archive

## Outcome and agreed scope

Create a faithful static archive of https://forum2022.diglib.org/ using Eleventy (11ty), hosted on GitHub Pages at the same custom domain. Preserve the current public site's appearance, responsive layouts, published content, URL paths, and visitor interactions, except for the accessibility widget. Preserve baseline accessibility, including keyboard operation, visible focus, descriptive image text, and skip links.

The user selected content reachable through public navigation and links, rather than every published item in the export. On 2026-10-13 the initial link audit identified 30 pages and 11 posts. Follow links recursively from the public homepage; news pagination and public archive pages are traversal surfaces too. The inventory below is the initial baseline, not permission to omit additional reachable content discovered during implementation. Do not invent replacement content.

This work prepares and verifies the local repository and its GitHub Pages workflow. Pushing, enabling Pages in GitHub settings, changing DNS, and switching the live domain are separate deployment operations, outside this implementation scope.

## Sources and precedence

- `data/dlfforum2022.WordPress.2026-10-13.xml` is the retained source for content, IDs, dates, slugs, titles, attachment metadata, menus, and Elementor configuration.
- Anonymous rendered live pages supply layout structure and presentation not fully described by WordPress content HTML. The site uses Neve and Elementor.
- Public theme CSS, generated Elementor CSS, fonts, images, and downloadable files supply the existing visual assets.
- Prefer exported text and metadata. Use rendered HTML to preserve layout and expanded shortcodes. If those sources materially disagree, record the discrepancy instead of silently discarding content.
- Never capture authenticated admin UI, cookies, credentials, WordPress statistics, drafts, private pages, or admin endpoints in the archive.

## Selected approach

Use Eleventy templates with imported HTML content and local copies of presentation assets. Preserve useful Neve/Elementor classes and layout structure so original CSS can reproduce the design. Extract shared document structure, header/navigation, and footer into reusable templates rather than duplicating complete documents.

A full semantic markup rebuild was considered but increases visual drift. A verbatim HTML mirror was considered but leaves unnecessary WordPress dependencies and makes maintenance harder. The selected approach preserves layout while providing repeatable static builds and explicit interaction code.

## Architecture and data flow

1. An import command parses the XML, inventories public content, captures anonymous rendered pages, and records inclusion/exclusion decisions. Fetching belongs to import, not normal builds.
2. A saved manifest maps WordPress IDs and original URLs to Eleventy permalinks, content records, and required assets. Store readable titles, dates, content type, page-specific styles, and search text separately from content HTML.
3. An asset import step downloads referenced images (including responsive variants), fonts, CSS and its nested dependencies, PDFs, and other local downloads. Resolve relative CSS URLs and preserve a deterministic original-to-local URL mapping.
4. Normalize imported markup: remove the accessibility toolbar, WordPress backend calls, analytics, admin markup, and obsolete plugin scaffolding; decode public Cloudflare-protected email links; rewrite internal links and asset references. Retain anchors, alternate text, metadata, and meaningful layout classes.
5. Eleventy renders shared layouts and saved page bodies at the original paths, emits static search data, public news pagination where needed, a sitemap, a 404 page, `CNAME`, and `.nojekyll`.
6. Small locally hosted scripts implement visitor interactions. Normal generation must succeed from the checked-in source and assets without contacting WordPress.

Keep import/parsing, asset mapping, normalization, templates, and browser interactions in focused modules. Retain the XML unchanged. Document which generated source files can be edited and which the import command will overwrite.

## Visual and interaction requirements

Match branding, Montserrat typography, colors, spacing, header/footer structure, content widths, images, cards, tables, hero sections, responsive breakpoints, and page-specific presentation. Preserve original mobile behavior and avoid horizontal overflow.

Replace server-dependent site search with client-side full-text search over included pages and posts. Keep the existing search entry point and support the legacy `?s=` query format where practical. Search results link to local URLs and have an understandable no-results state.

Implement keyboard-usable desktop dropdowns and mobile navigation, including expanded-state indicators and dismissal. Restore accordions, toggles, tabs, table-of-contents anchor navigation, back-to-top, photo slideshows, sponsor carousels, and any lightboxes used by included content. Preserve relevant autoplay and slide controls; respect reduced motion and allow visitors to pause moving content.

Preserve animated heading presentation where it affects the design, with readable static text as a fallback. Ensure imported Elementor visibility/animation classes cannot leave content permanently hidden when the original runtime is removed.

Preserve existing external service links and embeds, including YouTube/video, Google Maps, Spotify, newsletters, OSF, and event services. These remain network-dependent visitor features. Do not implement registration, newsletter subscriptions, or external scheduling locally. Preserve existing public blog presentation and any displayed comments; do not create a comment submission backend.

## Initial content inventory

### Pages

```text
/
/about/
/about/code-of-conduct/
/about/land-acknowledgement/
/about/team/
/schedule/
/affiliated-events/
/affiliated-events/learndlf/
/resources/
/resources/for-attendees/
/resources/for-presenters-moderators/
/resources/health-protocols/
/resources/local-guide/
/resources/faq/
/schedule/keynote-speakers/
/schedule/social-and-wellness-activities/
/sponsorship/sponsors/
/fellowships/
/fellowships/meet-the-fellows/
/registration/
/news/
/forum-cfp/
/sponsorship/
/schedule/keynote-speakers/meredith-broussard/
/schedule/keynote-speakers/sara-mannheimer/
/schedule/keynote-speakers/dorothy-berry/
/schedule/keynote-speakers/michelle-caswell/
/resources/hotel-accommodations/
/schedule/keynote-speakers/andrew-coy/
/schedule/livestream-recordings/
```

### Posts

```text
/2022-cfps-now-live/
/plans-for-in-person-dlf-forum-and-affiliated-events-during-covid-19/
/2022-dlf-forum-fellowship-applications-open-now-through-may-31/
/update-covid-19-and-clirs-2022-events-may-10/
/community-voting-for-all-2022-clir-events-is-now-open/
/registration-is-now-open-for-clirs-2022-events/
/programs-are-live-for-clirs-2022-events-dlf-forum-learndlf-digipres-dhc-symposium/
/update-covid-19-and-clirs-2022-events-august-1/
/a-note-about-clirs-2022-in-person-events/
/update-covid-19-and-clirs-2022-events-september-13/
/update-covid-19-and-clirs-2022-events-september-26/
```

### Currently excluded because unlinked

```text
/sample-page/
/old-sponsorship/
/old-sponsorship/exhibitors/
/scratch/
/calls-for-proposals/
/test-page/
/sponsorship/past-sponsors/
/schedule/keynote-speakers/david-nemer/
```

An item is included if reachable from any included public page, including old links within posts; being absent from the primary menu does not exclude it. Ignore WordPress management, REST, tracking, and email-obfuscation endpoints as content traversal targets. Preserve relevant category, author, or date archive destinations if public content links to them; do not manufacture unused archive routes.

## GitHub Pages and maintenance

Use a supported Eleventy release with a lockfile and a compatible pinned Node major in the workflow. Provide `npm run build` and a local preview command. Output to `_site/` and exclude generated output and dependencies from Git.

Use the GitHub Actions Pages artifact/deployment workflow. Set `CNAME` to `forum2022.diglib.org`. Use original trailing-slash permalinks and root-relative internal URLs. Normal page loads must not depend on the retiring WordPress origin for local content, styling, fonts, or downloads.

The README describes prerequisites, build/preview/import commands, source layout, Pages setup, custom-domain setup, and known external dependencies. Any unavailable asset or source discrepancy must be explicitly listed in the migration report.

## Failure handling and validation

Fail the import clearly on a required page or asset download failure; retain successful captures and make reruns deterministic. Validate response types to avoid saving a challenge/error page as HTML or an image. Report genuinely dead source links with their referring pages rather than fabricating destinations.

Completion requires:

- A clean dependency install and successful Eleventy build from retained local inputs.
- Every included route and required public archive/pagination route emitted at its expected path.
- No broken generated internal links, missing local asset references, or unintended references to WordPress backend endpoints. Validate fragment links where meaningful.
- Content reconciliation against the XML and rendered source, including all 11 reachable posts and news pagination.
- Desktop and mobile visual comparison for home, a standard content page, news/post, FAQ, schedule, and sponsors; inspect other pages for layout issues.
- Browser checks for menus, search (including empty results), tabs/accordions, slide controls, anchors, and back-to-top; keyboard checks for key controls.
- No accessibility toolbar, authenticated admin content, analytics tracking, or backend-dependent visitor controls in generated output.
- GitHub Pages configuration verified locally; report that live cutover has not been performed.

Record test results and remaining concrete limitations in the final handoff. External embeds and genuinely dead third-party destinations are not grounds to invent functionality.
