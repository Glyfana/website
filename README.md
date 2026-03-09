# Glyfana Website

Static GitHub Pages site for distributing the latest `Glyfana` Windows installer.

## Structure

- `site/`: published static site
- `.github/workflows/pages.yml`: GitHub Pages deployment
- `.github/workflows/update-release-manifest.yml`: pinned release metadata sync
- `scripts/update-release-manifest.mjs`: GitHub release to manifest sync script

## Usage

1. Edit the UI in `site/`.
2. Keep `site/release-manifest.json` committed as the fallback release source.
3. Let the sync workflow refresh the pinned release metadata.
4. GitHub Pages deploys the `site/` directory on push.
