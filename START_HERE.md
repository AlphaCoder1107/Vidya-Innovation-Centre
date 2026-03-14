# VIC Implementation Kickoff

This workspace now contains production starter artifacts for your single-domain rollout.

## What Is Created

- `vic-landing-page/` - Animated GitHub Pages frontend (HTML/CSS/JS)
- `infra/cloudflare/worker.js` - Path-based router (`/app` -> Hi.Events, `/` -> GitHub Pages)
- `infra/cloudflare/wrangler.toml` - Worker config template
- `infra/railway/railway.env.template` - Railway environment variable starter

## Immediate Actions

1. Create a new public GitHub repository for the landing page and push `vic-landing-page/` contents.
2. Enable GitHub Pages from the `main` branch root.
3. Fork Hi.Events and deploy to Railway.
4. Copy `infra/railway/railway.env.template` into Railway Variables and fill real secrets.
5. Deploy Cloudflare Worker using files in `infra/cloudflare/`.
6. Bind your domain route to Worker (example: `events.vidya.edu.in/*`).
7. Test these URLs:
   - `https://events.vidya.edu.in/`
   - `https://events.vidya.edu.in/app`
   - `https://events.vidya.edu.in/app/login`

## Notes

- Keep your Railway auto-generated domain active for emergency fallback.
- For Hi.Events branding beyond env vars, patch your fork and let Railway auto-redeploy.
