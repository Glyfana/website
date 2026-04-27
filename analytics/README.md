# Self-Hosted Website Analytics

This folder contains a minimal first-party analytics path for the static Glyfana website.

## What It Tracks

- One `page_view` event per page load
- Link interactions already emitted by `site/app.js`
  - download clicks
  - release notes clicks
  - repository clicks
  - locale switches
  - FAQ toggles

## Privacy Defaults

- No cookies
- No localStorage identifiers
- No full IP storage
- No raw user-agent storage

The sample worker stores only coarse request context such as browser family, OS family, and country code.

## Cloudflare Setup

1. Create a D1 database.
2. Apply [cloudflare/schema.sql](./cloudflare/schema.sql).
3. Copy [cloudflare/wrangler.jsonc](./cloudflare/wrangler.jsonc) and replace the placeholder database ID.
4. Deploy the worker with Wrangler.
5. Set the `ANALYTICS_ENDPOINT` repository variable in the `website` repo to your worker URL, for example:
   - `https://glyfana-analytics.example.workers.dev/collect`
6. Push to `main` or rerun the Pages workflow.

If `ANALYTICS_ENDPOINT` is empty, the static site keeps working and simply skips first-party event delivery.

## Stored Fields

- `site`
- `event_name`
- `path`
- `page_href`
- `target_href`
- `label`
- `lang`
- `referrer_host`
- `build_id`
- `browser_family`
- `os_family`
- `country`
- `created_at`
