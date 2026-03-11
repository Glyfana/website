const LOCALE_STORAGE_KEY = 'glyfana-locale';
const AUTO_ROUTE_SESSION_KEY = 'glyfana-locale-autoredirected';
const SUPPORTED_LOCALES = new Set(['en', 'ko']);

function normalizeLocale(value) {
  const locale = String(value || '').trim().toLowerCase();
  if (!locale) return '';
  if (locale.startsWith('ko')) return 'ko';
  if (locale.startsWith('en')) return 'en';
  return '';
}

function getCurrentLocale() {
  return document.documentElement.lang?.toLowerCase().startsWith('ko') ? 'ko' : 'en';
}

function isKoreanPath() {
  const path = window.location.pathname.replace(/index\.html$/i, '');
  return /\/ko\/?$/i.test(path);
}

function isEnglishRootPath() {
  return !isKoreanPath();
}

function getStoredLocale() {
  try {
    return normalizeLocale(window.localStorage.getItem(LOCALE_STORAGE_KEY));
  } catch {
    return '';
  }
}

function setStoredLocale(locale) {
  if (!SUPPORTED_LOCALES.has(locale)) return;

  try {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    // Ignore storage errors in private or restricted contexts.
  }
}

function hasAutoRoutedThisSession() {
  try {
    return window.sessionStorage.getItem(AUTO_ROUTE_SESSION_KEY) === '1';
  } catch {
    return false;
  }
}

function markAutoRoutedThisSession() {
  try {
    window.sessionStorage.setItem(AUTO_ROUTE_SESSION_KEY, '1');
  } catch {
    // Ignore storage errors in private or restricted contexts.
  }
}

function getBrowserLocale() {
  const languages = Array.isArray(window.navigator.languages) && window.navigator.languages.length > 0
    ? window.navigator.languages
    : [window.navigator.language];

  for (const language of languages) {
    const locale = normalizeLocale(language);
    if (locale) return locale;
  }

  return 'en';
}

function getSiteBasePath() {
  const parts = window.location.pathname.split('/').filter(Boolean);

  if (parts.at(-1) === 'index.html') {
    parts.pop();
  }

  if (parts.at(-1) === 'ko') {
    parts.pop();
  }

  return parts.length > 0 ? `/${parts.join('/')}/` : '/';
}

function buildLocaleUrl(locale) {
  const basePath = getSiteBasePath();
  const suffix = locale === 'ko' ? 'ko/' : '';
  const params = new URLSearchParams(window.location.search);
  params.delete('lang');
  const query = params.toString();
  const hash = window.location.hash || '';
  return `${basePath}${suffix}${query ? `?${query}` : ''}${hash}`;
}

function replaceUrlWithoutLangParam() {
  const params = new URLSearchParams(window.location.search);
  if (!params.has('lang')) return;

  params.delete('lang');
  const query = params.toString();
  const cleanUrl = `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash || ''}`;
  window.history.replaceState(null, '', cleanUrl);
}

function initLocaleRouting() {
  const requestedLocale = normalizeLocale(new URLSearchParams(window.location.search).get('lang'));
  const currentLocale = getCurrentLocale();
  const storedLocale = getStoredLocale();
  const onEnglishRoot = isEnglishRootPath();
  const onKoreanPath = isKoreanPath();

  if (requestedLocale) {
    setStoredLocale(requestedLocale);
    markAutoRoutedThisSession();
    if (requestedLocale === currentLocale) {
      replaceUrlWithoutLangParam();
      return;
    }

    window.location.replace(buildLocaleUrl(requestedLocale));
    return;
  }

  if (onKoreanPath) {
    setStoredLocale('ko');
    return;
  }

  if (!onEnglishRoot) return;

  if (storedLocale === 'en') {
    return;
  }

  if (storedLocale === 'ko' && !hasAutoRoutedThisSession()) {
    markAutoRoutedThisSession();
    window.location.replace(buildLocaleUrl('ko'));
    return;
  }

  if (currentLocale === 'en' && !storedLocale && !hasAutoRoutedThisSession()) {
    const browserLocale = getBrowserLocale();
    if (browserLocale === 'ko') {
      markAutoRoutedThisSession();
      window.location.replace(buildLocaleUrl(browserLocale));
    }
  }
}

initLocaleRouting();
