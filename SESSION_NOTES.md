# Session notes — Jun 9, 2026

Working notes from a development session on **Talk & Tap Reading**, an
experimental reading-support tool for young/dyslexic readers: the child can
**Talk** (speak), see their words appear, then **Tap** a word to hear it read
back.

## What we changed today

- **Fixed missing button/logo images in Safari.** The icon and logo files were
  JPEG-encoded data saved with a `.png` extension. Chrome sniffs the bytes and
  renders them; Safari trusts the `image/png` content-type, sees JPEG bytes, and
  shows a broken `[?]` placeholder. Re-encoded `icon-listen.png`, `icon-read.png`,
  `icon-new.png`, and `logo.png` as **true PNGs** (same pixels) so they render in
  all browsers. Takeaway: image exporters (incl. some AI tools) sometimes output
  JPEG bytes under a `.png` name — verify with `file` if images break in Safari.
- **Logo sizing.** Now fills the full content width on iPhone (single line, aspect
  ratio preserved) and is taller on desktop (`max-height` 10rem → 13rem).
- **Removed the `?` help button** next to the logo. The bottom
  "For parents and teachers" link is the single entry point to that content.
- **Default font size** lowered from 44 to 30 for testing.
- **iOS speech limitation.** Web Speech recognition only works in Safari on iOS
  (Chrome/other iOS browsers return `service-not-allowed`). The app detects iOS
  non-Safari browsers and offers a **"Use Safari"** button that re-opens the page
  in Safari via the `x-safari-https://` scheme. This works well. Tap and New work
  in any browser.

## Hosting / URL

- Live at **https://tlskillman.github.io/talk-tap-reading/** (GitHub Pages,
  `base: '/talk-tap-reading/'`). Pushing to `main` redeploys.
- Note: `git push` over HTTP/2 was intermittently failing with `RPC failed; HTTP
  400`. Workaround that worked: `git -c http.version=HTTP/1.1 push origin main`.

## Open TBDs (see `TBD.md`)

1. Decide on final URL and hosting setup (currently GitHub Pages subpath).
2. Review every word shown to the child from a **dyslexic-reader perspective**
   (button labels, sample sentence, on-screen text).
3. Confirm the final **"Send feedback"** email (currently
   `mailto:tskillman@immsci.com`).

## Model comparison takeaway (Opus 4.8 vs Composer 2.5)

Hands-on impression from building this app with both models:

- **Opus 4.8** produces clearly better work and inspires more confidence — but the
  edge is modest, roughly **~20% better**.
- **Opus is ~an order of magnitude (10×) more expensive.** Verified Jun 2026
  standard pricing: Composer 2.5 $0.50/M in, $2.50/M out vs. Opus 4.8 $5/M in,
  $25/M out — exactly 10× on both. Per-task estimates (~$0.50–$1 vs ~$7–$11)
  agree. Caveat: comparing *Fast* tiers narrows the gap to ~3×.
- The real tradeoff is **your time vs. the AI cost**: Opus when correctness/trust
  matter, Composer 2.5 for routine work.

(A cross-workspace copy of this takeaway also lives in the user-level Cursor rule
`~/.cursor/rules/model-cost-tradeoff.mdc`.)

## The why

Built in the hope that it reaches kids who struggle to read — including the
author's grandson, Luke.
