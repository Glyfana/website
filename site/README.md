# Glyfana Website Deployment

This folder contains the static GitHub Pages payload for `https://glyfana.github.io/website/`. The page distributes the latest Glyfana installer and also documents the packaged editor's behavior in enough detail that users can understand the product before installing it.

## Repo Layout

- App repo with releases: `https://github.com/Glyfana/Glyfana`
- Website repo for GitHub Pages: `https://github.com/Glyfana/website`

## User-Facing Sections

- `Hero`: current Windows installer CTA, release link, source link, and live release metadata
- `Showcase`: visual mockup by default, or a real screenshot gallery when `screenshots-manifest.json` has items
- `What's New`: structured summary extracted from the latest release notes
- `Features`: detailed product capabilities including editing flow, image handling, autosave, conflict handling, updates, and verification
- `Install`: simple download -> verify -> install path
- `FAQ`: answers for image storage, autosave, conflict resolution, updates, and installer verification
- `Verify`: published checksum, PowerShell hash command, and release asset inventory

## Product Capabilities Surfaced On The Page

- Typora-style WYSIWYG Markdown editing
- CodeMirror source mode for raw Markdown
- Image drag-and-drop and paste support
- Relative asset storage in `<note>.assets/`
- Safe local image rendering with `mdlocal://`
- Code block highlighting
- Idle autosave for saved notes and draft autosave for untitled notes
- Crash recovery and draft restore
- Unsaved changes warnings and external file conflict handling
- GitHub Release-based in-app update flow

## Runtime Behavior

1. `locale-router.js` selects the English or Korean variant on first visit and remembers explicit user choice.
2. `app.js` requests the latest stable release from the GitHub Releases API.
3. The page selects the installer asset with the rules from `release-manifest.json`.
4. The release body is summarized into the `What's New` card.
5. The verify section renders the SHA256 value, PowerShell command, and asset list for the current release.
6. Clicks on CTA, asset, locale, nav, and FAQ interactions emit analytics hooks for `plausible`, `umami`, `gtag`, and a custom `glyfana:analytics` event when those providers exist.
7. If the API is unavailable, the page falls back to the pinned release metadata in `release-manifest.json`.

## What To Edit

- `index.html`
  - English landing page copy and static fallback links
- `ko/index.html`
  - Korean landing page copy and static fallback links
- `styles.css`
  - layout, motion, responsive behavior, and component styling
- `app.js`
  - live release fetch, localization strings, release summary parsing, mobile menu behavior, and screenshot gallery rendering
- `release-manifest.json`
  - `productRepoUrl`: repository that publishes installer assets
  - `websiteRepoUrl`: optional explicit repository URL for the site itself
  - `assetMatchers`: filename rules used to detect the installer asset from the latest release
  - `integrity.value`: published SHA256 for the pinned fallback build
  - `fallbackRelease`: pinned metadata used when the live API is unavailable
- `screenshots-manifest.json`
  - `items[]`: ordered showcase screenshots
  - `src`: relative path to the image, usually under `assets/screenshots/`
  - `title.en` / `title.ko`: short card title for each screenshot
  - `caption.en` / `caption.ko`: short explanatory copy under the image
  - `alt.en` / `alt.ko`: accessible image description
  - `featured`: optional flag to let a capture span the full gallery width
  - `href`: optional link target if a screenshot card should open a larger source image

## Deployment

1. Keep the `site/` folder in the website repo root.
2. Keep `.github/workflows/pages.yml` in the repository.
3. Push to `main`.
4. GitHub Pages must be enabled with `GitHub Actions` as the publishing source.

## Automation

- `.github/workflows/update-release-manifest.yml` refreshes `release-manifest.json` every hour.
- The same workflow can be run manually with `workflow_dispatch`.
- The workflow commits only when the manifest actually changes.
- Any manifest commit triggers the Pages deployment workflow because it updates `site/**`.

## Notes

- The site is fully static and does not need a backend.
- For normal traffic, the live GitHub API request is usually sufficient.
- The pinned manifest exists so downloads and verification details do not disappear when the live API is unavailable.
- The screenshot manifest is intentionally separate from the release manifest so product imagery can be updated without touching release metadata.
- If `screenshots-manifest.json` is empty, the showcase stays on the built-in mockup.
- Keep the feature copy aligned with the main app repository when editor capabilities or update behavior change.
