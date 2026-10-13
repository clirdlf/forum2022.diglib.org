# DLF Forum 2022 archive

An Eleventy 3.1.6 static archive of [forum2022.diglib.org](https://forum2022.diglib.org/), prepared for GitHub Pages at the same custom domain. It includes the reachable public pages, all 11 blog posts, news pagination, linked author/date archives, and original redirect aliases. The accessibility widget and WordPress backend dependencies have been removed.

## Build and preview

Use Node.js 24.15 or newer in the 24.x release line (CI uses `.nvmrc`), or Node.js 26+, pnpm, and a normal repository checkout. If you use nvm, run `nvm install` and `nvm use` first. Use pnpm 12.11.2, pinned by `packageManager` in `package.json`. CI uses the same pnpm version and `pnpm-lock.yaml`; npm lockfiles are not used.

```sh
pnpm install --frozen-lockfile
pnpm run test
pnpm run build
pnpm run check
pnpm run check:a11y
pnpm run dev
```

The preview serves at http://localhost:8082/. Production files are generated in `_site/`. Stop preview with Ctrl+C. Builds do not fetch anything from WordPress; all required content, fonts, theme styles, images, video, and downloads are retained locally. A dependency install needs package registry access unless packages are cached.

`pnpm run check` validates generated routes, links, fragments, image variants, CSS/font dependencies, and unwanted WordPress endpoints. It exits unsuccessfully on new errors. One already-dead source link is explicitly recorded as a warning in the [migration report](docs/migration-report.md).

## Source layout and editing

- `data/dlfforum2022.WordPress.2026-10-13.xml`: original, unchanged WordPress export.
- `data/archive/manifest.json`: provenance, content inclusion/exclusion, original redirects, asset mappings, and source issues.
- `data/archive/pages.json` and `data/archive/bodies/`: generated content records and normalized page bodies.
- `src/_includes/`: shared document layout, head, header, and footer.
- `src/assets/vendor/`: original captured styles, fonts, media, and downloads. Each filename has a URL-derived prefix to avoid collisions.
- `src/assets/css/archive.css`: static compatibility and responsive corrections.
- `src/assets/js/`: replacement menus, search, disclosures, carousel setup, and layout behavior.
- `scripts/`: explicit importer and output checker; `test/`: regression fixtures for their behavior.
- `docs/qa/`: local visual evidence and route-layout checks.

For a permanent text correction, add an exact HTML/text replacement to `data/content-corrections.json`, keyed by the original page path. For example:

```json
{
  "/about/": [
    {"find": "Original wording", "replace": "Corrected wording"}
  ]
}
```

Corrections run during every build and survive a fresh import. A correction whose original text is no longer present fails explicitly, so changed source content requires review. One-off body HTML/record edits are also possible, but a successful import overwrites those edits. Template and interaction changes belong under `src/`. Imported HTML is rendered as data, rather than executed as Nunjucks template source.

## Refresh the archive

The import needs the original public WordPress site to remain available and requires `curl` on PATH. Requests are anonymous and do not use browser cookies or WordPress credentials.

```sh
# Resume/reuse validated local captures and download missing files:
pnpm run import

# Explicitly discard only raw page/asset caches and recapture the public site:
pnpm run import --refresh

# Inspect reachability without replacing the build's saved manifests:
pnpm run import --inventory-only

pnpm run test
pnpm run build
pnpm run check
```

Import follows links recursively from the public homepage, including news pagination and archive listings. Drafts, private pages, statistics, admin/API URLs, and unlinked test pages are excluded. Cache directories live under ignored `.cache/` and are not needed to build or host the archive. Validated captures survive interrupted imports. Required page/asset failures abort the import. Bodies, vendor assets, shared templates and manifests are staged before publication; a publication failure rolls back the complete replacement set. Individual replacements use filesystem renames. Stop the development server before importing so it cannot build midway through publication. A machine crash or failed rollback can leave `.backup-*` files; retain these for recovery. An unknown public link that already returns 404 is recorded as a source issue.

A successful full import overwrites `data/archive/pages.json`, `data/archive/manifest.json`, page bodies, captured vendor assets, and imported shared header/footer partials. Keep permanent content corrections in `data/content-corrections.json`; back up other manual imported-file edits before refreshing. Accessibility markup repairs are reapplied automatically during every build. `--refresh` reuses the supplied XML, so obtain a newer export separately if you intend to change the content source.

## Archived program

`data/schedule/program.json` preserves the public Sched program, including session descriptions, speakers, dates, times and rooms. The website provides `/schedule/program/` and a downloadable `/schedule/program.json`. These use local data and continue working if Sched is unavailable.

```sh
pnpm run import:schedule
# Explicitly recapture Sched instead of using validated cache files:
pnpm run import:schedule --refresh
```

The schedule import is separate from the WordPress import. It requires the public Sched pages and `curl`; it validates every session before replacing the retained program. Git records changes to the captured data for review.

## Accessibility and upkeep

`pnpm run check:a11y` uses axe-core in a DOM environment to check WCAG-tagged accessibility semantics across every generated HTML route, with the menu and disclosure scripts initialized. It does not fetch external resources. Color contrast, layout, motion, screen-reader interaction, embedded third-party content and PDFs require browser/manual review. Results are saved in ignored `.cache/accessibility-results.json`; CI fails on reported rule violations.

For dependency updates, use pnpm, retain the locked package-manager version, and run the full checks plus `pnpm run dev` to verify startup and watching. `pnpm audit` currently reports two unpatched transitive build-tool advisories: `braces` (high, used by the file watcher) and `sprintf-js` (moderate, under YAML tooling). The fixed direct XML-parser and PostCSS versions are retained. Neither unpatched dependency is shipped as browser code. Review upstream patches before the next dependency update; no audit findings are suppressed. A Chokidar 4 override was rejected because it broke Eleventy 3 template watching.

Avoid routine recapture once the archive is finalized: builds need no original WordPress or Sched server. Review imported content and captured CSS as trusted source inputs. Keep an independent repository backup, preserve the export and program JSON, and review external link availability periodically.

## GitHub Pages

The tracked [workflow](.github/workflows/pages.yml) installs locked pnpm dependencies, runs tests, builds and checks `_site`, then publishes that artifact on pushes to `main`. Pull requests run the checks without deploying. It follows [GitHub's custom Pages workflow](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

To deploy after reviewing and integrating the implementation branch:

1. Push the completed source to GitHub.
2. Under repository **Settings → Pages**, select **GitHub Actions** as the build/deployment source.
3. Set the custom domain to `forum2022.diglib.org`. `_site/CNAME` contains that same domain.
4. Configure and verify DNS using [GitHub's custom-domain guidance](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site), then enable HTTPS when GitHub makes it available.
5. Verify the domain and representative deep links before retiring WordPress.

The output uses root-relative paths for the custom domain, rather than a GitHub project-site subdirectory. `src/.nojekyll` is copied to the output along with `CNAME`. No push, repository Pages setting, DNS change, or live cutover has been performed by this implementation.

External YouTube, Google Maps, Spotify, Sched, newsletter forms, OSF, and other services retain their original URLs and availability dependencies. See the [migration report](docs/migration-report.md) for exact checks and verification limits.
