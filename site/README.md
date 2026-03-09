# Glyfana Website Deployment

This folder is a static homepage template.

## Recommended Repo Split

- App repo (release artifacts): `https://github.com/Glyfana/glyfana`
- Website repo (GitHub Pages): `https://github.com/Glyfana/website`

## Setup Steps

1. In the website repo, create and keep a `site/` folder.
2. Copy this folder contents (`glyfana/site/*`) into `website/site/`.
3. Copy `.github/workflows/pages.yml` from this repo into `website/.github/workflows/pages.yml`.
4. Keep `PRODUCT_REPO_URL` in `app.js` set to:
   - `https://github.com/Glyfana/glyfana`
5. If needed, set `WEBSITE_REPO_URL` in `app.js` for explicit site-repo status display.

## Fast Sync Command

From the `glyfana` repo root:

```powershell
.\scripts\sync-website.ps1 -WebsiteRepoPath ..\website
```

## Why This Matters

When hosted from a dedicated website repo, automatic URL detection points to that site repo.
`PRODUCT_REPO_URL` ensures download and release links still target the app releases in `Glyfana/glyfana`.
