# TBD — open decisions for Talk & Tap Reading

1. **Custom domain talktap.org** — repo config DONE (`base: '/'`, `public/CNAME` →
   `talktap.org`; domain registered at GoDaddy). Remaining (action at GoDaddy +
   GitHub, not code): turn OFF GoDaddy domain forwarding, add the A/AAAA DNS
   records pointing at GitHub Pages, set the custom domain in GitHub, then enforce
   HTTPS. Full step-by-step in `SESSION_NOTES.md` → "Custom domain setup
   (talktap.org)". (We bought `.org`, not `.app`.)
2. ~~**Review wording from the dyslexic-user perspective**~~ — DONE. Reviewed all
   child-facing text; settled on the **Talk / Tap / New** labels (match the app
   name and the child's actions) and kept the sample sentence *Talk. See words.
   Tap to hear.* Follow-up polish made the action buttons larger/softer with a
   more legible disabled state.
3. ~~**Email address for "Send Feedback"**~~ — DONE. Decided to keep
   `mailto:tskillman@immsci.com` (already wired in `App.tsx` and README; no
   branded forwarding address needed for now). Note: GoDaddy's "Email privacy"
   page is WHOIS-contact privacy only, not a public feedback mailbox.
