document.documentElement.classList.add('js-enhanced');

const BUILD_ID =
  document.querySelector('meta[name="build-id"]')?.getAttribute('content')?.trim() || 'dev';
const PAGE_LANG = document.documentElement.lang?.toLowerCase().startsWith('ko') ? 'ko' : 'en';
const MANIFEST_PATH =
  document.querySelector('meta[name="manifest-path"]')?.getAttribute('content')?.trim() ||
  './release-manifest.json';
const SCREENSHOT_MANIFEST_PATH =
  document.querySelector('meta[name="screenshots-path"]')?.getAttribute('content')?.trim() ||
  './screenshots-manifest.json';
const manifestUrl = new URL(MANIFEST_PATH, window.location.href);
manifestUrl.searchParams.set('v', BUILD_ID);
const MANIFEST_URL = manifestUrl.toString();
const screenshotManifestUrl = new URL(SCREENSHOT_MANIFEST_PATH, window.location.href);
screenshotManifestUrl.searchParams.set('v', BUILD_ID);
const SCREENSHOT_MANIFEST_URL = screenshotManifestUrl.toString();

const STRINGS = {
  en: {
    pinnedMetadata: 'Pinned metadata',
    unknown: 'Unknown',
    pending: 'Pending',
    noReleaseAssets: 'No release assets were published for the current release.',
    installerBadge: 'Installer',
    releaseRepoLabel: 'Release repo',
    siteRepoLabel: 'Site repo',
    dataLabel: 'Data',
    notConfigured: 'not configured',
    latestStableBuild: 'Latest stable build',
    currentStableBuild: 'Current stable build',
    currentTaggedBuild: 'Current tagged build',
    pinnedRelease: 'Pinned release',
    latest: 'Latest',
    noPublicInstallerPublished: 'No public installer published',
    loadingLatestRelease: 'Loading latest release...',
    latestReleaseLoaded: 'Latest release loaded from GitHub',
    usingPinnedMetadata: 'Using pinned release metadata',
    configureProductRepo: 'Configure productRepoUrl in release-manifest.json',
    configurationRequired: 'configuration required',
    fallbackMetadata: 'fallback metadata',
    liveGitHubRelease: 'live GitHub release',
    latestGitTag: 'latest Git tag',
    unnamedAsset: 'Unnamed asset',
    installerDefault: 'Installer',
    algorithmUnavailable: (algorithm) => `${algorithm} unavailable`,
    noReleaseHighlights: 'No release highlights were published for the current build.',
    openLink: 'Open link',
    defaultHighlights: [
      'Direct Windows installer download from the latest stable release.',
      'Release notes, asset inventory, and checksum stay linked in one flow.',
      'Users can verify the published SHA256 value before install.',
    ],
  },
  ko: {
    pinnedMetadata: '고정 메타데이터',
    unknown: '알 수 없음',
    pending: '대기 중',
    noReleaseAssets: '현재 공개된 릴리스 자산이 없습니다.',
    installerBadge: '설치 파일',
    releaseRepoLabel: '릴리스 저장소',
    siteRepoLabel: '사이트 저장소',
    dataLabel: '데이터',
    notConfigured: '설정 없음',
    latestStableBuild: '최신 안정 빌드',
    currentStableBuild: '현재 안정 빌드',
    currentTaggedBuild: '현재 태그 빌드',
    pinnedRelease: '고정 릴리스',
    latest: '최신',
    noPublicInstallerPublished: '공개 설치 파일이 없습니다',
    loadingLatestRelease: '최신 릴리스를 불러오는 중...',
    latestReleaseLoaded: 'GitHub에서 최신 릴리스를 불러왔습니다',
    usingPinnedMetadata: '고정 릴리스 메타데이터를 사용 중입니다',
    configureProductRepo: 'release-manifest.json에 productRepoUrl을 설정하세요',
    configurationRequired: '설정 필요',
    fallbackMetadata: '고정 메타데이터',
    liveGitHubRelease: '실시간 GitHub 릴리스',
    latestGitTag: '최신 Git 태그',
    unnamedAsset: '이름 없는 자산',
    installerDefault: '설치 파일',
    algorithmUnavailable: (algorithm) => `${algorithm} 값 없음`,
    noReleaseHighlights: '현재 빌드에 공개된 릴리스 하이라이트가 없습니다.',
    openLink: '링크 열기',
    defaultHighlights: [
      '최신 안정 릴리스의 Windows 설치 파일을 바로 내려받을 수 있습니다.',
      '릴리스 노트, 자산 목록, 체크섬을 한 흐름 안에서 같이 확인할 수 있습니다.',
      '설치 전에 공개된 SHA256 값으로 무결성을 검증할 수 있습니다.',
    ],
  },
};

function t(key, ...args) {
  const entry = STRINGS[PAGE_LANG]?.[key] ?? STRINGS.en[key];
  return typeof entry === 'function' ? entry(...args) : entry;
}

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
    value: '953765934C5DD589E6567369293679097CBFE4940A432B83841793E29D275514',
  },
  fallbackRelease: {
    version: 'v0.1.7',
    title: 'v0.1.7',
    publishedAt: '2026-03-20T14:04:38Z',
    setupFileName: 'Glyfana-0.1.7.Setup.exe',
    sizeBytes: 84350156,
    downloadUrl: 'https://github.com/Glyfana/Glyfana/releases/download/v0.1.7/Glyfana-0.1.7.Setup.exe',
    releaseUrl: 'https://github.com/Glyfana/Glyfana/releases/tag/v0.1.7',
    notesUrl: 'https://github.com/Glyfana/Glyfana/releases/tag/v0.1.7',
    assets: [
      {
        name: 'Glyfana-0.1.7.Setup.exe',
        sizeBytes: 84350156,
        downloadUrl: 'https://github.com/Glyfana/Glyfana/releases/download/v0.1.7/Glyfana-0.1.7.Setup.exe',
        isPrimary: true,
      },
      {
        name: 'Glyfana-0.1.7.Setup.exe.blockmap',
        sizeBytes: 88721,
        downloadUrl: 'https://github.com/Glyfana/Glyfana/releases/download/v0.1.7/Glyfana-0.1.7.Setup.exe.blockmap',
        isPrimary: false,
      },
      {
        name: 'latest.yml',
        sizeBytes: 342,
        downloadUrl: 'https://github.com/Glyfana/Glyfana/releases/download/v0.1.7/latest.yml',
        isPrimary: false,
      },
    ],
  },
};

const DEFAULT_SCREENSHOT_MANIFEST = {
  items: [],
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

function localizeManifestValue(value, fallback = '') {
  if (typeof value === 'string') return value.trim();
  if (!value || typeof value !== 'object') return fallback;

  return String(value[PAGE_LANG] || value.en || fallback || '').trim();
}

function normalizeScreenshotEntry(item) {
  if (!item || typeof item !== 'object') return null;

  const src = String(item.src || '').trim();
  if (!src) return null;

  return {
    src,
    href: String(item.href || '').trim(),
    title: localizeManifestValue(item.title),
    caption: localizeManifestValue(item.caption),
    alt: localizeManifestValue(item.alt, localizeManifestValue(item.title, 'Glyfana screenshot')),
    featured: Boolean(item.featured),
  };
}

async function loadScreenshotManifest() {
  try {
    const response = await fetch(SCREENSHOT_MANIFEST_URL, {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });

    if (!response.ok) throw new Error(`Screenshot manifest request failed: ${response.status}`);
    const data = await response.json();
    const items = Array.isArray(data?.items) ? data.items.map(normalizeScreenshotEntry).filter(Boolean) : [];
    return { items };
  } catch {
    return DEFAULT_SCREENSHOT_MANIFEST;
  }
}

function resolveShowcaseAssetUrl(path) {
  try {
    return new URL(String(path || '').trim(), window.location.href).toString();
  } catch {
    return '';
  }
}

function canLoadImage(src) {
  return new Promise((resolve) => {
    if (!src) {
      resolve(false);
      return;
    }

    const image = new Image();
    image.onload = () => resolve(true);
    image.onerror = () => resolve(false);
    image.src = src;
  });
}

async function resolveRenderableScreenshots(items) {
  const candidates = Array.isArray(items) ? items.filter(Boolean) : [];
  const resolved = await Promise.all(
    candidates.map(async (item) => {
      const resolvedSrc = resolveShowcaseAssetUrl(item.src);
      const resolvedHref = item.href ? resolveShowcaseAssetUrl(item.href) : '';
      const ok = await canLoadImage(resolvedSrc);
      if (!ok) return null;

      return {
        ...item,
        src: resolvedSrc,
        href: resolvedHref,
      };
    }),
  );

  return resolved.filter(Boolean);
}

function renderShowcaseGallery(items) {
  const section = document.querySelector('.showcase');
  const gallery = document.getElementById('showcase-gallery');
  const mockup = section?.querySelector('.workspace-demo');

  if (!(section instanceof HTMLElement) || !(gallery instanceof HTMLElement)) return;

  gallery.textContent = '';
  const normalizedItems = Array.isArray(items) ? items.filter(Boolean) : [];

  if (normalizedItems.length === 0) {
    section.classList.remove('is-gallery-live');
    gallery.hidden = true;
    if (mockup instanceof HTMLElement) mockup.hidden = false;
    return;
  }

  normalizedItems.forEach((item, index) => {
    const card = document.createElement(item.href ? 'a' : 'article');
    card.className = 'showcase-gallery__card';
    if (item.featured || index === 0) card.classList.add('is-featured');

    if (card instanceof HTMLAnchorElement) {
      card.href = item.href;
      card.target = '_blank';
      card.rel = 'noreferrer';
      card.dataset.label = item.title || `screenshot_${index + 1}`;
    }

    const media = document.createElement('div');
    media.className = 'showcase-gallery__media';

    const image = document.createElement('img');
    image.src = item.src;
    image.alt = item.alt;
    image.loading = 'lazy';
    image.decoding = 'async';
    media.append(image);

    const body = document.createElement('div');
    body.className = 'showcase-gallery__copy';

    if (item.title) {
      const title = document.createElement('p');
      title.className = 'showcase-gallery__title';
      title.textContent = item.title;
      body.append(title);
    }

    if (item.caption) {
      const caption = document.createElement('p');
      caption.className = 'showcase-gallery__desc';
      caption.textContent = item.caption;
      body.append(caption);
    }

    card.append(media, body);
    gallery.append(card);
  });

  section.classList.add('is-gallery-live');
  gallery.hidden = false;
  if (mockup instanceof HTMLElement) mockup.hidden = true;
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
  if (!value) return t('pinnedMetadata');
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return t('unknown');

  return new Intl.DateTimeFormat(PAGE_LANG === 'ko' ? 'ko-KR' : 'en-US', {
    year: 'numeric',
    month: PAGE_LANG === 'ko' ? 'long' : 'short',
    day: 'numeric',
  }).format(date);
}

function formatBytes(value) {
  if (!Number.isFinite(value) || value <= 0) return t('pending');

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
    empty.textContent = t('noReleaseAssets');
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
    link.textContent = asset.name || t('unnamedAsset');
    nameWrap.append(link);

    if (asset.isPrimary) {
      const badge = document.createElement('span');
      badge.className = 'asset-badge';
      badge.textContent = t('installerBadge');
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

  const labels = [`${t('releaseRepoLabel')}: ${productRepo || t('notConfigured')}`];
  if (websiteRepo && websiteRepo !== productRepo) labels.push(`${t('siteRepoLabel')}: ${websiteRepo}`);
  labels.push(`${t('dataLabel')}: ${sourceLabel}`);
  statusEl.textContent = labels.join(' | ');
}

function stripMarkdownLine(line) {
  return String(line || '')
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^[-*+]\s+/, '')
    .replace(/^\d+\.\s+/, '')
    .replace(/^#{1,6}\s+/, '')
    .replace(/[>*_~]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function resolveReleaseLink(href, productRepo, releaseUrl) {
  const value = String(href || '').trim();
  if (!value) return '';
  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith('/')) return `https://github.com${value}`;
  if (value.startsWith('#')) return `${releaseUrl || ''}${value}`;

  try {
    return new URL(value, `${normalizeRepoUrl(productRepo)}/`).toString();
  } catch {
    return '';
  }
}

function parseMarkdownLink(line, productRepo, releaseUrl) {
  const match = String(line || '').match(/\[([^\]]+)\]\(([^)]+)\)/);
  if (!match) return null;

  const href = resolveReleaseLink(match[2], productRepo, releaseUrl);
  if (!href) return null;

  return {
    label: stripMarkdownLine(match[1]),
    href,
  };
}

function parseBareUrlLink(line, productRepo, releaseUrl) {
  const source = String(line || '').trim();
  const match = source.match(/(https?:\/\/[^\s)]+)/i);
  if (!match) return null;

  const href = resolveReleaseLink(match[1], productRepo, releaseUrl);
  if (!href) return null;

  const before = stripMarkdownLine(source.slice(0, match.index)).replace(/[:\-\s]+$/, '').trim();
  const after = stripMarkdownLine(source.slice((match.index || 0) + match[1].length)).replace(/^[:\-\s]+/, '').trim();

  return {
    label: '',
    href,
    text: before || after || stripMarkdownLine(match[1]),
  };
}

function normalizeSummaryEntry(item) {
  if (typeof item === 'string') {
    return {
      label: '',
      text: item,
      checked: null,
      href: '',
      linkLabel: '',
    };
  }

  if (!item || typeof item !== 'object') return null;

  return {
    label: String(item.label || '').trim(),
    text: String(item.text || '').trim(),
    checked: typeof item.checked === 'boolean' ? item.checked : null,
    href: String(item.href || '').trim(),
    linkLabel: String(item.linkLabel || '').trim(),
  };
}

function extractSummaryItems(markdownBody, productRepo, releaseUrl) {
  const rawLines = String(markdownBody || '')
    .split(/\r?\n/)
    .map((line) => line.trim());

  const summary = [];
  let currentLabel = '';
  let inCodeBlock = false;

  for (const rawLine of rawLines) {
    if (!rawLine) continue;

    if (/^```/.test(rawLine)) {
      inCodeBlock = !inCodeBlock;
      continue;
    }

    if (inCodeBlock || /^---+$/.test(rawLine)) continue;

    const headingMatch = rawLine.match(/^#{1,6}\s+(.+)$/);
    if (headingMatch) {
      currentLabel = stripMarkdownLine(headingMatch[1]);
      continue;
    }

    const checklistMatch = rawLine.match(/^[-*+]\s+\[([ xX])\]\s+(.+)$/);
    const listMatch = rawLine.match(/^(?:[-*+]\s+|\d+\.\s+)(.+)$/);
    const contentSource = checklistMatch?.[2] || listMatch?.[1] || rawLine;
    const link = parseMarkdownLink(contentSource, productRepo, releaseUrl) || parseBareUrlLink(contentSource, productRepo, releaseUrl);
    const cleaned = link?.text || stripMarkdownLine(contentSource);

    if (!cleaned || (cleaned.length < 16 && !link?.href)) continue;
    if (/^(what'?s changed|highlights?|release notes?)$/i.test(cleaned)) continue;

    const entry = {
      label: currentLabel,
      text: cleaned,
      checked: checklistMatch ? /x/i.test(checklistMatch[1]) : null,
      href: link?.href || '',
      linkLabel: link?.label || '',
    };

    if (!summary.some((item) => item.label === entry.label && item.text === entry.text)) {
      summary.push(entry);
    }

    if (summary.length === 4) break;
  }

  return summary;
}

function renderReleaseSummary(items) {
  const list = document.getElementById('release-summary-list');
  if (!list) return;

  list.textContent = '';
  const normalizedItems = Array.isArray(items) ? items.map(normalizeSummaryEntry).filter(Boolean) : [];

  if (normalizedItems.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'release-summary__empty';
    empty.textContent = t('noReleaseHighlights');
    list.append(empty);
    return;
  }

  normalizedItems.forEach((item) => {
    const entry = document.createElement('li');
    entry.className = 'release-summary__item';

    if (item.checked === true) entry.classList.add('is-checked');
    if (item.checked === false) entry.classList.add('is-unchecked');

    const body = document.createElement('div');
    body.className = 'release-summary__item-main';

    if (item.label) {
      const tag = document.createElement('span');
      tag.className = 'release-summary__tag';
      tag.textContent = item.label;
      body.append(tag);
    }

    const text = document.createElement('p');
    text.className = 'release-summary__text';
    text.textContent = item.text;
    body.append(text);

    entry.append(body);

    if (item.href) {
      const action = document.createElement('a');
      action.className = 'release-summary__action';
      action.href = item.href;
      action.target = '_blank';
      action.rel = 'noreferrer';
      action.textContent = item.linkLabel || t('openLink');
      entry.append(action);
    }

    list.append(entry);
  });
}

function setCommonLinks(productRepo) {
  setLink('.js-repo', productRepo);
  setLink('.js-releases', productRepo ? `${productRepo}/releases` : '');
}

function applyReleaseModel(model, options) {
  const integrityAlgorithm = options?.integrityAlgorithm || 'SHA256';
  const hasIntegrity = Boolean(model.integrityValue);
  const integrityValue = hasIntegrity ? model.integrityValue : t('algorithmUnavailable', integrityAlgorithm);
  const installerName = model.setupFileName || t('noPublicInstallerPublished');

  setText('release-title', model.title || t('latestStableBuild'));
  setText('release-version', model.version || t('latest'));
  setText('release-date', formatDate(model.publishedAt));
  setText('release-size', formatBytes(model.sizeBytes));
  setText('installer-name', installerName);
  setText('release-sha', integrityValue);
  setText('release-sha-inline', integrityValue);
  setText('verify-command', buildVerifyCommand(model.setupFileName || 'installer.exe'));
  renderReleaseSummary(
    Array.isArray(model.summaryItems) && model.summaryItems.length > 0
      ? model.summaryItems
      : t('defaultHighlights'),
  );

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
        name: asset.name || setupFileName || t('installerDefault'),
        sizeBytes: Number.isFinite(asset.sizeBytes) ? asset.sizeBytes : null,
        downloadUrl: asset.downloadUrl || downloadUrl,
        releaseUrl,
        isPrimary: (asset.name || '') === setupFileName,
      }))
    : [];

  return {
    title: fallback.title || t('currentStableBuild'),
    version: fallback.version || t('pinnedRelease'),
    publishedAt: fallback.publishedAt || '',
    setupFileName,
    sizeBytes,
    downloadUrl,
    releaseUrl,
    notesUrl,
    integrityValue: String(manifest.integrity?.value || '').trim(),
    assets,
    summaryItems: [],
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
    title: t('currentTaggedBuild'),
    version: latestTag.name,
    publishedAt: '',
    setupFileName: '',
    sizeBytes: null,
    downloadUrl: '',
    releaseUrl,
    notesUrl,
    integrityValue: '',
    assets: [],
    summaryItems: [],
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
    name: asset.name || t('unnamedAsset'),
    sizeBytes: Number.isFinite(asset.size) ? asset.size : null,
    downloadUrl: asset.browser_download_url || release.html_url || '',
    releaseUrl: release.html_url || '',
    isPrimary: Boolean(installerAsset && asset.id === installerAsset.id),
  }));

  return {
    title: release.name || t('latestStableBuild'),
    version: release.tag_name || release.name || t('latest'),
    publishedAt: release.published_at || release.created_at || '',
    setupFileName: installerAsset?.name || manifest.fallbackRelease?.setupFileName || '',
    sizeBytes: Number.isFinite(installerAsset?.size) ? installerAsset.size : null,
    downloadUrl: installerAsset?.browser_download_url || release.html_url || `${productRepo}/releases/latest`,
    releaseUrl: release.html_url || `${productRepo}/releases/latest`,
    notesUrl: release.html_url || `${productRepo}/releases/latest`,
    integrityValue: getIntegrityValue(installerAsset),
    assets: mappedAssets,
    summaryItems: extractSummaryItems(release.body, productRepo, release.html_url),
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

function wireMobileMenu() {
  const topbar = document.querySelector('.topbar');
  const toggle = document.querySelector('.menu-toggle');

  if (!(topbar instanceof HTMLElement) || !(toggle instanceof HTMLButtonElement)) return;

  const menuId = toggle.getAttribute('aria-controls');
  const menu = menuId ? document.getElementById(menuId) : null;
  if (!(menu instanceof HTMLElement)) return;

  const mobileMedia = window.matchMedia('(max-width: 760px)');

  const setMenuState = (open) => {
    const isMobile = mobileMedia.matches;
    const shouldOpen = isMobile && open;

    topbar.classList.toggle('is-menu-open', shouldOpen);
    toggle.setAttribute('aria-expanded', String(shouldOpen));
    menu.hidden = isMobile ? !shouldOpen : false;
  };

  setMenuState(false);

  toggle.addEventListener('click', () => {
    setMenuState(!topbar.classList.contains('is-menu-open'));
  });

  menu.addEventListener('click', (event) => {
    if (!mobileMedia.matches) return;
    if (!(event.target instanceof Element)) return;
    if (event.target.closest('a')) {
      setMenuState(false);
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      setMenuState(false);
    }
  });

  const syncMenu = () => setMenuState(topbar.classList.contains('is-menu-open'));
  if (typeof mobileMedia.addEventListener === 'function') {
    mobileMedia.addEventListener('change', syncMenu);
  } else {
    window.addEventListener('resize', syncMenu);
  }
}

function trackEvent(name, props = {}) {
  if (!name) return;

  const payload = { ...props, lang: PAGE_LANG };

  window.dispatchEvent(
    new CustomEvent('glyfana:analytics', {
      detail: {
        name,
        props: payload,
      },
    }),
  );

  try {
    if (typeof window.plausible === 'function') {
      window.plausible(name, { props: payload });
    }
  } catch {}

  try {
    if (typeof window.umami?.track === 'function') {
      window.umami.track(name, payload);
    }
  } catch {}

  try {
    if (typeof window.gtag === 'function') {
      window.gtag('event', name, payload);
    }
  } catch {}
}

function getAnalyticsDescriptor(target) {
  if (!(target instanceof Element)) return null;

  const faqSummary = target.closest('.faq-item summary');
  if (faqSummary instanceof HTMLElement) {
    return {
      name: 'faq_toggle',
      label: faqSummary.textContent?.trim() || 'faq',
      href: window.location.href,
    };
  }

  const link = target.closest('a');
  if (!(link instanceof HTMLAnchorElement)) return null;

  if (link.matches('.showcase-gallery__card')) {
    return {
      name: 'showcase_screenshot_click',
      label: link.dataset.label || 'screenshot',
      href: link.href,
    };
  }

  if (link.matches('.js-download')) {
    return { name: 'download_click', label: 'download_setup', href: link.href };
  }

  if (link.matches('.js-release')) {
    return { name: 'release_click', label: 'view_release', href: link.href };
  }

  if (link.matches('.js-notes')) {
    return { name: 'release_notes_click', label: 'release_notes', href: link.href };
  }

  if (link.matches('.js-releases')) {
    return { name: 'release_list_click', label: 'all_releases', href: link.href };
  }

  if (link.matches('.js-repo')) {
    return { name: 'repo_click', label: 'source_code', href: link.href };
  }

  if (link.matches('.asset-list__link')) {
    return {
      name: 'release_asset_click',
      label: link.textContent?.trim() || 'asset',
      href: link.href,
    };
  }

  if (link.matches('.locale-switch__link')) {
    return {
      name: 'locale_switch',
      label: link.textContent?.trim().toLowerCase() || 'locale',
      href: link.href,
    };
  }

  if (link.matches('.nav a')) {
    return {
      name: 'nav_jump',
      label: (link.getAttribute('href') || '').replace(/^#/, '') || 'nav',
      href: link.href,
    };
  }

  return null;
}

function wireAnalytics() {
  document.addEventListener('click', (event) => {
    const descriptor = getAnalyticsDescriptor(event.target);
    if (!descriptor) return;
    trackEvent(descriptor.name, {
      label: descriptor.label,
      href: descriptor.href,
    });
  });
}

async function init() {
  const [manifest, screenshotManifest] = await Promise.all([loadManifest(), loadScreenshotManifest()]);
  const screenshots = await resolveRenderableScreenshots(screenshotManifest.items);
  renderShowcaseGallery(screenshots);
  const productRepo = normalizeRepoUrl(manifest.productRepoUrl) || getRepoUrlFromPagesUrl();
  const websiteRepo = normalizeRepoUrl(manifest.websiteRepoUrl) || getRepoUrlFromPagesUrl();

  if (!productRepo) {
    setReleaseStatus('fallback', t('configureProductRepo'));
    setCommonLinks('');
    updateRepoStatus('', websiteRepo, t('configurationRequired'));
    applyReleaseModel(fallbackReleaseToModel(manifest, ''), {
      integrityAlgorithm: manifest.integrity?.algorithm,
    });
    return;
  }

  setCommonLinks(productRepo);
  applyReleaseModel(fallbackReleaseToModel(manifest, productRepo), {
    integrityAlgorithm: manifest.integrity?.algorithm,
  });
  setReleaseStatus('loading', t('loadingLatestRelease'));
  updateRepoStatus(productRepo, websiteRepo, t('fallbackMetadata'));

  try {
    const liveModel = await loadLatestReleaseModel(manifest, productRepo);
    applyReleaseModel(liveModel, {
      integrityAlgorithm: manifest.integrity?.algorithm,
    });
    if (liveModel.downloadUrl) {
      setReleaseStatus('live', t('latestReleaseLoaded'));
      updateRepoStatus(productRepo, websiteRepo, t('liveGitHubRelease'));
    } else {
      setReleaseStatus('fallback', t('noPublicInstallerPublished'));
      updateRepoStatus(productRepo, websiteRepo, t('latestGitTag'));
    }
  } catch {
    setReleaseStatus('fallback', t('usingPinnedMetadata'));
    updateRepoStatus(productRepo, websiteRepo, t('fallbackMetadata'));
  }
}

setYear();
wireAnalytics();
wireMobileMenu();
wireRevealAnimations();
init();
