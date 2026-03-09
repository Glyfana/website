const RELEASE_NOTES_FILE = 'RELEASE_NOTES_0.1.3.md';
const SETUP_FILE_NAME = 'Glyfana-0.1.3 Setup.exe';
const PRODUCT_DEFAULT_BRANCH = 'master';
const PRODUCT_REPO_URL = 'https://github.com/Glyfana/Glyfana';
const WEBSITE_REPO_URL = '';

function normalizeRepoUrl(value) {
  return value.trim().replace(/\/+$/, '');
}

function getRepoInfoFromPagesUrl() {
  const host = window.location.hostname;
  if (!host.endsWith('github.io')) return null;

  const owner = host.split('.')[0];
  const parts = window.location.pathname.split('/').filter(Boolean);
  if (parts.length === 0) return null;

  const repo = parts[0];
  if (!owner || !repo) return null;

  return { owner, repo };
}

function getRepoUrlFromPagesUrl() {
  const info = getRepoInfoFromPagesUrl();
  if (!info) return '';
  return `https://github.com/${info.owner}/${info.repo}`;
}

function setLink(selector, href) {
  const links = document.querySelectorAll(selector);
  links.forEach((el) => {
    if (!(el instanceof HTMLAnchorElement)) return;
    el.href = href;
    el.classList.remove('is-disabled');
  });
}

function disableLinks(selector) {
  const links = document.querySelectorAll(selector);
  links.forEach((el) => {
    if (!(el instanceof HTMLAnchorElement)) return;
    el.href = '#';
    el.classList.add('is-disabled');
  });
}

function wireReleaseLinks() {
  const productRepo = normalizeRepoUrl(PRODUCT_REPO_URL) || getRepoUrlFromPagesUrl();
  const websiteRepo = normalizeRepoUrl(WEBSITE_REPO_URL) || getRepoUrlFromPagesUrl();
  const statusEl = document.getElementById('repo-status');

  if (!productRepo) {
    disableLinks('.js-download, .js-release, .js-repo, .js-notes');
    if (statusEl) statusEl.textContent = 'Release repo: set PRODUCT_REPO_URL in site/app.js';
    return;
  }

  const releaseLatest = `${productRepo}/releases/latest`;
  const setupDownload = `${productRepo}/releases/latest/download/${encodeURIComponent(SETUP_FILE_NAME)}`;
  const notesUrl = `${productRepo}/blob/${PRODUCT_DEFAULT_BRANCH}/${RELEASE_NOTES_FILE}`;

  setLink('.js-download', setupDownload);
  setLink('.js-release', releaseLatest);
  setLink('.js-repo', productRepo);
  setLink('.js-notes', notesUrl);

  if (statusEl) {
    const labels = [`Release repo: ${productRepo}`];
    if (websiteRepo && websiteRepo !== productRepo) labels.push(`Site repo: ${websiteRepo}`);
    statusEl.textContent = labels.join(' | ');
  }
}

function wireRevealAnimations() {
  const targets = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const io = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.2 },
  );

  targets.forEach((el) => io.observe(el));
}

function setYear() {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
}

setYear();
wireReleaseLinks();
wireRevealAnimations();
