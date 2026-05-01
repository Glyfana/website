import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const repoRoot = process.cwd();
const manifestPath = path.join(repoRoot, 'site', 'release-manifest.json');
const releaseTag = String(process.env.RELEASE_TAG || '').trim();
const productRepoOverride = String(process.env.PRODUCT_REPO_URL || '').trim();
const integrityOverride = String(process.env.INTEGRITY_VALUE || '').trim();
const dryRun = process.argv.includes('--dry-run');

function normalizeRepoUrl(value) {
  return String(value || '').trim().replace(/\/+$/, '').replace(/\.git$/, '');
}

function parseGitHubRepo(repoUrl) {
  const match = normalizeRepoUrl(repoUrl).match(/^https?:\/\/github\.com\/([^/]+)\/([^/]+)$/i);
  if (!match) {
    throw new Error(`Unsupported GitHub repository URL: ${repoUrl}`);
  }

  return { owner: match[1], repo: match[2] };
}

function normalizeVersion(value) {
  return String(value || '').trim().replace(/^refs\/tags\//, '');
}

function getVersionNumber(value) {
  return normalizeVersion(value).replace(/^v/i, '');
}

function buildNotesUrl(productRepoUrl, version, notesBranch = 'main') {
  const normalizedVersion = getVersionNumber(version);
  if (!productRepoUrl || !normalizedVersion) return '';
  return `${productRepoUrl}/blob/${notesBranch}/RELEASE_NOTES_${normalizedVersion}.md`;
}

function matchesAsset(assetName, matcher) {
  const name = String(assetName || '');
  const value = String(matcher?.value || '');

  if (!name || !value) return false;

  if (matcher.type === 'exact') {
    return name.toLowerCase() === value.toLowerCase();
  }

  if (matcher.type === 'regex') {
    try {
      return new RegExp(value, 'i').test(name);
    } catch {
      return false;
    }
  }

  return false;
}

function pickInstallerAsset(assets, matchers) {
  if (!Array.isArray(assets) || assets.length === 0) return null;

  for (const matcher of matchers || []) {
    const matched = assets.find((asset) => matchesAsset(asset.name, matcher));
    if (matched) return matched;
  }

  return assets.find((asset) => /\.(exe|msi)$/i.test(asset.name || '')) || assets[0];
}

function getSha256(asset) {
  const digest = typeof asset?.digest === 'string' ? asset.digest : '';
  if (!digest.toLowerCase().startsWith('sha256:')) return '';
  return digest.slice('sha256:'.length).toUpperCase();
}

function normalizeAssetName(value) {
  return String(value || '').trim().toLowerCase();
}

function buildKnownIntegrityMap(manifest) {
  const known = new Map();
  const fallbackAssets = manifest?.fallbackRelease?.assets;
  if (!Array.isArray(fallbackAssets)) return known;

  for (const asset of fallbackAssets) {
    const name = normalizeAssetName(asset?.name);
    const integrityValue = String(asset?.integrityValue || '').trim().toUpperCase();
    if (name && integrityValue) known.set(name, integrityValue);
  }

  return known;
}

function mapAssets(assets, installerAsset, releaseUrl, currentManifest) {
  const knownIntegrityByName = buildKnownIntegrityMap(currentManifest);

  return (Array.isArray(assets) ? assets : []).map((asset) => {
    const name = asset.name || 'Unnamed asset';
    const integrityValue = getSha256(asset) || knownIntegrityByName.get(normalizeAssetName(name)) || '';
    const mapped = {
      name,
      sizeBytes: Number.isFinite(asset.size) ? asset.size : null,
      downloadUrl: asset.browser_download_url || releaseUrl,
      isPrimary: Boolean(installerAsset && installerAsset.id === asset.id),
    };

    if (integrityValue) mapped.integrityValue = integrityValue;
    return mapped;
  });
}

async function loadManifest() {
  const raw = await readFile(manifestPath, 'utf8');
  return JSON.parse(raw);
}

async function fetchRelease(productRepoUrl) {
  const { owner, repo } = parseGitHubRepo(productRepoUrl);
  const headers = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'glyfana-website-sync',
  };

  const token = String(process.env.GITHUB_TOKEN || process.env.GH_TOKEN || '').trim();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const releaseEndpoint = releaseTag
    ? `https://api.github.com/repos/${owner}/${repo}/releases/tags/${encodeURIComponent(releaseTag)}`
    : `https://api.github.com/repos/${owner}/${repo}/releases/latest`;

  const releaseResponse = await fetch(releaseEndpoint, { headers });
  if (releaseResponse.ok) {
    const release = await releaseResponse.json();
    return { kind: 'release', data: release };
  }

  if (releaseResponse.status !== 404) {
    const body = await releaseResponse.text();
    throw new Error(`GitHub API ${releaseResponse.status}: ${body.slice(0, 200)}`);
  }

  const tagsEndpoint = `https://api.github.com/repos/${owner}/${repo}/tags?per_page=20`;
  const tagsResponse = await fetch(tagsEndpoint, { headers });
  if (!tagsResponse.ok) {
    const body = await tagsResponse.text();
    throw new Error(`GitHub tags API ${tagsResponse.status}: ${body.slice(0, 200)}`);
  }

  const tags = await tagsResponse.json();
  const normalizedRequestedTag = normalizeVersion(releaseTag);
  const tag = normalizedRequestedTag
    ? tags.find((item) => normalizeVersion(item?.name) === normalizedRequestedTag)
    : tags[0];

  if (!tag?.name) {
    throw new Error('No release or tag is available for this repository.');
  }

  return { kind: 'tag', data: tag };
}

function buildNextManifest(currentManifest, payload, productRepoUrl) {
  const notesBranch = String(currentManifest.notesBranch || 'main').trim() || 'main';

  if (payload.kind === 'tag') {
    const tag = payload.data;
    const version = normalizeVersion(tag.name);

    return {
      ...currentManifest,
      productRepoUrl,
      integrity: {
        algorithm: 'SHA256',
        value:
          version === normalizeVersion(currentManifest?.fallbackRelease?.version || '')
            ? String(currentManifest?.integrity?.value || '').trim()
            : '',
      },
      fallbackRelease: {
        version,
        title: 'Current tagged build',
        publishedAt: '',
        setupFileName: '',
        sizeBytes: null,
        downloadUrl: '',
        releaseUrl: `${productRepoUrl}/tree/${encodeURIComponent(version)}`,
        notesUrl: buildNotesUrl(productRepoUrl, version, notesBranch) || `${productRepoUrl}/tags`,
        assets: [],
      },
    };
  }

  const release = payload.data;
  const assets = Array.isArray(release.assets) ? release.assets : [];
  const installerAsset = pickInstallerAsset(assets, currentManifest.assetMatchers);
  const releaseVersion = normalizeVersion(release.tag_name || release.name || '');
  const currentVersion = normalizeVersion(currentManifest?.fallbackRelease?.version || '');
  const releaseUrl = release.html_url || `${productRepoUrl}/releases/latest`;

  let integrityValue = integrityOverride || getSha256(installerAsset);
  if (!integrityValue && releaseVersion && releaseVersion === currentVersion) {
    integrityValue = String(currentManifest?.integrity?.value || '').trim();
  }

  return {
    ...currentManifest,
    productRepoUrl,
    integrity: {
      algorithm: 'SHA256',
      value: integrityValue,
    },
    fallbackRelease: {
      version: releaseVersion || currentManifest?.fallbackRelease?.version || '',
      title: release.name || 'Current stable build',
      publishedAt: release.published_at || release.created_at || '',
      setupFileName: installerAsset?.name || '',
      sizeBytes: Number.isFinite(installerAsset?.size) ? installerAsset.size : null,
      downloadUrl: installerAsset?.browser_download_url || releaseUrl,
      releaseUrl,
      notesUrl: releaseUrl,
      assets: mapAssets(assets, installerAsset, releaseUrl, currentManifest),
    },
  };
}

async function main() {
  const manifest = await loadManifest();
  const productRepoUrl = normalizeRepoUrl(productRepoOverride || manifest.productRepoUrl);
  if (!productRepoUrl) {
    throw new Error('productRepoUrl is missing from release-manifest.json');
  }

  const payload = await fetchRelease(productRepoUrl);
  const nextManifest = buildNextManifest(manifest, payload, productRepoUrl);
  const nextJson = `${JSON.stringify(nextManifest, null, 2)}\n`;

  if (dryRun) {
    process.stdout.write(nextJson);
    return;
  }

  await writeFile(manifestPath, nextJson, 'utf8');

  const installerName = nextManifest.fallbackRelease?.setupFileName || 'none';
  const version = nextManifest.fallbackRelease?.version || 'unknown';
  console.log(`Updated release manifest to ${version} (${installerName})`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
