# DLF Forum 2022 archive

An Eleventy 3.1.6 static archive of [forum2022.diglib.org](https://forum2022.diglib.org/), prepared for GitHub Pages at the same custom domain. It includes the reachable public pages, all 11 blog posts, news pagination, linked author/date archives, and original redirect aliases. The accessibility widget and WordPress backend dependencies have been removed.

## Build and preview

Use Node.js 24 (the CI version, specified in `.nvmrc`) or newer, npm, and a normal repository checkout. If you use nvm, run `nvm install` and `nvm use` first.

```sh
npm ci
npm test
npm run build
npm run check
npm start
```

The preview serves at http://localhost:8082/. Production files are generated in `_site/`. Stop preview with Ctrl+C. Builds do not fetch anything from WordPress; all required content, fonts, theme styles, images, video, and downloads are retained locally. A dependency install needs npm registry access unless packages are cached.

`npm run check` validates generated routes, links, fragments, image variants, CSS/font dependencies, and unwanted WordPress endpoints. It exits unsuccessfully on new errors. One already-dead source link is explicitly recorded as a warning in the [migration report](docs/migration-report.md).

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

For a one-off content correction, edit the relevant body HTML or record. Template and interaction changes belong under `src/`. Imported HTML is rendered as data, rather than executed as Nunjucks template source.

## Refresh the archive

The import needs the original public WordPress site to remain available and requires `curl` on PATH. Requests are anonymous and do not use browser cookies or WordPress credentials.

```sh
# Resume/reuse validated local captures and download missing files:
npm run import

# Explicitly discard only raw page/asset caches and recapture the public site:
npm run import -- --refresh

# Inspect reachability without replacing the build's saved manifests:
npm run import -- --inventory-only

npm test
npm run build
npm run check
```

Import follows links recursively from the public homepage, including news pagination and archive listings. Drafts, private pages, statistics, admin/API URLs, and unlinked test pages are excluded. Cache directories live under ignored `.cache/` and are not needed to build or host the archive. Validated captures survive interrupted imports. Required page/asset failures abort the import; the existing build manifests are retained until fetching and normalization succeed. An unknown public link that already returns 404 is recorded as a source issue.

A successful full import overwrites `data/archive/pages.json`, `data/archive/manifest.json`, page bodies, captured vendor assets, and imported shared header/footer partials. Save manual edits before refreshing. `--refresh` reuses the supplied XML, so obtain a newer export separately if you intend to change the content source.

## GitHub Pages

The tracked [workflow](.github/workflows/pages.yml) installs locked dependencies, runs tests, builds and checks `_site`, then publishes that artifact on pushes to `main`. Pull requests run the checks without deploying. It follows [GitHub's custom Pages workflow](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

To deploy after reviewing and integrating the implementation branch:

1. Push the completed source to GitHub.
2. Under repository **Settings → Pages**, select **GitHub Actions** as the build/deployment source.
3. Set the custom domain to `forum2022.diglib.org`. `_site/CNAME` contains that same domain.
4. Configure and verify DNS using [GitHub's custom-domain guidance](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site), then enable HTTPS when GitHub makes it available.
5. Verify the domain and representative deep links before retiring WordPress.

The output uses root-relative paths for the custom domain, rather than a GitHub project-site subdirectory. `src/.nojekyll` is copied to the output along with `CNAME`. No push, repository Pages setting, DNS change, or live cutover has been performed by this implementation.

External YouTube, Google Maps, Spotify, Sched, newsletter forms, OSF, and other services retain their original URLs and availability dependencies. See the [migration report](docs/migration-report.md) for exact checks and verification limits.
