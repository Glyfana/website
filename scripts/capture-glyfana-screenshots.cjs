const { app, BrowserWindow } = require('electron');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

const APP_ROOT = 'C:\\Users\\hanwonjong\\Desktop\\blue-layer\\glyfana';
const MAIN_BUNDLE = path.join(APP_ROOT, '.vite', 'main', 'main.js');
const OUTPUT_DIR = 'C:\\Users\\hanwonjong\\Desktop\\blue-layer\\website\\site\\assets\\screenshots';
const CAPTURE_DIR = path.join(os.tmpdir(), 'glyfana-site-capture');
const PROFILE_DIR = path.join(os.tmpdir(), 'glyfana-site-profile');

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function js(value) {
  return JSON.stringify(value);
}

function writeFile(targetPath, contents) {
  fs.writeFileSync(targetPath, contents, 'utf8');
}

function prepareCaptureFiles() {
  fs.rmSync(CAPTURE_DIR, { recursive: true, force: true });
  fs.rmSync(PROFILE_DIR, { recursive: true, force: true });
  fs.mkdirSync(CAPTURE_DIR, { recursive: true });
  fs.mkdirSync(PROFILE_DIR, { recursive: true });

  writeFile(
    path.join(CAPTURE_DIR, 'asset-card.svg'),
    `<svg xmlns="http://www.w3.org/2000/svg" width="720" height="420" viewBox="0 0 720 420" fill="none">
  <defs>
    <linearGradient id="bg" x1="96" y1="52" x2="628" y2="368" gradientUnits="userSpaceOnUse">
      <stop stop-color="#1A99C1"/>
      <stop offset="1" stop-color="#2BC26F"/>
    </linearGradient>
    <linearGradient id="accent" x1="180" y1="102" x2="520" y2="314" gradientUnits="userSpaceOnUse">
      <stop stop-color="#FFF4CF" stop-opacity="0.95"/>
      <stop offset="1" stop-color="#FFD169" stop-opacity="0.45"/>
    </linearGradient>
  </defs>
  <rect width="720" height="420" rx="30" fill="url(#bg)"/>
  <rect x="54" y="54" width="612" height="312" rx="24" fill="rgba(255,255,255,0.14)" stroke="rgba(255,255,255,0.22)"/>
  <circle cx="174" cy="210" r="64" fill="url(#accent)"/>
  <path d="M180 162c-38 0-64 22-64 50 0 31 26 50 60 50 19 0 37-6 51-16v-34h-48v18h26v6c-7 4-17 6-27 6-23 0-39-12-39-30 0-18 16-31 41-31 14 0 26 4 36 12l15-16c-14-10-31-15-51-15Z" fill="#0F5C59"/>
  <rect x="286" y="146" width="262" height="26" rx="13" fill="rgba(255,255,255,0.88)"/>
  <rect x="286" y="196" width="212" height="18" rx="9" fill="rgba(255,255,255,0.56)"/>
  <rect x="286" y="230" width="254" height="18" rx="9" fill="rgba(255,255,255,0.40)"/>
  <rect x="286" y="286" width="294" height="14" rx="7" fill="rgba(255,255,255,0.30)"/>
  <rect x="286" y="318" width="236" height="14" rx="7" fill="rgba(255,255,255,0.22)"/>
</svg>`,
  );

  writeFile(
    path.join(CAPTURE_DIR, 'release-notes.md'),
    `# Glyfana v0.1.4 Release Notes

Glyfana keeps Markdown writing fast, local, and readable for release posts, docs, and internal notes.

## Highlights

- WYSIWYG editing for release notes and structured docs
- Source mode for precise Markdown cleanup
- Local asset folders that keep screenshots portable

## Editing Flow

1. Open a note directly from disk.
2. Draft changes without leaving the editor.
3. Verify the final structure before publishing.

## Code Example

\`\`\`ts
const release = {
  version: '0.1.4',
  channel: 'stable',
  homepage: 'https://glyfana.github.io/website/',
};
\`\`\`

## Shipping Status

| Item | Status |
| --- | --- |
| Renderer | Stable |
| Update channel | GitHub Releases |
| Installer | Windows Setup.exe |
`,
  );

  writeFile(
    path.join(CAPTURE_DIR, 'media-assets.md'),
    `# Media Asset Workflow

Use local visuals without breaking relative paths or making the note harder to move between folders.

## Included Preview

![Glyfana media preview](./asset-card.svg)

## Why it matters

- Images stay next to the note as local assets.
- Team members can move the note without rewriting links.
- Preview and source stay aligned while editing.
`,
  );

  writeFile(
    path.join(CAPTURE_DIR, 'publishing-checklist.md'),
    `# Publishing Checklist

- [x] Review release note title
- [x] Verify the installer filename
- [x] Check image asset paths
- [ ] Capture final homepage screenshots
- [ ] Publish the website refresh

## Notes

Keep the changelog concise, link the full release page, and confirm the SHA256 value before pushing the homepage update.

\`\`\`md
## Download
- Windows installer
- Release notes
- SHA256 verification
\`\`\`
`,
  );
}

async function waitForWindow() {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    const win = BrowserWindow.getAllWindows()[0];
    if (win && !win.isDestroyed()) return win;
    await wait(200);
  }
  throw new Error('Timed out waiting for Glyfana window.');
}

async function waitForLoad(win) {
  if (!win.webContents.isLoading()) return;
  await new Promise((resolve) => {
    win.webContents.once('did-finish-load', resolve);
  });
}

async function runInPage(win, source) {
  return await win.webContents.executeJavaScript(source, true);
}

async function waitForPage(win, predicateSource, timeoutMs = 10000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const ready = await runInPage(win, predicateSource);
    if (ready) return;
    await wait(150);
  }
  throw new Error(`Timed out waiting for page predicate: ${predicateSource}`);
}

async function clickButton(win, querySource, timeoutMs = 5000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const result = await runInPage(win, querySource);
    if (result?.ok) {
      await wait(350);
      return;
    }
    await wait(150);
  }
  throw new Error('Failed to click target button.');
}

async function openPath(win, filePath) {
  await clickButton(
    win,
    `(() => {
      const textOf = (node) => (node?.textContent || '').replace(/\\s+/g, ' ').trim();
      const target = [...document.querySelectorAll('button')].find((button) => textOf(button) === 'Path');
      if (!target) return { ok: false };
      target.click();
      return { ok: true };
    })();`,
    8000,
  );

  await waitForPage(win, `(() => !!document.querySelector('input.ui-input--path'))()`, 8000);

  const result = await runInPage(
    win,
    `(() => {
      const textOf = (node) => (node?.textContent || '').replace(/\\s+/g, ' ').trim();
      const input = document.querySelector('input.ui-input--path');
      if (!input) return { ok: false, reason: 'path-input-missing' };

      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
      setter?.call(input, ${js(filePath)});
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));

      const target = [...document.querySelectorAll('button')].find((button) => textOf(button) === 'Open Path');
      if (!target) return { ok: false, reason: 'open-path-button-missing' };
      target.click();
      return { ok: true };
    })();`,
  );

  if (!result?.ok) {
    throw new Error(`Failed to open path ${filePath}: ${result?.reason || 'unknown'}`);
  }

  const fileName = path.basename(filePath);
  await waitForPage(
    win,
    `(() => [...document.querySelectorAll('.tab-chip__label')].some((node) => (node.textContent || '').includes(${js(fileName)})))()`,
    15000,
  );
  await wait(700);
}

async function closeUntitledTab(win) {
  await runInPage(
    win,
    `(() => {
      const tabs = [...document.querySelectorAll('.tab-chip')];
      const untitled = tabs.find((tab) => ((tab.textContent || '').includes('Untitled 1')));
      const close = untitled?.querySelector('.tab-chip__close');
      if (close) close.click();
    })();`,
  );
  await wait(300);
}

async function saveIfDirty(win) {
  await runInPage(
    win,
    `(() => {
      const button = [...document.querySelectorAll('button')].find((node) => (node.textContent || '').replace(/\\s+/g, ' ').trim() === 'Save');
      if (button && !button.disabled) button.click();
    })();`,
  );
  await wait(450);
}

async function sanitizeForCapture(win) {
  await runInPage(
    win,
    `(() => {
      document.querySelectorAll('.tab-chip__label').forEach((node) => {
        node.textContent = (node.textContent || '').replace(/^\\*\\s+/, '');
      });
    })();`,
  );
  await wait(120);
}

async function capture(win, name) {
  await wait(400);
  const image = await win.webContents.capturePage();
  const size = image.getSize();
  const cropped = image.crop({
    x: 0,
    y: 0,
    width: size.width,
    height: Math.max(size.height - 82, 1),
  });
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(path.join(OUTPUT_DIR, name), cropped.toPNG());
}

async function main() {
  const win = await waitForWindow();
  await waitForLoad(win);
  win.setBounds({ x: 60, y: 60, width: 1440, height: 900 });
  win.show();
  win.focus();

  await waitForPage(
    win,
    `(() => !!document.querySelector('.tabs-strip') && !!document.querySelector('.toolbar-group'))()`,
    15000,
  );

  await openPath(win, path.join(CAPTURE_DIR, 'release-notes.md'));
  await closeUntitledTab(win);
  await saveIfDirty(win);
  await sanitizeForCapture(win);
  await capture(win, 'editor-main.png');

  await openPath(win, path.join(CAPTURE_DIR, 'media-assets.md'));
  await saveIfDirty(win);
  await sanitizeForCapture(win);
  await capture(win, 'editor-image.png');

  await openPath(win, path.join(CAPTURE_DIR, 'publishing-checklist.md'));
  await saveIfDirty(win);
  await clickButton(
    win,
    `(() => {
      const target = document.querySelector('button[aria-label="Switch to source mode"]');
      if (!target) return { ok: false };
      target.click();
      return { ok: true };
    })();`,
    8000,
  );
  await waitForPage(
    win,
    `(() => !!document.querySelector('button[aria-label="Switch to WYSIWYG mode"]'))()`,
    8000,
  );
  await sanitizeForCapture(win);
  await capture(win, 'editor-source.png');
}

prepareCaptureFiles();
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';
app.setPath('userData', PROFILE_DIR);
require(MAIN_BUNDLE);

app.whenReady().then(async () => {
  try {
    await main();
    await app.quit();
  } catch (error) {
    console.error(error);
    await app.exit(1);
  }
});
