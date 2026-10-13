# DLF Forum 2022 preservation release

Published release: [preservation-2026-10-13](https://github.com/clirdlf/forum2022.diglib.org/releases/tag/preservation-2026-10-13). Application source commit: `a3edd9503299e23cfa610f1b71e4174e6bf8f094`.

The tag preserves the reviewed application source. The accessibility report, restoration instructions, and verification record are supplemental release assets. The tag does not move the remote main branch or deploy GitHub Pages.

The local package is `releases/forum2022-preservation-2026-10-13.zip` (122,162,119 bytes). Its adjacent `.sha256` file verifies the archive. Within the ZIP, SHA256SUMS records every payload file except itself. Download both files and keep a copy in independent institutional storage.

The ZIP contains 579 tracked source files, 517 generated website files, the unchanged WordPress export, capture manifests, local assets, all 143 program sessions, restoration instructions, provenance, and review evidence. Git internals, credentials, development dependencies, and machine caches are excluded. Package output is ignored by Git so that the large ZIP is distributed through release assets rather than source history.

Verification performed after extraction into a separate temporary directory:

- ZIP integrity and all 1,105 payload checksums verified.
- All 579 extracted source files matched the recorded Git commit.
- Frozen pnpm installation succeeded using the retained package cache.
- All 54 tests passed without failures or skips.
- Build succeeded; all 517 regenerated website files matched the packaged website byte for byte.
- 58 HTML routes passed the configured semantics checks with zero violations.
- Link checks found zero errors and the one documented pre-existing source warning.

The [manual accessibility review](accessibility-review-2026-10-13.md) records unresolved findings and checks not performed. It is not a conformance certification. The original source and PDF remain intact in this release. See the package's RESTORE.md for static hosting and rebuilding; the prebuilt website can be hosted without installing Node or pnpm.
