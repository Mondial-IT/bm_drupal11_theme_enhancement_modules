Yes.

Below is a **set of prompts** you can give to an agent (or chain of agents) to generate an **optimized, minimal CSS** for a given markup/page set, using a safe workflow (extract → union → validate → refactor). These prompts assume you can provide the agent:

* A list of URLs (≤20 pages) or HTML snapshots
* Access to browser tooling (Chrome DevTools or headless browser)
* The site’s CSS files (or ability to download them)

---

## Prompt 1 — Role + Success Criteria (system / initial)

Use this as the first prompt to set expectations.

```text
You are a web performance engineer specializing in Drupal 11 theming and CSS payload reduction.

Goal:
Create an optimized CSS output for a Drupal site by removing unused CSS safely, without breaking layout across all page types.

Constraints:
- Do not “guess” unused CSS. Only remove CSS when validated across the full page set.
- Preserve responsive behavior (media queries).
- Preserve pseudo-class behavior (:hover, :focus, :active), forms, menus, and interactive components.
- Preserve print styles and accessibility-related styles where applicable.
- Output must be reproducible: include a clear mapping from removed CSS back to source files and reasons.

Deliverables:
1) A combined “used selectors” report per page and across all pages (union).
2) A candidate optimized CSS bundle (critical + non-critical split).
3) A list of source libraries/files that should be attached conditionally in Drupal instead of globally.
4) A regression checklist describing what pages/components to verify manually.

Stop conditions:
If cross-origin CSS cannot be read, note it and proceed using alternative methods (Coverage or downloaded CSS).
```

---

## Prompt 2 — Input Discovery + Page Typing

```text
Given the following site URLs (≤20), categorize them into page templates / component types:
- Homepage / landing pages
- Node detail pages (article, page)
- Listing pages (views)
- Forms (login, contact)
- Any special templates (campaign, product, etc.)

For each category, list:
- unique CSS requirements expected
- critical above-the-fold elements (header, hero, nav)
- potential risk components (sliders, menus, modals, cookie banner)

Output a short plan for how you will ensure coverage of all CSS states.
```

---

## Prompt 3 — Extract Used CSS (Coverage-first strategy)

```text
For each page URL, use Chrome DevTools Coverage (or equivalent headless coverage tooling) to collect:
- CSS file name / URL
- percent used
- unused byte estimate
- ranges of used CSS (start/end offsets if available)

Export results per page and a combined summary.

Important:
- Run once at desktop viewport (e.g., 1440x900) and once at mobile viewport (e.g., 390x844).
- Interact with the page before final capture:
  - open menu
  - scroll to bottom
  - open accordions/tabs
  - trigger hover/focus states where applicable
  - open cookie banner preferences dialog
Document the interactions performed per page.
```

---

## Prompt 4 — Extract Matched Selectors (DOM-rule matching strategy)

This complements Coverage (useful when bundling obscures rule ranges).

```text
For each page, collect CSS rules whose selectors match at least one element on the page.
Use a script that iterates stylesheets and:
- includes STYLE_RULE selectors
- includes MEDIA_RULE selectors only when matchMedia(mediaText) is true
- records selectorText -> matchCount

Also record stylesheets that are unreadable due to CORS.

Output:
- JSON per page: { url, viewport, usedSelectors[] }
- A combined union set of selectors across all pages, separated by viewport (desktop/mobile)
```

---

## Prompt 5 — Handle Dynamic States (hover/focus/open dialogs)

```text
Some CSS is only used during interactions (hover, focus, expanded menus, modal open, sticky header).
For each page category, create a short interaction script or manual steps to trigger:
- :hover and :focus styles on links/buttons
- open/close navigation
- open/close modals (including Klaro dialog)
- accordion expansion
- slider navigation (if present)
- form validation state
Re-run coverage/selector extraction after interactions.

Output:
- list of triggered states
- updated union selector set
```

---

## Prompt 6 — Build Optimized CSS (safe compilation rules)

```text
Using the union selector set, generate an optimized CSS bundle.

Rules:
- Do not reconstruct CSS from computed styles.
- Preserve original declarations from source CSS, including:
  - media queries
  - keyframes
  - font-face
  - supports rules
- Remove only rules that have zero matches across:
  - all pages
  - both viewports
  - and after interaction steps

Also produce:
1) critical.css containing only the rules needed for above-the-fold rendering on homepage + node detail.
2) main.css containing remaining used rules.

Output a diff report:
- removed selectors list per source file
- bytes saved per file
- potential risk notes for each removal category
```

---

## Prompt 7 — Drupal 11 Refactor Plan (libraries.yml + conditional attachment)

```text
Based on the used CSS results, propose a Drupal 11 approach to reduce global CSS loading:

1) Identify theme/module libraries that are currently attached globally but only needed on specific pages/components.
2) Create a proposed libraries.yml split:
   - global_base (header, footer, typography)
   - homepage
   - node_article
   - views_listing
   - forms
   - slider (if used)
   - vimeo_embed (if used)
3) Recommend attachment points:
   - twig templates
   - preprocess hooks
   - block/paragraph plugin attachment
4) Ensure cacheability metadata is not broken.

Deliver:
- Proposed libraries.yml structure
- Attachment mapping table (library -> where -> why)
```

---

## Prompt 8 — Regression Verification (visual + functional)

```text
Create a regression checklist to validate the optimized CSS.

Include:
- all page URLs
- both viewports
- key interactions (menus, modals, accordions, forms)
- accessibility checks (focus outlines, skip links)
- print view (if relevant)

Also define rollback strategy:
- keep original CSS bundle available
- feature flag via library switch
- monitor error reports after deployment
```

---

## Prompt 9 — Final Deliverable Packaging

```text
Produce a final output package:

1) /reports/
   - coverage-desktop.csv
   - coverage-mobile.csv
   - used-selectors-desktop.json
   - used-selectors-mobile.json
   - union-selectors.txt
2) /css/
   - critical.css
   - main.css
3) /drupal/
   - proposed-libraries.yml
   - attachment-plan.md
4) summary.md:
   - total CSS bytes before/after
   - LCP/FCP expected improvements
   - risks and mitigations
   - next steps for further reduction (JS and images)
```

---

## Optional Prompt 10 — Headless Automation (Puppeteer)

If your agent can run Node/Puppeteer:

```text
Automate the extraction for all URLs using Puppeteer:
- Load each page
- Set viewport (desktop/mobile)
- Perform scripted interactions
- Collect:
  - CSS coverage (page.coverage.startCSSCoverage)
  - all responses for CSS URLs
- Export per-page coverage JSON and a combined report

Provide the script and instructions to run it locally or in CI.
```

---

If you paste your **list of ~20 URLs** (or page types), I can tailor these prompts to your exact site structure (homepage + blog listing + blog detail + product pages etc.), and align the interaction script to your components (e.g., slider, Klaro modal, Vimeo embeds).
