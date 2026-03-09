const MANIFEST_URL = './release-manifest.json';

const DEFAULT_MANIFEST = {
  productRepoUrl: 'https://github.com/Glyfana/Glyfana',
  websiteRepoUrl: '',
  notesBranch: 'main',
  assetMatchers: [
    { type: 'regex', value: '^glyfana[-._].*setup\\.exe$' },
    { type: 'regex', value: 'setup\\.(exe|msi)$' },
    { type: 'regex', value: 'installer' },
    { type: 'regex', value: '\\.(exe|msi)$' },
  ],
  integrity: {
    algorithm: 'SHA256',
    value: '1268C18B59B58CB5B19CEBE8F4D4D3761D0AA3931B1D0B09373CB9C6A5961EB1',
  },
  fallbackRelease: {
    version: 'v0.1.4',
    title: 'v0.1.4',
    publishedAt: '2026-03-09T14:42:46Z',
    setupFileName: 'Glyfana-0.1.4.Setup.exe',
    sizeBytes: 114885632,
    downloadUrl: 'https://github.com/Glyfana/Glyfana/releases/download/v0.1.4/Glyfana-0.1.4.Setup.exe',
    releaseUrl: 'https://github.com/Glyfana/Glyfana/releases/tag/v0.1.4',
    notesUrl: 'https://github.com/Glyfana/Glyfana/releases/tag/v0.1.4',
    assets: [
      {
        name: 'glyfana-0.1.4-full.nupkg',
        sizeBytes: 114292139,
        downloadUrl: 'https://github.com/Glyfana/Glyfana/releases/download/v0.1.4/glyfana-0.1.4-full.nupkg',
        isPrimary: false,
      },
      {
        name: 'Glyfana-0.1.4.Setup.exe',
        sizeBytes: 114885632,
        downloadUrl: 'https://github.com/Glyfana/Glyfana/releases/download/v0.1.4/Glyfana-0.1.4.Setup.exe',
        isPrimary: true,
      },
      {
        name: 'RELEASES',
        sizeBytes: 78,
        downloadUrl: 'https://github.com/Glyfana/Glyfana/releases/download/v0.1.4/RELEASES',
        isPrimary: false,
      },
    ],
  },
};

function normalizeRepoUrl(value) {
  return String(value || '').trim().replace(/\/+$/, '').replace(/\.git$/, '');
}

function getRepoInfoFromPagesUrl() {
  const host = window.location.hostname;
  if (!host.endsWith('github.io')) return null;

  const owner = host.split('.')[0];
  const parts = window.location.pathname.split('/').filter(Boolean);
  const repo = parts[0];

  if (!owner || !repo) return null;
  return { owner, repo };
}

function getRepoUrlFromPagesUrl() {
  const info = getRepoInfoFromPagesUrl();
  if (!info) return '';
  return `https://github.com/${info.owner}/${info.repo}`;
}

function getRepoInfoFromGitHubUrl(repoUrl) {
  const match = normalizeRepoUrl(repoUrl).match(/^https?:\/\/github\.com\/([^/]+)\/([^/]+)$/i);
  if (!match) return null;
  return { owner: match[1], repo: match[2] };
}

function mergeManifest(base, override) {
  return {
    ...base,
    ...override,
    assetMatchers:
      Array.isArray(override?.assetMatchers) && override.assetMatchers.length > 0
        ? override.assetMatchers
        : base.assetMatchers,
    integrity: {
      ...base.integrity,
      ...(override?.integrity || {}),
    },
    fallbackRelease: {
      ...base.fallbackRelease,
      ...(override?.fallbackRelease || {}),
      assets:
        Array.isArray(override?.fallbackRelease?.assets) && override.fallbackRelease.assets.length > 0
          ? override.fallbackRelease.assets
          : base.fallbackRelease.assets,
    },
  };
}

async function loadManifest() {
  try {
    const response = await fetch(MANIFEST_URL, {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });

    if (!response.ok) throw new Error(`Manifest request failed: ${response.status}`);
    const data = await response.json();
    return mergeManifest(DEFAULT_MANIFEST, data);
  } catch {
    return DEFAULT_MANIFEST;
  }
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function setLink(selector, href) {
  const links = document.querySelectorAll(selector);
  links.forEach((el) => {
    if (!(el instanceof HTMLAnchorElement)) return;

    if (!href) {
      el.href = '#';
      el.classList.add('is-disabled');
      return;
    }

    el.href = href;
    el.classList.remove('is-disabled');
  });
}

function formatDate(value) {
  if (!value) return 'Pinned metadata';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unknown';

  return new Intl.DateTimeFormat('en', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

function formatBytes(value) {
  if (!Number.isFinite(value) || value <= 0) return 'Pending';

  const units = ['B', 'KB', 'MB', 'GB'];
  let size = value;
  let index = 0;

  while (size >= 1024 && index < units.length - 1) {
    size /= 1024;
    index += 1;
  }

  const digits = index === 0 ? 0 : 1;
  return `${size.toFixed(digits)} ${units[index]}`;
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
    const matchedAsset = assets.find((asset) => matchesAsset(asset.name, matcher));
    if (matchedAsset) return matchedAsset;
  }

  return assets.find((asset) => /\.(exe|msi)$/i.test(asset.name || '')) || assets[0];
}

function buildReleaseApiUrl(repoUrl) {
  const info = getRepoInfoFromGitHubUrl(repoUrl);
  if (!info) return '';
  return `https://api.github.com/repos/${info.owner}/${info.repo}/releases/latest`;
}

function buildTagsApiUrl(repoUrl) {
  const info = getRepoInfoFromGitHubUrl(repoUrl);
  if (!info) return '';
  return `https://api.github.com/repos/${info.owner}/${info.repo}/tags?per_page=20`;
}

function getVersionNumber(version) {
  return String(version || '').trim().replace(/^v/i, '');
}

function buildNotesUrl(productRepo, version, notesBranch) {
  const normalizedVersion = getVersionNumber(version);
  if (!productRepo || !normalizedVersion) return '';
  const branch = String(notesBranch || 'main').trim() || 'main';
  return `${productRepo}/blob/${branch}/RELEASE_NOTES_${normalizedVersion}.md`;
}

function getIntegrityValue(asset) {
  const digest = typeof asset?.digest === 'string' ? asset.digest : '';
  if (digest.toLowerCase().startsWith('sha256:')) {
    return digest.slice('sha256:'.length).toUpperCase();
  }

  return '';
}

function buildVerifyCommand(fileName) {
  const safeName = String(fileName || 'installer.exe').replace(/"/g, '');
  return `Get-FileHash ".\\${safeName}" -Algorithm SHA256`;
}

function renderAssetList(assets) {
  const list = document.getElementById('asset-list');
  if (!list) return;

  list.textContent = '';

  if (!Array.isArray(assets) || assets.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'asset-list__empty';
    empty.textContent = 'No release assets were published for the current release.';
    list.append(empty);
    return;
  }

  assets.forEach((asset) => {
    const item = document.createElement('li');
    item.className = 'asset-list__item';

    const nameWrap = document.createElement('div');
    nameWrap.className = 'asset-list__name';

    const link = document.createElement('a');
    link.className = 'asset-list__link';
    link.href = asset.downloadUrl || asset.releaseUrl || '#';
    link.target = '_blank';
    link.rel = 'noreferrer';
    link.textContent = asset.name || 'Unnamed asset';
    nameWrap.append(link);

    if (asset.isPrimary) {
      const badge = document.createElement('span');
      badge.className = 'asset-badge';
      badge.textContent = 'Installer';
      nameWrap.append(badge);
    }

    const meta = document.createElement('span');
    meta.className = 'asset-list__meta';
    meta.textContent = formatBytes(asset.sizeBytes);

    item.append(nameWrap, meta);
    list.append(item);
  });
}

function setReleaseStatus(state, message) {
  const panel = document.querySelector('.release-panel');
  if (panel instanceof HTMLElement) panel.dataset.state = state;
  setText('release-status', message);
}

function updateRepoStatus(productRepo, websiteRepo, sourceLabel) {
  const statusEl = document.getElementById('repo-status');
  if (!statusEl) return;

  const labels = [`Release repo: ${productRepo || 'not configured'}`];
  if (websiteRepo && websiteRepo !== productRepo) labels.push(`Site repo: ${websiteRepo}`);
  labels.push(`Data: ${sourceLabel}`);
  statusEl.textContent = labels.join(' | ');
}

function setCommonLinks(productRepo) {
  setLink('.js-repo', productRepo);
  setLink('.js-releases', productRepo ? `${productRepo}/releases` : '');
}

function applyReleaseModel(model, options) {
  const integrityAlgorithm = options?.integrityAlgorithm || 'SHA256';
  const hasIntegrity = Boolean(model.integrityValue);
  const integrityValue = hasIntegrity ? model.integrityValue : `${integrityAlgorithm} unavailable`;
  const installerName = model.setupFileName || 'No public installer published';

  setText('release-title', model.title || 'Latest stable build');
  setText('release-version', model.version || 'Latest');
  setText('release-date', formatDate(model.publishedAt));
  setText('release-size', formatBytes(model.sizeBytes));
  setText('installer-name', installerName);
  setText('release-sha', integrityValue);
  setText('release-sha-inline', integrityValue);
  setText('verify-command', buildVerifyCommand(model.setupFileName || 'installer.exe'));

  setLink('.js-download', model.downloadUrl || '');
  setLink('.js-release', model.releaseUrl || '');
  setLink('.js-notes', model.notesUrl || model.releaseUrl || '');
  renderAssetList(model.assets || []);
}

function fallbackReleaseToModel(manifest, productRepo) {
  const fallback = manifest.fallbackRelease || {};
  const releaseUrl = fallback.releaseUrl || `${productRepo}/tags`;
  const downloadUrl = fallback.downloadUrl || '';
  const notesUrl =
    fallback.notesUrl || buildNotesUrl(productRepo, fallback.version, manifest.notesBranch) || releaseUrl;
  const setupFileName = fallback.setupFileName || '';
  const sizeBytes = Number.isFinite(fallback.sizeBytes) ? fallback.sizeBytes : null;
  const assets = Array.isArray(fallback.assets)
    ? fallback.assets.map((asset) => ({
        name: asset.name || setupFileName || 'Installer',
        sizeBytes: Number.isFinite(asset.sizeBytes) ? asset.sizeBytes : null,
        downloadUrl: asset.downloadUrl || downloadUrl,
        releaseUrl,
        isPrimary: (asset.name || '') === setupFileName,
      }))
    : [];

  return {
    title: fallback.title || 'Current stable build',
    version: fallback.version || 'Pinned release',
    publishedAt: fallback.publishedAt || '',
    setupFileName,
    sizeBytes,
    downloadUrl,
    releaseUrl,
    notesUrl,
    integrityValue: String(manifest.integrity?.value || '').trim(),
    assets,
  };
}

async function loadLatestTaggedModel(manifest, productRepo) {
  const tagsApiUrl = buildTagsApiUrl(productRepo);
  if (!tagsApiUrl) throw new Error('GitHub repo is not configured.');

  const response = await fetch(tagsApiUrl, {
    headers: { Accept: 'application/vnd.github+json' },
    cache: 'no-store',
  });

  if (!response.ok) throw new Error(`GitHub tag request failed: ${response.status}`);

  const tags = await response.json();
  const latestTag = Array.isArray(tags) ? tags[0] : null;
  if (!latestTag?.name) throw new Error('No tags found.');

  const releaseUrl = `${productRepo}/tree/${encodeURIComponent(latestTag.name)}`;
  const notesUrl = buildNotesUrl(productRepo, latestTag.name, manifest.notesBranch) || `${productRepo}/tags`;

  return {
    title: 'Current tagged build',
    version: latestTag.name,
    publishedAt: '',
    setupFileName: '',
    sizeBytes: null,
    downloadUrl: '',
    releaseUrl,
    notesUrl,
    integrityValue: '',
    assets: [],
  };
}

async function loadLatestReleaseModel(manifest, productRepo) {
  const apiUrl = buildReleaseApiUrl(productRepo);
  if (!apiUrl) throw new Error('GitHub repo is not configured.');

  const response = await fetch(apiUrl, {
    headers: { Accept: 'application/vnd.github+json' },
    cache: 'no-store',
  });

  if (response.status === 404) {
    return loadLatestTaggedModel(manifest, productRepo);
  }

  if (!response.ok) throw new Error(`GitHub API request failed: ${response.status}`);

  const release = await response.json();
  const assets = Array.isArray(release.assets) ? release.assets : [];
  const installerAsset = pickInstallerAsset(assets, manifest.assetMatchers);
  const mappedAssets = assets.map((asset) => ({
    name: asset.name || 'Unnamed asset',
    sizeBytes: Number.isFinite(asset.size) ? asset.size : null,
    downloadUrl: asset.browser_download_url || release.html_url || '',
    releaseUrl: release.html_url || '',
    isPrimary: Boolean(installerAsset && asset.id === installerAsset.id),
  }));

  return {
    title: release.name || 'Latest stable build',
    version: release.tag_name || release.name || 'Latest',
    publishedAt: release.published_at || release.created_at || '',
    setupFileName: installerAsset?.name || manifest.fallbackRelease?.setupFileName || '',
    sizeBytes: Number.isFinite(installerAsset?.size) ? installerAsset.size : null,
    downloadUrl: installerAsset?.browser_download_url || release.html_url || `${productRepo}/releases/latest`,
    releaseUrl: release.html_url || `${productRepo}/releases/latest`,
    notesUrl: release.html_url || `${productRepo}/releases/latest`,
    integrityValue: getIntegrityValue(installerAsset),
    assets: mappedAssets,
  };
}

function wireRevealAnimations() {
  const targets = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, io) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      });
    },
    { threshold: 0.2 },
  );

  targets.forEach((el) => observer.observe(el));
}

function setYear() {
  setText('year', String(new Date().getFullYear()));
}

async function init() {
  const manifest = await loadManifest();
  const productRepo = normalizeRepoUrl(manifest.productRepoUrl) || getRepoUrlFromPagesUrl();
  const websiteRepo = normalizeRepoUrl(manifest.websiteRepoUrl) || getRepoUrlFromPagesUrl();

  if (!productRepo) {
    setReleaseStatus('fallback', 'Configure productRepoUrl in release-manifest.json');
    setCommonLinks('');
    updateRepoStatus('', websiteRepo, 'configuration required');
    applyReleaseModel(fallbackReleaseToModel(manifest, ''), {
      integrityAlgorithm: manifest.integrity?.algorithm,
    });
    return;
  }

  setCommonLinks(productRepo);
  applyReleaseModel(fallbackReleaseToModel(manifest, productRepo), {
    integrityAlgorithm: manifest.integrity?.algorithm,
  });
  setReleaseStatus('loading', 'Loading latest release...');
  updateRepoStatus(productRepo, websiteRepo, 'fallback metadata');

  try {
    const liveModel = await loadLatestReleaseModel(manifest, productRepo);
    applyReleaseModel(liveModel, {
      integrityAlgorithm: manifest.integrity?.algorithm,
    });
    if (liveModel.downloadUrl) {
      setReleaseStatus('live', 'Latest release loaded from GitHub');
      updateRepoStatus(productRepo, websiteRepo, 'live GitHub release');
    } else {
      setReleaseStatus('fallback', 'No public installer published yet');
      updateRepoStatus(productRepo, websiteRepo, 'latest Git tag');
    }
  } catch {
    setReleaseStatus('fallback', 'Using pinned release metadata');
    updateRepoStatus(productRepo, websiteRepo, 'fallback metadata');
  }
}

setYear();
wireRevealAnimations();
init();
