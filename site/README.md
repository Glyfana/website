# Glyfana Website Deployment

This folder contains a static GitHub Pages site for distributing the latest Glyfana installer.

## Repo Layout

- App repo with releases: `https://github.com/Glyfana/Glyfana`
- Website repo for GitHub Pages: `https://github.com/Glyfana/website`

## How It Works

1. `site/app.js` requests the latest stable release from the GitHub Releases API.
2. The page selects the installer asset with the rules from `site/release-manifest.json`.
3. If the API is unavailable, the page falls back to the pinned release metadata in `site/release-manifest.json`.

## What To Edit

- `site/release-manifest.json`
  - `productRepoUrl`: the repository that publishes installer assets
  - `websiteRepoUrl`: optional explicit repository URL for the site itself
  - `assetMatchers`: filename rules used to detect the installer asset from the latest release
  - `integrity.value`: published SHA256 for the pinned fallback build
  - `fallbackRelease`: pinned metadata used when the live API is unavailable

## Deployment

1. Keep the `site/` folder in the website repo.
2. Copy `.github/workflows/pages.yml` into the website repo.
3. Push to `main`.
4. Enable GitHub Pages with GitHub Actions as the source.

## Automation

- `.github/workflows/update-release-manifest.yml` refreshes `site/release-manifest.json` every 6 hours.
- You can also run the workflow manually and optionally provide a tag such as `v0.1.3`.
- The workflow commits only when the manifest actually changes.
- Any manifest commit triggers the Pages deployment workflow because it updates `site/**`.

## Notes

- The page is static and does not need a backend.
- For low traffic, the live GitHub API request is usually enough.
- If you want stronger guarantees at larger scale, generate `release-manifest.json` from CI on every app release.
