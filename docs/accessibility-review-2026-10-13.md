# DLF Forum 2022 accessibility review

Review date: October 13, 2026. Application source: `a3edd9503299e23cfa610f1b71e4174e6bf8f094`. Reviewed locally in Chrome on macOS using the isolated Eleventy server on port 8083. This is a representative browser and document review, not a WCAG conformance certification. The preservation release retains the reviewed source; findings below are not represented as fixed.

## Scope and method

Rendered pages reviewed: homepage, About, FAQ, Local Guide, local events program, Sponsors, News, and Social and Wellness Activities. Keyboard actions used Enter, Space, Tab, Escape, and arrow keys. Browser DOM and accessibility-tree observations were used to inspect names, roles, focus destinations, and expanded/selected states. Screenshots were inspected for narrow-screen readability and visible focus.

Home, About, FAQ, Local Guide, Program, Sponsors, and News were checked at 640 and 320 CSS-pixel viewport widths. These test reflow at widths equivalent to a 1280-pixel viewport at 200% and 400% zoom. They are not an actual browser-zoom or text-only-resizing test. The approach follows [W3C's reflow guidance](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html). The [W3C preliminary review guidance](https://www.w3.org/WAI/test-evaluate/preliminary/) informs the scope; automated passing results do not establish comprehensive accessibility.

The retained sponsorship PDF was inspected with Poppler: all pages' text was extracted, metadata was examined, and its cover was rendered and visually reviewed. This does not verify every page's reading order or contrast. The local MP4's streams and duration were examined with ffprobe. Third-party frames were not given permissions and no external forms were submitted.

## Results

| Check | Observed result |
| --- | --- |
| Skip link | Enter moves focus to `#content` and updates the fragment. |
| Desktop navigation | Enter opens About; Escape from its News link closes the menu and restores focus to the About submenu button. The focused button has a visible 2-pixel blue outline. |
| Mobile navigation | Open button, close button, submenu expansion, and Escape are operable. Escape restores focus to the external Navigation Menu button. Focus containment has the failure described below. |
| Mobile footer | Enter opens Connect; Tab reaches the first link, which has tabindex 0. |
| Search | Keyboard submission of Fedora produces four results, including the local program session; the results page has a labeled form, an H1, and a result-count status. |
| Local Guide | Mobile Ice Cream disclosure opens with Enter and reveals its panel. Desktop ArrowRight from Coffee selects and focuses Tea and reveals its panel. |
| Accordion | Social and Wellness Activities' Monday control opens with Space and closes with Enter; expanded state and the named content region update. |
| Program | Native session disclosure opens with Enter, exposing date/time, room, speaker, and description. |
| Slideshow | Homepage pause control changes to Play slideshow when activated. Next slide operates by keyboard and reveals the next named image. |
| Reflow | All 14 route/width combinations have no detected horizontal overflow; inspected homepage/program screenshots remain readable at 320 pixels. |
| Titles and headings | The seven reflow pages have distinct descriptive titles and one H1 each. Heading hierarchy has source-derived gaps described below. |
| Automated checks | 54 tests pass. Build succeeds. All 58 generated HTML routes have zero configured axe semantics violations and zero link errors; one previously documented dead source link remains. |

## Findings to address

### A11Y-01: focus can move behind the mobile menu overlay

Priority: high. At 320 pixels, open Navigation Menu. Focus the mobile Fellowships submenu button and press Tab with its submenu closed. Focus moves to the first News article link in the underlying main content while the full-screen menu overlay remains open. In the observed state, that link's rectangle was offscreen and its focus indication was not visible. The Escape behavior works, but the overlay does not contain sequential keyboard focus.

Recommendation: while the sidebar covers the page, keep background content out of the keyboard sequence and cycle focus within the visible menu controls. Restore background interactivity and the opener's focus when closing. Test forward and reverse Tab, submenu expansion, and Escape at mobile widths.

### A11Y-02: one homepage image has filename alternative text

Priority: medium. The image preceding Read the latest is exposed as `JAN_6997-scaled.jpg`. That name does not communicate the photo's content or purpose.

Recommendation: inspect the photo and supply a meaningful alternative, or an empty alternative if it is purely decorative alongside the adjacent heading and link. Do not invent a person's identity.

### A11Y-03: sponsorship PDF lacks accessibility tags

Priority: medium. `src/assets/vendor/01806fee504a-CLIR-2022-Sponsorship-Pack.pdf` has 41 pages and reports `Tagged: no`. Text can be extracted, but headings, reading order, and image alternatives are not established by that fact. The cover is a designed slide with text and an event image.

Recommendation: preserve the original unchanged and provide an accessible HTML transcription or separately remediated PDF, with reading order and meaningful alternatives checked by a person using a screen reader.

### A11Y-04: heading structure needs editorial review

Priority: low. Shared footer section headings use H5 after page H2/H3 content. News item titles use H3 immediately after its H1, and FAQ questions are bold paragraphs rather than navigable headings.

Recommendation: choose heading levels by document hierarchy while preserving styling. Make FAQ questions headings if they introduce separate answers. Verify the resulting heading list with assistive technology.

## Remaining manual checks

- VoiceOver/NVDA speech, rotor navigation, reading order, and live-region announcements were not tested. Browser accessibility-tree inspection is not a substitute for operating a screen reader.
- Actual browser zoom at 200% and 400%, text-only resizing, high-contrast/forced-colors mode, and text-spacing overrides were not tested.
- The browser currently reported reduced-motion preference as false. Slideshow pause was tested, but changing the system/browser preference and confirming motion suppression was not performed.
- The retained MP4 is five seconds long and contains one H.264 video stream with no audio or subtitle stream. Captions for speech are therefore not applicable to this file; adequacy of an equivalent text description of its visual content was not established.
- External YouTube, Spotify, Maps, Sched, newsletter forms, and remotely linked documents were not assessed for conformance. Their providers and content can change independently.
- Full PDF tagging, reading order, page-by-page contrast, and screen-reader use remain to be reviewed.

## Evidence

Screenshots: `docs/qa/review-home-320.jpg`, `review-program-320.jpg`, `review-guide-focus.jpg`, and `review-menu-focus.jpg`. Numeric reflow observations are included in the preservation package's `review/reflow-results.json`. Earlier contrast repairs and their measurements are recorded in `docs/migration-report.md`; this review did not repeat a complete contrast audit.

## Follow-up: image description and headings

The current checkout resolves A11Y-02 and the specific heading issues in A11Y-04. After inspecting the homepage photo, its filename-based image name was replaced with “Two people smiling and shaking hands at a DLF Forum exhibit table.” No identities were inferred. Shared footer sections now use H2, both News pagination routes use H2 for post titles beneath their H1, and all eight FAQ questions use H2 followed by their original answer paragraphs. These scoped build-time repairs survive fresh source imports and are idempotent.

Browser accessibility-tree inspection confirms the new image name and heading levels. Computed desktop footer typography remains 29px/29px and News title typography remains 30px/42px. FAQ questions preserve their original bold text styling; at 320 CSS pixels all eight headings and answers remain available without horizontal overflow. Screenshots: `docs/qa/faq-heading-repair-desktop.jpg` and `docs/qa/faq-heading-repair-mobile.jpg`.

Five additional regression tests cover the actual retained source, content/link preservation, both News routes, and repeat application. The suite passes 59 tests; the 58-route link and configured accessibility semantics checks still report zero errors/violations. Independent code review found no issues in this change. VoiceOver speech remains unverified. A11Y-01 (mobile overlay focus containment) and A11Y-03 (PDF accessibility) remain open. The published preservation release remains the historical snapshot reviewed above; these follow-up fixes have not been added to its assets or tag.
