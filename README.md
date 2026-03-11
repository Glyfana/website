# Glyfana Website

Static GitHub Pages site for the official Glyfana download experience. It distributes the latest Windows installer, shows release trust signals from GitHub, and explains what the packaged editor can do before users click download.

## What Glyfana Does

The product copy on this site is based on the main app repository and the packaged release notes.

- Typora-style WYSIWYG Markdown editing powered by Milkdown and ProseMirror
- Source mode toggle with CodeMirror 6 for direct Markdown edits
- Image drag-and-drop and paste support
- Relative image asset storage in a sibling `<note>.assets/` folder
- Safe local image rendering through custom `mdlocal://` handling
- Shiki-based code block highlighting
- Idle autosave for saved files and draft autosave for untitled notes
- Crash recovery and draft restore
- Unsaved changes guard and external file conflict handling
- GitHub Release-based automatic update flow for packaged builds

## What This Website Adds

- A stable download entry point for the latest Windows `Setup.exe`
- Latest release notes summary parsed from the GitHub release body
- Published asset inventory and SHA256 verification guidance on the same page
- English and Korean variants with locale-aware routing
- Mobile navigation and responsive layout tuned for the installer flow
- Open Graph images, sitemap, and robots metadata for sharing and indexing
- A pinned fallback manifest so the page still works when the live GitHub API is unavailable

## Page Sections

- `Hero`: latest installer CTA, release link, and repository link
- `Showcase`: visual editor mockup that shows the intended writing flow
- `What's New`: summarized release highlights extracted from the latest release body
- `Features`: detailed product capabilities such as editing, image handling, autosave, conflict handling, updates, and verification
- `Install`: short download, verification, and update flow
- `Verify`: SHA256, PowerShell verification command, and full published asset list

## Release Data Flow

1. `site/app.js` requests the latest stable release from the GitHub Releases API.
2. Asset selection rules in `site/release-manifest.json` identify the installer file.
3. The release body is summarized into the `What's New` section.
4. If the GitHub API is unavailable, the page falls back to the pinned metadata in `site/release-manifest.json`.
5. `.github/workflows/update-release-manifest.yml` refreshes the pinned metadata every hour and commits only when the manifest changes.

## Repository Structure

- `site/`: published static site payload
- `site/ko/`: Korean variant
- `site/assets/`: emblems, social cards, and static imagery
- `site/app.js`: release fetch, localization, release summary, and mobile nav behavior
- `site/release-manifest.json`: pinned fallback release metadata and asset matching rules
- `scripts/update-release-manifest.mjs`: syncs the latest release into the fallback manifest
- `scripts/render-emblem-png.ps1`: renders the emblem PNG from the SVG source
- `scripts/render-social-card.ps1`: generates localized Open Graph cards
- `.github/workflows/pages.yml`: GitHub Pages deployment workflow
- `.github/workflows/update-release-manifest.yml`: hourly manifest sync workflow

## Updating Content

1. Edit `site/index.html` and `site/ko/index.html` for user-facing copy.
2. Edit `site/styles.css` for layout or presentation changes.
3. Update `site/release-manifest.json` only when you need to pin or override release metadata.
4. Keep feature descriptions aligned with the app repository when editor capabilities change.

## Deployment

1. Push to `main`.
2. GitHub Pages deploys the `site/` directory through `.github/workflows/pages.yml`.
3. GitHub Pages must be enabled with `GitHub Actions` as the publishing source.
