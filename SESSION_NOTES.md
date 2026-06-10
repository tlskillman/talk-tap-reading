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

- Domain **talktap.org** registered at **GoDaddy** (NOT talktap.app — `.org` is
  what we actually own). GoDaddy is the registrar only; **GitHub Pages is the
  host** (`base: '/'`, `public/CNAME` → `talktap.org`). Pushing to `main` redeploys.
- Repo: `github.com/tlskillman/talk-tap-reading`. Until DNS points at GitHub, the
  site is reachable at the Pages default URL
  `https://tlskillman.github.io/talk-tap-reading/` (only a fallback for sanity
  checks; `base: '/'` means it's the apex domain that's the real home).
- **Initial GoDaddy state (to undo):** GoDaddy's purchase flow set up *domain
  forwarding* — `http://talktap.org` did a `301` to the github.io subpath, and
  `https://talktap.org` was broken (forwarding has no valid cert). That's a
  redirect, not real hosting, and breaks the mic (Web Speech API needs HTTPS).
  Forwarding also locks the parking `A` records (`15.197.142.173`,
  `3.33.152.147`) as "Can't delete" until forwarding is turned off.
- Note: `git push` over HTTP/2 was intermittently failing with `RPC failed; HTTP
  400`. Workaround that worked: `git -c http.version=HTTP/1.1 push origin main`.

## Custom domain setup (talktap.org)

Repo side is done (`base: '/'`, `public/CNAME` → `talktap.org`). Remaining work is
at GoDaddy (DNS) and in GitHub Pages settings.

1. **Turn OFF GoDaddy Domain Forwarding** (Domain Settings → Forwarding → remove).
   This unlocks/removes the parking `A` records pointing at GoDaddy's servers.
2. **Add DNS records** for the apex (`@`) in GoDaddy DNS:

   ```text
   A     @   185.199.108.153
   A     @   185.199.109.153
   A     @   185.199.110.153
   A     @   185.199.111.153
   AAAA  @   2606:50c0:8000::153
   AAAA  @   2606:50c0:8001::153
   AAAA  @   2606:50c0:8002::153
   AAAA  @   2606:50c0:8003::153
   ```

   Keep the `CNAME www → talktap.org` (www → apex is fine). Do **not** leave any
   other `A`/`AAAA` records on `@`, or GitHub may fail to issue the cert.
3. **Set the custom domain** in repo **Settings → Pages → Custom domain** =
   `talktap.org` (the `CNAME` file also sets this on deploy); **Save** to run the
   DNS check.
4. **Enable Enforce HTTPS** once the Pages check mark appears (GitHub provisions a
   Let's Encrypt cert automatically; usually <30 min, up to 24–48h). Unlike `.app`,
   `.org` does not force HTTPS, so `http://` keeps working during provisioning —
   but we still enforce HTTPS (required for the microphone / Web Speech API).
5. **(Recommended) Verify domain ownership** via **Settings → Pages → Verify**
   (adds a `TXT` record `_github-pages-challenge-tlskillman`) to prevent takeover.

DNS targets verified against GitHub docs, Jun 2026.

## Open TBDs (see `TBD.md`)

1. Custom domain **talktap.org** — repo config done; switch GoDaddy from
   forwarding to GitHub Pages DNS, then enforce HTTPS (see "Custom domain setup").
2. DONE — child-facing wording reviewed: **Talk / Tap / New** labels kept, sample
   sentence *Talk. See words. Tap to hear.* kept; action buttons enlarged/softened.
3. DONE — **"Send feedback"** email confirmed as `mailto:tskillman@immsci.com`
   (kept the personal address; no branded forwarding needed for now).

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
