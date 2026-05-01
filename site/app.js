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
const ANALYTICS_ENDPOINT_RAW =
  document.querySelector('meta[name="analytics-endpoint"]')?.getAttribute('content')?.trim() || '';
const ANALYTICS_ENDPOINT = /^__GLYFANA_[A-Z0-9_]+__$/.test(ANALYTICS_ENDPOINT_RAW)
  ? ''
  : ANALYTICS_ENDPOINT_RAW;
const ANALYTICS_SITE =
  document.querySelector('meta[name="analytics-site"]')?.getAttribute('content')?.trim() ||
  'glyfana-website';
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
    sizeUnavailable: 'Size unavailable',
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
    previewImage: 'Preview image',
    clickToEnlarge: 'Click to enlarge',
    viewSourceImage: 'Open source image',
    closePreview: 'Close preview',
    previousImage: 'Previous image',
    nextImage: 'Next image',
    defaultHighlights: [
      'Official Windows, Mac OS, and Linux downloads stay attached to the latest stable release.',
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
    sizeUnavailable: '크기 미확인',
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
    loadingLatestRelease: '최신 릴리스 정보를 불러오는 중...',
    latestReleaseLoaded: '최신 릴리스 정보가 반영되었습니다',
    usingPinnedMetadata: '현재 공개 릴리스 정보를 표시하고 있습니다',
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
    previewImage: '이미지 미리보기',
    clickToEnlarge: '클릭해서 크게 보기',
    viewSourceImage: '원본 이미지 열기',
    closePreview: '미리보기 닫기',
    previousImage: '이전 이미지',
    nextImage: '다음 이미지',
    defaultHighlights: [
      '최신 안정 릴리스의 Windows, Mac OS, Linux 빌드를 바로 내려받을 수 있습니다.',
      '릴리스 노트, 자산 목록, 체크섬을 한 흐름 안에서 같이 확인할 수 있습니다.',
      '설치 전에 공개된 SHA256 값으로 무결성을 검증할 수 있습니다.',
    ],
  },
};

function t(key, ...args) {
  const entry = STRINGS[PAGE_LANG]?.[key] ?? STRINGS.en[key];
  return typeof entry === 'function' ? entry(...args) : entry;
}

const DEFAULT_PLATFORM_ASSET_MATCHERS = {
  windows: [
    { type: 'regex', value: '^glyfana[-._].*setup\\.exe$' },
    { type: 'regex', value: 'setup\\.(exe|msi)$' },
    { type: 'regex', value: '\\.(exe|msi)$' },
  ],
  macDmg: [{ type: 'regex', value: '\\.dmg$' }],
  macZip: [{ type: 'regex', value: '\\.zip$' }],
  linuxAppImage: [{ type: 'regex', value: '\\.appimage$' }],
  linuxDeb: [{ type: 'regex', value: '\\.deb$' }],
};

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
  platformAssetMatchers: DEFAULT_PLATFORM_ASSET_MATCHERS,
  integrity: {
    algorithm: 'SHA256',
    value: '2409822E41301128F8E586BB116006E9C7599B884C1D7636191854754651CDF7',
  },
  fallbackRelease: {
    version: 'v0.1.9',
    title: 'v0.1.9',
    publishedAt: '2026-04-24T09:07:33Z',
    setupFileName: 'Glyfana-0.1.9.Setup.exe',
    sizeBytes: 84275204,
    downloadUrl: 'https://github.com/Glyfana/Glyfana/releases/download/v0.1.9/Glyfana-0.1.9.Setup.exe',
    releaseUrl: 'https://github.com/Glyfana/Glyfana/releases/tag/v0.1.9',
    notesUrl: 'https://github.com/Glyfana/Glyfana/releases/tag/v0.1.9',
    assets: [
      {
        name: 'Glyfana-0.1.9.Setup.exe',
        sizeBytes: 84275204,
        downloadUrl: 'https://github.com/Glyfana/Glyfana/releases/download/v0.1.9/Glyfana-0.1.9.Setup.exe',
        integrityValue: '2409822E41301128F8E586BB116006E9C7599B884C1D7636191854754651CDF7',
        isPrimary: true,
      },
      {
        name: 'Glyfana-0.1.9-x64.dmg',
        sizeBytes: 109315649,
        downloadUrl: 'https://github.com/Glyfana/Glyfana/releases/download/v0.1.9/Glyfana-0.1.9-x64.dmg',
        integrityValue: '381AA0E27046C5A79C985452EA23F38099D1C83E8EC3675EE3A90776FADBBE90',
        isPrimary: false,
      },
      {
        name: 'Glyfana-0.1.9-x64.zip',
        sizeBytes: 106076260,
        downloadUrl: 'https://github.com/Glyfana/Glyfana/releases/download/v0.1.9/Glyfana-0.1.9-x64.zip',
        integrityValue: 'B28903ACFD125B497306D3D5C81AF75EF759109129D7A1743E1BF51405F284F7',
        isPrimary: false,
      },
      {
        name: 'Glyfana-0.1.9-x86_64.AppImage',
        sizeBytes: 114164946,
        downloadUrl: 'https://github.com/Glyfana/Glyfana/releases/download/v0.1.9/Glyfana-0.1.9-x86_64.AppImage',
        integrityValue: '4BE5F3D892C10EE95E2CD16ED32591D62F63E27BCA32D75C2C83FFDA38E545AE',
        isPrimary: false,
      },
      {
        name: 'Glyfana-0.1.9-amd64.deb',
        sizeBytes: 89580088,
        downloadUrl: 'https://github.com/Glyfana/Glyfana/releases/download/v0.1.9/Glyfana-0.1.9-amd64.deb',
        integrityValue: '8CD5AA45F14B1BE31AFC54AC632C19101FE1209888FF3D982BC0A9484C623A92',
        isPrimary: false,
      },
      {
        name: 'Glyfana-0.1.9.Setup.exe.blockmap',
        sizeBytes: 88826,
        downloadUrl: 'https://github.com/Glyfana/Glyfana/releases/download/v0.1.9/Glyfana-0.1.9.Setup.exe.blockmap',
        integrityValue: '19727BE10AE1598FBE1A392A8FD097F968789A505D3C9E1CFB28CA2CADC4A1EB',
        isPrimary: false,
      },
      {
        name: 'latest-linux.yml',
        sizeBytes: 533,
        downloadUrl: 'https://github.com/Glyfana/Glyfana/releases/download/v0.1.9/latest-linux.yml',
        integrityValue: 'A89583C89D8C23D443BBA77A8B34B4FB7015A376D4DE1D4A5D37DEEC50E3C815',
        isPrimary: false,
      },
      {
        name: 'latest.yml',
        sizeBytes: 342,
        downloadUrl: 'https://github.com/Glyfana/Glyfana/releases/download/v0.1.9/latest.yml',
        integrityValue: '51E46CBA11F3DC41D4BA1A84FC7FD1C7FB247643E7C5E9A9752E655A579491AE',
        isPrimary: false,
      },
    ],
  },
};

const DEFAULT_SCREENSHOT_MANIFEST = {
  items: [],
};

const showcaseLightboxState = {
  items: [],
  activeIndex: -1,
  lastTrigger: null,
};

const analyticsState = {
  pageViewTracked: false,
};

function normalizeRepoUrl(value) {
  return String(value || '').trim().replace(/\/+$/, '').replace(/\.git$/, '');
}

function getReferrerHost(referrer) {
  try {
    return referrer ? new URL(referrer).host : '';
  } catch {
    return '';
  }
}

function sendFirstPartyAnalytics(payload) {
  if (!ANALYTICS_ENDPOINT) return;

  const body = JSON.stringify({
    site: ANALYTICS_SITE,
    path: window.location.pathname,
    pageHref: window.location.href,
    referrerHost: getReferrerHost(document.referrer),
    buildId: BUILD_ID,
    title: document.title,
    ...payload,
  });

  try {
    if (typeof navigator.sendBeacon === 'function') {
      const blob = new Blob([body], { type: 'application/json' });
      if (navigator.sendBeacon(ANALYTICS_ENDPOINT, blob)) {
        return;
      }
    }
  } catch {}

  try {
    fetch(ANALYTICS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body,
      keepalive: true,
      mode: 'cors',
    }).catch(() => {});
  } catch {}
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
  const overridePlatformMatchers = override?.platformAssetMatchers || {};
  const overrideAssets =
    Array.isArray(override?.fallbackRelease?.assets) && override.fallbackRelease.assets.length > 0
      ? mergeFallbackAssets(base.fallbackRelease.assets, override.fallbackRelease.assets)
      : base.fallbackRelease.assets;

  return {
    ...base,
    ...override,
    assetMatchers:
      Array.isArray(override?.assetMatchers) && override.assetMatchers.length > 0
        ? override.assetMatchers
        : base.assetMatchers,
    platformAssetMatchers: {
      windows:
        Array.isArray(overridePlatformMatchers.windows) && overridePlatformMatchers.windows.length > 0
          ? overridePlatformMatchers.windows
          : base.platformAssetMatchers.windows,
      macDmg:
        Array.isArray(overridePlatformMatchers.macDmg) && overridePlatformMatchers.macDmg.length > 0
          ? overridePlatformMatchers.macDmg
          : base.platformAssetMatchers.macDmg,
      macZip:
        Array.isArray(overridePlatformMatchers.macZip) && overridePlatformMatchers.macZip.length > 0
          ? overridePlatformMatchers.macZip
          : base.platformAssetMatchers.macZip,
      linuxAppImage:
        Array.isArray(overridePlatformMatchers.linuxAppImage) && overridePlatformMatchers.linuxAppImage.length > 0
          ? overridePlatformMatchers.linuxAppImage
          : base.platformAssetMatchers.linuxAppImage,
      linuxDeb:
        Array.isArray(overridePlatformMatchers.linuxDeb) && overridePlatformMatchers.linuxDeb.length > 0
          ? overridePlatformMatchers.linuxDeb
          : base.platformAssetMatchers.linuxDeb,
    },
    integrity: {
      ...base.integrity,
      ...(override?.integrity || {}),
    },
    fallbackRelease: {
      ...base.fallbackRelease,
      ...(override?.fallbackRelease || {}),
      assets: overrideAssets,
    },
  };
}

function normalizeAssetName(value) {
  return String(value || '').trim().toLowerCase();
}

function mergeFallbackAssets(baseAssets, overrideAssets) {
  const baseByName = new Map(
    (Array.isArray(baseAssets) ? baseAssets : [])
      .filter((asset) => asset?.name)
      .map((asset) => [normalizeAssetName(asset.name), asset]),
  );

  return (Array.isArray(overrideAssets) ? overrideAssets : []).map((asset) => {
    const baseAsset = baseByName.get(normalizeAssetName(asset?.name));
    const integrityValue = asset?.integrityValue || asset?.digest || baseAsset?.integrityValue || baseAsset?.digest || '';
    return integrityValue ? { ...asset, integrityValue } : asset;
  });
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

  showcaseLightboxState.items = normalizedItems;

  normalizedItems.forEach((item, index) => {
    const card = document.createElement('article');
    card.className = 'showcase-gallery__card';
    card.tabIndex = 0;
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', `${t('previewImage')}: ${item.title || `Screenshot ${index + 1}`}`);
    card.dataset.index = String(index);
    if (item.featured || index === 0) card.classList.add('is-featured');

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

    const hint = document.createElement('p');
    hint.className = 'showcase-gallery__hint';
    hint.textContent = t('clickToEnlarge');
    body.append(hint);

    if (item.href) {
      const sourceLink = document.createElement('a');
      sourceLink.className = 'showcase-gallery__link';
      sourceLink.href = item.href;
      sourceLink.target = '_blank';
      sourceLink.rel = 'noreferrer';
      sourceLink.textContent = t('viewSourceImage');
      body.append(sourceLink);
    }

    card.append(media, body);
    gallery.append(card);
  });

  section.classList.add('is-gallery-live');
  gallery.hidden = false;
  if (mockup instanceof HTMLElement) mockup.hidden = true;
}

function getShowcaseLightboxElements() {
  return {
    root: document.getElementById('showcase-lightbox'),
    image: document.getElementById('showcase-lightbox-image'),
    count: document.getElementById('showcase-lightbox-count'),
    title: document.getElementById('showcase-lightbox-title'),
    desc: document.getElementById('showcase-lightbox-desc'),
    sourceLink: document.getElementById('showcase-lightbox-source'),
    closeButton: document.getElementById('showcase-lightbox-close'),
    prevButton: document.getElementById('showcase-lightbox-prev'),
    nextButton: document.getElementById('showcase-lightbox-next'),
  };
}

function ensureShowcaseLightbox() {
  if (document.getElementById('showcase-lightbox')) return;

  const root = document.createElement('div');
  root.id = 'showcase-lightbox';
  root.className = 'showcase-lightbox';
  root.hidden = true;
  root.innerHTML = `
    <div class="showcase-lightbox__backdrop" data-close-lightbox="true"></div>
    <div class="showcase-lightbox__panel" role="dialog" aria-modal="true" aria-labelledby="showcase-lightbox-title" aria-describedby="showcase-lightbox-desc">
      <button id="showcase-lightbox-close" class="showcase-lightbox__close" type="button" aria-label="${t('closePreview')}">&times;</button>
      <div class="showcase-lightbox__frame">
        <img id="showcase-lightbox-image" class="showcase-lightbox__image" alt="" />
      </div>
      <div class="showcase-lightbox__meta">
        <div class="showcase-lightbox__head">
          <p id="showcase-lightbox-count" class="showcase-lightbox__count"></p>
          <h3 id="showcase-lightbox-title" class="showcase-lightbox__title"></h3>
        </div>
        <p id="showcase-lightbox-desc" class="showcase-lightbox__desc"></p>
        <div class="showcase-lightbox__controls">
          <a id="showcase-lightbox-source" class="showcase-lightbox__link" href="#" target="_blank" rel="noreferrer" hidden>${t('viewSourceImage')}</a>
          <button id="showcase-lightbox-prev" class="showcase-lightbox__nav" type="button">${t('previousImage')}</button>
          <button id="showcase-lightbox-next" class="showcase-lightbox__nav" type="button">${t('nextImage')}</button>
        </div>
      </div>
    </div>
  `;

  document.body.append(root);

  root.addEventListener('click', (event) => {
    if (!(event.target instanceof Element)) return;
    if (event.target.closest('[data-close-lightbox="true"]')) {
      closeShowcaseLightbox();
    }
  });

  const { closeButton, prevButton, nextButton } = getShowcaseLightboxElements();
  closeButton?.addEventListener('click', () => closeShowcaseLightbox());
  prevButton?.addEventListener('click', () => stepShowcaseLightbox(-1));
  nextButton?.addEventListener('click', () => stepShowcaseLightbox(1));
}

function renderShowcaseLightbox() {
  const { items, activeIndex } = showcaseLightboxState;
  const item = items[activeIndex];
  const els = getShowcaseLightboxElements();
  if (!item || !els.root || !els.image || !els.count || !els.title || !els.desc || !els.sourceLink || !els.prevButton || !els.nextButton) {
    return;
  }

  els.image.src = item.src;
  els.image.alt = item.alt || item.title || t('previewImage');
  els.count.textContent = `${activeIndex + 1} / ${items.length}`;
  els.title.textContent = item.title || t('previewImage');
  els.desc.textContent = item.caption || '';

  if (item.href) {
    els.sourceLink.href = item.href;
    els.sourceLink.hidden = false;
  } else {
    els.sourceLink.hidden = true;
    els.sourceLink.removeAttribute('href');
  }

  els.prevButton.disabled = items.length <= 1;
  els.nextButton.disabled = items.length <= 1;
}

function openShowcaseLightbox(index, trigger = null) {
  if (!showcaseLightboxState.items[index]) return;
  ensureShowcaseLightbox();

  showcaseLightboxState.activeIndex = index;
  showcaseLightboxState.lastTrigger = trigger instanceof HTMLElement ? trigger : null;
  renderShowcaseLightbox();

  const { root, closeButton } = getShowcaseLightboxElements();
  if (!root) return;

  root.hidden = false;
  document.body.classList.add('is-lightbox-open');
  closeButton?.focus();
}

function closeShowcaseLightbox() {
  const { root } = getShowcaseLightboxElements();
  if (!root || root.hidden) return;

  root.hidden = true;
  document.body.classList.remove('is-lightbox-open');
  showcaseLightboxState.activeIndex = -1;
  showcaseLightboxState.lastTrigger?.focus();
}

function stepShowcaseLightbox(direction) {
  const items = showcaseLightboxState.items;
  if (items.length <= 1 || showcaseLightboxState.activeIndex < 0) return;

  const nextIndex = (showcaseLightboxState.activeIndex + direction + items.length) % items.length;
  showcaseLightboxState.activeIndex = nextIndex;
  renderShowcaseLightbox();
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

function setHidden(selector, hidden) {
  document.querySelectorAll(selector).forEach((el) => {
    if (el instanceof HTMLElement) {
      el.hidden = hidden;
    }
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
  if (!Number.isFinite(value) || value <= 0) return t('sizeUnavailable');

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

function buildSha256sumCommand(fileName) {
  const safeName = String(fileName || 'appimage').replace(/"/g, '');
  return `sha256sum ./${safeName}`;
}

function buildShasumCommand(fileName) {
  const safeName = String(fileName || 'Glyfana.dmg').replace(/"/g, '');
  return `shasum -a 256 ./${safeName}`;
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

function pickAssetByMatchers(assets, matchers, fallbackPattern) {
  if (!Array.isArray(assets) || assets.length === 0) return null;

  for (const matcher of matchers || []) {
    const matchedAsset = assets.find((asset) => matchesAsset(asset.name, matcher));
    if (matchedAsset) return matchedAsset;
  }

  if (fallbackPattern instanceof RegExp) {
    const fallbackMatch = assets.find((asset) => fallbackPattern.test(asset.name || ''));
    if (fallbackMatch) return fallbackMatch;
  }

  return null;
}

function extractPlatformAssets(assets, platformAssetMatchers) {
  return {
    windows: pickAssetByMatchers(assets, platformAssetMatchers?.windows, /\.(exe|msi)$/i),
    macDmg: pickAssetByMatchers(assets, platformAssetMatchers?.macDmg, /\.dmg$/i),
    macZip: pickAssetByMatchers(assets, platformAssetMatchers?.macZip, /\.zip$/i),
    linuxAppImage: pickAssetByMatchers(assets, platformAssetMatchers?.linuxAppImage, /\.appimage$/i),
    linuxDeb: pickAssetByMatchers(assets, platformAssetMatchers?.linuxDeb, /\.deb$/i),
  };
}

function getPrimaryReleaseAsset(platformAssets, assets) {
  return (
    platformAssets.windows ||
    platformAssets.macDmg ||
    platformAssets.macZip ||
    platformAssets.linuxAppImage ||
    platformAssets.linuxDeb ||
    assets[0] ||
    null
  );
}

function buildPlatformSummary(platformAssets) {
  const labels = [];
  if (platformAssets.windows) labels.push('Windows');
  if (platformAssets.macDmg || platformAssets.macZip) labels.push('Mac OS');
  if (platformAssets.linuxAppImage || platformAssets.linuxDeb) labels.push('Linux');
  return labels.join(', ');
}

function detectPreferredDownloadPlatform() {
  const platform = String(navigator.userAgentData?.platform || navigator.platform || '').toLowerCase();
  const userAgent = String(navigator.userAgent || '').toLowerCase();
  const target = `${platform} ${userAgent}`;

  if (/android|iphone|ipad|ipod|mobile/.test(target)) return null;
  if (/win/.test(target)) return 'windows';
  if (/mac|darwin/.test(target)) return 'mac';
  if (/linux|x11/.test(target) && !/android/.test(target)) return 'linux';
  return 'windows';
}

function applyRecommendedDownload(platformAssets) {
  const available = {
    windows: Boolean(platformAssets.windows),
    mac: Boolean(platformAssets.macDmg || platformAssets.macZip),
    linux: Boolean(platformAssets.linuxAppImage || platformAssets.linuxDeb),
  };
  const preferred = detectPreferredDownloadPlatform();
  const targetPlatform = preferred && available[preferred]
    ? preferred
    : preferred === null
      ? null
      : ['windows', 'mac', 'linux'].find((platform) => available[platform]);

  document.querySelectorAll('.download-option').forEach((option) => {
    const isRecommended = option instanceof HTMLElement && option.dataset.platform === targetPlatform;
    option.classList.toggle('is-recommended', isRecommended);
    const badge = option.querySelector('.download-option__badge');
    if (badge instanceof HTMLElement) {
      badge.hidden = !isRecommended;
    }
    const button = option.querySelector('.btn');
    if (button instanceof HTMLElement) {
      button.classList.toggle('btn--primary', isRecommended);
    }
  });
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

function buildVerifyCommand(fileName) {
  const safeName = String(fileName || 'installer.exe').replace(/"/g, '');
  return `Get-FileHash ".\\${safeName}" -Algorithm SHA256`;
}

function normalizeIntegrityValue(value) {
  const digest = String(value || '').trim();
  if (!digest) return '';
  if (/^sha256:/i.test(digest)) {
    return digest.slice('sha256:'.length).toUpperCase();
  }
  return digest.toUpperCase();
}

function getIntegrityValue(asset) {
  return normalizeIntegrityValue(asset?.integrityValue || asset?.digest);
}

function normalizeReleaseAsset(asset, releaseUrl) {
  const sizeCandidate = Number.isFinite(asset?.sizeBytes) ? asset.sizeBytes : asset?.size;
  return {
    name: asset?.name || t('unnamedAsset'),
    sizeBytes: Number.isFinite(sizeCandidate) ? sizeCandidate : null,
    downloadUrl: asset?.downloadUrl || asset?.browser_download_url || releaseUrl || '',
    releaseUrl: asset?.releaseUrl || releaseUrl || '',
    isPrimary: Boolean(asset?.isPrimary),
    integrityValue: getIntegrityValue(asset),
  };
}

function buildKnownIntegrityMap(manifest) {
  const known = new Map();
  const assets = manifest?.fallbackRelease?.assets;
  if (!Array.isArray(assets)) return known;

  assets.forEach((asset) => {
    const name = normalizeAssetName(asset?.name);
    const integrityValue = getIntegrityValue(asset);
    if (name && integrityValue) known.set(name, integrityValue);
  });

  return known;
}

function applyKnownIntegrity(asset, knownIntegrityByName) {
  if (!asset || asset.integrityValue) return asset;
  const integrityValue = knownIntegrityByName.get(normalizeAssetName(asset.name));
  return integrityValue ? { ...asset, integrityValue } : asset;
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
  const platformAssets = model.platformAssets || {};
  const windowsAsset = platformAssets.windows || null;
  const macDmgAsset = platformAssets.macDmg || null;
  const macZipAsset = platformAssets.macZip || null;
  const macPrimaryAsset = macDmgAsset || macZipAsset || null;
  const linuxAppImageAsset = platformAssets.linuxAppImage || null;
  const linuxDebAsset = platformAssets.linuxDeb || null;
  const linuxPrimaryAsset = linuxAppImageAsset || linuxDebAsset || null;
  const primaryAsset =
    getPrimaryReleaseAsset(platformAssets, Array.isArray(model.assets) ? model.assets : []) || {
      name: model.setupFileName || '',
      sizeBytes: model.sizeBytes,
      downloadUrl: model.downloadUrl || '',
      integrityValue: normalizeIntegrityValue(model.integrityValue),
    };
  const hasIntegrity = Boolean(primaryAsset.integrityValue || model.integrityValue);
  const integrityValue = hasIntegrity
    ? primaryAsset.integrityValue || normalizeIntegrityValue(model.integrityValue)
    : t('algorithmUnavailable', integrityAlgorithm);
  const installerName = primaryAsset.name || model.setupFileName || t('noPublicInstallerPublished');
  const platformSummary = buildPlatformSummary(platformAssets) || t('unknown');
  const windowsIntegrity = windowsAsset?.integrityValue || t('algorithmUnavailable', integrityAlgorithm);
  const macIntegrity = macPrimaryAsset?.integrityValue || t('algorithmUnavailable', integrityAlgorithm);
  const linuxIntegrity = linuxPrimaryAsset?.integrityValue || t('algorithmUnavailable', integrityAlgorithm);

  setText('release-title', model.title || t('latestStableBuild'));
  setText('release-version', model.version || t('latest'));
  setText('release-date', formatDate(model.publishedAt));
  setText('release-size', formatBytes(primaryAsset.sizeBytes ?? model.sizeBytes));
  setText('release-platforms', platformSummary);
  setText('installer-name', installerName);
  setText('installer-name-inline', installerName);
  setText('release-sha', integrityValue);
  setText('release-sha-inline', integrityValue);
  setText('verify-command', buildVerifyCommand(primaryAsset.name || model.setupFileName || 'installer.exe'));
  setText('download-windows-file', windowsAsset?.name || '');
  setText('download-windows-size', formatBytes(windowsAsset?.sizeBytes));
  setText('download-mac-file', macPrimaryAsset?.name || '');
  setText('download-mac-size', formatBytes(macPrimaryAsset?.sizeBytes));
  setText('download-mac-zip-size', formatBytes(macZipAsset?.sizeBytes));
  setText('download-linux-file', linuxPrimaryAsset?.name || '');
  setText('download-linux-size', formatBytes(linuxPrimaryAsset?.sizeBytes));
  setText('download-linux-deb-size', formatBytes(linuxDebAsset?.sizeBytes));
  setText('release-sha-inline-windows', windowsIntegrity);
  setText('verify-command-windows', buildVerifyCommand(windowsAsset?.name || 'installer.exe'));
  setText('release-sha-inline-mac', macIntegrity);
  setText('verify-command-mac', buildShasumCommand(macPrimaryAsset?.name || 'Glyfana.dmg'));
  setText('release-sha-inline-linux', linuxIntegrity);
  setText('verify-command-linux', buildSha256sumCommand(linuxPrimaryAsset?.name || 'Glyfana.AppImage'));
  renderReleaseSummary(
    Array.isArray(model.summaryItems) && model.summaryItems.length > 0
      ? model.summaryItems
      : t('defaultHighlights'),
  );

  setLink('.js-download', primaryAsset.downloadUrl || model.downloadUrl || '');
  setLink('.js-download-windows', windowsAsset?.downloadUrl || '');
  setLink('.js-download-mac', macPrimaryAsset?.downloadUrl || '');
  setLink('.js-download-mac-dmg', macDmgAsset?.downloadUrl || macPrimaryAsset?.downloadUrl || '');
  setLink('.js-download-mac-zip', macZipAsset?.downloadUrl || '');
  setLink('.js-download-linux', linuxPrimaryAsset?.downloadUrl || '');
  setLink('.js-download-linux-appimage', linuxAppImageAsset?.downloadUrl || linuxPrimaryAsset?.downloadUrl || '');
  setLink('.js-download-linux-deb', linuxDebAsset?.downloadUrl || '');
  setLink('.js-release', model.releaseUrl || '');
  setLink('.js-notes', model.notesUrl || model.releaseUrl || '');
  setHidden('.download-option--windows', !windowsAsset);
  setHidden('.download-option--mac', !macPrimaryAsset);
  setHidden('.download-option--linux', !linuxPrimaryAsset);
  setHidden('.download-mac-zip-wrap', !macZipAsset || (macPrimaryAsset && macZipAsset.name === macPrimaryAsset.name));
  setHidden('.download-linux-deb-wrap', !linuxDebAsset || (linuxPrimaryAsset && linuxDebAsset.name === linuxPrimaryAsset.name));
  setHidden('.verify-platform--windows', !windowsAsset);
  setHidden('.verify-platform--mac', !macPrimaryAsset);
  setHidden('.verify-platform--linux', !linuxPrimaryAsset);
  applyRecommendedDownload(platformAssets);
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
    ? fallback.assets.map((asset) =>
        normalizeReleaseAsset(
          {
            ...asset,
            isPrimary: asset.isPrimary ?? (asset.name || '') === setupFileName,
          },
          releaseUrl,
        ),
      )
    : [];
  const platformAssets = extractPlatformAssets(assets, manifest.platformAssetMatchers);
  const primaryAsset = getPrimaryReleaseAsset(platformAssets, assets);

  return {
    title: fallback.title || t('currentStableBuild'),
    version: fallback.version || t('pinnedRelease'),
    publishedAt: fallback.publishedAt || '',
    setupFileName: primaryAsset?.name || setupFileName,
    sizeBytes: primaryAsset?.sizeBytes ?? sizeBytes,
    downloadUrl: primaryAsset?.downloadUrl || downloadUrl,
    releaseUrl,
    notesUrl,
    integrityValue: primaryAsset?.integrityValue || normalizeIntegrityValue(manifest.integrity?.value),
    assets,
    platformAssets,
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
  const knownIntegrityByName = buildKnownIntegrityMap(manifest);
  const mappedAssets = assets.map((asset) =>
    applyKnownIntegrity(normalizeReleaseAsset(asset, release.html_url || ''), knownIntegrityByName),
  );
  const platformAssets = extractPlatformAssets(mappedAssets, manifest.platformAssetMatchers);
  const installerAsset =
    getPrimaryReleaseAsset(platformAssets, mappedAssets) || pickInstallerAsset(mappedAssets, manifest.assetMatchers);
  const normalizedAssets = mappedAssets.map((asset) => ({
    ...asset,
    isPrimary: Boolean(
      installerAsset &&
        asset.name === installerAsset.name &&
        asset.downloadUrl === installerAsset.downloadUrl,
    ),
  }));

  return {
    title: release.name || t('latestStableBuild'),
    version: release.tag_name || release.name || t('latest'),
    publishedAt: release.published_at || release.created_at || '',
    setupFileName: installerAsset?.name || manifest.fallbackRelease?.setupFileName || '',
    sizeBytes: Number.isFinite(installerAsset?.sizeBytes) ? installerAsset.sizeBytes : null,
    downloadUrl: installerAsset?.downloadUrl || release.html_url || `${productRepo}/releases/latest`,
    releaseUrl: release.html_url || `${productRepo}/releases/latest`,
    notesUrl: release.html_url || `${productRepo}/releases/latest`,
    integrityValue: installerAsset?.integrityValue || '',
    assets: normalizedAssets,
    platformAssets,
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

function wireShowcaseInteractions() {
  ensureShowcaseLightbox();

  document.addEventListener('click', (event) => {
    if (!(event.target instanceof Element)) return;

    const sourceLink = event.target.closest('.showcase-gallery__link');
    if (sourceLink) {
      event.stopPropagation();
      return;
    }

    const card = event.target.closest('.showcase-gallery__card');
    if (!(card instanceof HTMLElement)) return;

    const index = Number.parseInt(card.dataset.index || '', 10);
    if (!Number.isFinite(index)) return;
    openShowcaseLightbox(index, card);
  });

  document.addEventListener('keydown', (event) => {
    if (event.target instanceof HTMLElement && event.target.matches('.showcase-gallery__card')) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        const index = Number.parseInt(event.target.dataset.index || '', 10);
        if (Number.isFinite(index)) openShowcaseLightbox(index, event.target);
        return;
      }
    }

    const { root } = getShowcaseLightboxElements();
    if (!root || root.hidden) return;

    if (event.key === 'Escape') {
      closeShowcaseLightbox();
    } else if (event.key === 'ArrowLeft') {
      stepShowcaseLightbox(-1);
    } else if (event.key === 'ArrowRight') {
      stepShowcaseLightbox(1);
    }
  });
}

function trackEvent(name, props = {}) {
  if (!name) return;

  const payload = { ...props, lang: PAGE_LANG };

  sendFirstPartyAnalytics({
    name,
    ...payload,
  });

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

  if (link.matches('.js-download-linux-deb')) {
    return { name: 'download_click', label: 'download_linux_deb', href: link.href };
  }

  if (link.matches('.js-download-mac-zip')) {
    return { name: 'download_click', label: 'download_mac_zip', href: link.href };
  }

  if (link.matches('.js-download-mac, .js-download-mac-dmg')) {
    return { name: 'download_click', label: 'download_mac', href: link.href };
  }

  if (link.matches('.js-download-linux, .js-download-linux-appimage')) {
    return { name: 'download_click', label: 'download_linux', href: link.href };
  }

  if (link.matches('.js-download-windows')) {
    return { name: 'download_click', label: 'download_windows', href: link.href };
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

function trackPageView() {
  if (analyticsState.pageViewTracked) return;
  analyticsState.pageViewTracked = true;
  trackEvent('page_view', {
    label: window.location.pathname,
  });
}

setYear();
wireAnalytics();
wireMobileMenu();
wireShowcaseInteractions();
wireRevealAnimations();
trackPageView();
applyRecommendedDownload({
  windows: true,
  macDmg: true,
  macZip: true,
  linuxAppImage: true,
  linuxDeb: true,
});
init();
