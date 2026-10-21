# Politic Public — Come prepared.

A complete rebrand and responsive landing page, prepared October 17, 2026. Courier identity and editorial motion finalized October 19, 2026.

## Review

- `index.html`: the redesigned landing page.
- `brand/courier.html`: the final Courier identity, usage guidance, size studies, and asset downloads.
- `brand/strategy.html`: the deep audit, emotional strategy, positioning, copy system, visual guidelines, and research sources.
- `assets/brand/`: final Courier SVG signatures, full and small-size marks, favicon set, social artwork, and design tokens.
- `brand/logo-study.html`: archive of the earlier concepts; the final selected identity is in `brand/courier.html`.
- `brand/motion-study.html`: comparison archive showing how the original montage became the approved editorial sequence.
- `brand/archive/original-motion.html`: archived landing page with the original montage, retained for comparison.
- `assets/fonts/`: locally hosted Barlow Condensed and Public Sans, with their licenses.
- `brand/landing-hero.png`, `brand/landing-desktop.png`, and `brand/landing-mobile.png`: visual previews.

Run `python3 -m http.server 4173 --bind 127.0.0.1` from this directory, then open `http://127.0.0.1:4173/` or `/brand/strategy.html`. No build or package installation is needed. Stop the server with Ctrl-C.

## Courier logo

The final identity follows the founder’s chosen original Courier drawing: three raised tail feathers, three curved wing cuts, wiry feet, and a document carried in the beak. Its deliberate asymmetry expresses an attentive, approachable local correspondent bringing the public record within reach.

- `assets/brand/mark.svg`, `mark-paper.svg`, and `mark-gold.svg`: full Courier in ink, paper, and ochre.
- `assets/brand/logo-ink.svg` and `logo-paper.svg`: Courier with the stacked lowercase wordmark.
- `assets/brand/mark-small.svg`: simplified artwork for uses below 48px high.
- `assets/brand/favicon.svg`, `favicon-16.png`, and `favicon-32.png`: browser icons using the small-size artwork.
- `assets/brand/apple-touch-icon.png`: 180 × 180 touch icon.

The full artwork is vector, with transparent negative spaces. Preserve the uneven silhouette, original proportions, and right-facing orientation. Keep clear space of at least one quarter of the bird’s height. The landing page uses the full signature in its header and footer and the ochre Courier beside the public-purpose statement. Keep the Courier static: personality comes from the drawing, while the meeting record moves with restraint. Signup behavior is unchanged.

## Positioning and evidence

The founder confirmed in this conversation that live meeting capture and briefs are operating. The page reflects that confirmation; older agenda-only specifications are not treated as current product truth. Clark County is the initial geography reflected in the available product context. The access form invites visitors to confirm covered bodies and delivery expectations for their workflow.

The approved animation follows one fictional parking-amendment story: agenda item → amendment → vote → useful brief. It preserves the original animation’s meeting-record vocabulary while replacing its fast cuts, jitter, gold-on-navy treatment, and continuous loop with a slower editorial sequence. The amendment passes; final project approval remains pending. The sequence and sample brief are explicitly illustrative and should eventually be replaced with a real, permissioned, source-linked example.

At the founder’s request on October 20, the page retains the existing “Backed by” logos and links for AWS, nClouds, StartupNV, and the U.S. Small Business Administration. Their existing artwork is preserved in a restrained ink band. Other legacy testimonials, accuracy statistics, turnaround guarantees, and pricing entitlements remain omitted; no new proof points have been invented.

## Deployment integration

The public site inspected on October 17 uses the FastAPI `/api/signup` endpoint. The linked GitHub landing repository still had an older Supabase implementation. This version follows the LIVE contract: `name`, `email`, `company`, `role`, `topics`, `zip`, `website` (honeypot), and `source_url`; success requires `{ "ok": true }`.

A static preview does not collect requests. It reports that signup is unavailable instead of claiming success. Serve this page on the same origin as `/api/signup` in production. Do not add cross-origin signup access without a separate integration decision.

For the existing FastAPI project, generate a ready-to-copy integration bundle:

```sh
python3 scripts/export-fastapi.py /tmp/politic-public-fastapi
```

The command creates `app/templates/index.html`, `app/static/rebrand/`, and `app/static/favicon.svg` in a NEW output directory. It rewrites asset references for FastAPI, copies the asset directory and default favicon, and refuses to overwrite an existing output directory. Review that bundle, then apply it to the intended backend checkout. No backend behavior needs to change. The guide, QA artifacts, and source assets remain here.

The existing PostHog configuration is retained in `assets/analytics.js` and only initializes on `politicpublic.com` or `www.politicpublic.com`; previews do not send analytics. No credentials beyond the existing public analytics identifier are included.

## Verification

- Verified October 20, 2026 after restoring the backing logos: all 44 browser checks passed (22 page regressions and 22 motion checks). The FastAPI integration passes all 75 backend tests, including the signup contract, asset loading, and default Courier favicon. The backing band was also checked at 320, 390, 768, and 1440 pixels.
- The browser regression suite covers 22 checks: no horizontal overflow at 320, 390, 768, 1024, and 1440 pixels; pause/resume; reduced motion; source note; modal open/Escape/focus return; email validation; failed submit retention/retry; expected API payload; success focus/reset; mobile modal; no JavaScript runtime errors. Saved results: `qa/results.json` and `qa/motion-results.json`.
- All signup POSTs were intercepted locally. No production signup or email was submitted. The intentionally mocked HTTP 429 appears as an expected network error in the browser console.
- Browser suites are `qa/browser-checks.js` and `qa/motion-checks.js`; run them with Playwright CLI after opening a named session against the preview server. The motion suite covers one-time completion, Replay, exact pause, offscreen suspension, reduced motion, readable final frames, and archive/redirect links.

Production is served by the FastAPI app in `HeyClos/politicpublic`, not automatically by this repository. Publish the source here, apply the generated integration bundle there, and deploy the backend checkout on the existing VPS. Signup and subscription behavior remain unchanged.

## Rebuilding the Courier assets

The editable vector masters are `brand/source/courier-master.svg` and `brand/source/courier-small-master.svg`. The full mark preserves the founder-selected original sketch (three tail feathers, three wing cuts, outlined document, and wiry feet). The small mark is a separate optical drawing. The approved raster reference is retained in `brand/logo-study/courier-first-sketch.png`; earlier generated alternatives remain an archive, not current production artwork.

`scripts/build-brand.py` reads the two SVG masters and the licensed Barlow Condensed font, and writes path-only marks, outlined signatures, social artwork, and icon masters. It requires Python `fonttools` and `brotli`. `scripts/render-brand.cjs` requires Node `sharp` and exports transparent PNGs, native 16/32/48px icons, an ICO, a 180px touch icon, and the 1200×630 social image.

```sh
python3 scripts/build-brand.py
node scripts/render-brand.cjs
```

Supply those dependencies in your development environment; none are needed to serve the landing page. The generated SVG files contain no embedded raster art, live text, or external font dependency. Font licenses remain in `assets/fonts/`.

The logo update passed all 22 existing browser checks on October 19, 2026. Final logos are applied to the header, footer, public-purpose section, brand guide, favicon, and social image. The subsequent approved motion treatment is described below.

## Approved editorial motion (October 19)

The main `index.html` uses the approved editorial treatment. `motion-preview.html` is a compatibility redirect to the main page, and `?still=1` shows the completed composition immediately. `brand/motion-study.html` retains the comparison with the original montage and a still alternative; the original landing-page treatment is archived at `brand/archive/original-motion.html`.

Three scenes last 4.2 seconds each with 400ms opacity crossfades. After 12.6 seconds, the complete brief stays on screen until Replay is requested. Text and fixed vote totals are readable from each scene’s first frame; secondary detail gains emphasis over its first second. The palette is paper and ink, with muted green and an ochre underline. There is no camera shake, cut flash, counting animation, or continuous loop. The Courier remains static.

The visible control offers Pause, Play, or Replay according to playback state. Animation pauses independently when offscreen or in a hidden tab. Reduced-motion preferences show the completed brief immediately and disable playback; the final frame remains useful without motion. Ordinary interface transitions use 160ms.

Implementation: `assets/record-motion.js` and `assets/record-motion.css`, with the original shared shot layout in `assets/montage.css`. The shared form script defers motion controls to the editorial controller. `assets/montage.js` remains available only for the archived original treatment.
