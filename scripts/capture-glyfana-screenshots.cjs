const { app, BrowserWindow } = require('electron');
const fsSync = require('node:fs');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');

const APP_ROOT = 'C:\\Users\\hanwonjong\\Desktop\\blue-layer\\glyfana';
const MAIN_BUNDLE = path.join(APP_ROOT, '.vite', 'main', 'main.js');
const OUTPUT_DIR = 'C:\\Users\\hanwonjong\\Desktop\\blue-layer\\website\\site\\assets\\screenshots';
const CAPTURE_DIR = path.join(os.tmpdir(), 'glyfana-site-capture');
const FIXTURE_IMAGE = path.join(APP_ROOT, 'qa-fixtures', 'sample-image.svg');
const RECENT_FILE = 'C:\\Users\\hanwonjong\\AppData\\Roaming\\Glyfana\\recent-files.json';
const RECENT_BACKUP = path.join(os.tmpdir(), 'glyfana-recent-files.backup.json');

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function js(value) {
  return JSON.stringify(value);
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

  await waitForPage(
    win,
    `(() => !!document.querySelector('input.ui-input--path'))()`,
    8000,
  );

  const result = await runInPage(
    win,
    `(() => {
      const textOf = (node) => (node?.textContent || '').replace(/\\s+/g, ' ').trim();
      const input = document.querySelector('input.ui-input--path');
      if (!input) return { ok: false, reason: 'path-input-missing' };

      const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
      nativeSetter?.call(input, ${js(filePath)});
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));

      const openButton = [...document.querySelectorAll('button')].find((button) => textOf(button) === 'Open Path');
      if (!openButton) return { ok: false, reason: 'open-path-button-missing' };
      openButton.click();
      return { ok: true };
    })();`,
  );
  if (!result?.ok) throw new Error(`Failed to open path ${filePath}: ${result?.reason || 'unknown'}`);

  const fileName = path.basename(filePath);
  await waitForPage(
    win,
    `(() => [...document.querySelectorAll('.tab-chip__label')].some((node) => (node.textContent || '').includes(${js(fileName)})))()`,
    15000,
  );
  await wait(700);
}

async function clickButton(win, querySource, timeoutMs = 5000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const result = await runInPage(win, querySource);
    if (result?.ok) {
      await wait(500);
      return;
    }
    await wait(150);
  }
  throw new Error('Failed to click target button.');
}

async function capture(win, name) {
  await wait(500);
  const image = await win.webContents.capturePage();
  const size = image.getSize();
  const cropped = image.crop({
    x: 0,
    y: 0,
    width: size.width,
    height: Math.max(size.height - 82, 1),
  });
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  await fs.writeFile(path.join(OUTPUT_DIR, name), cropped.toPNG());
}

function prepareCaptureFilesSync() {
  fsSync.rmSync(CAPTURE_DIR, { recursive: true, force: true });
  fsSync.mkdirSync(CAPTURE_DIR, { recursive: true });
  fsSync.copyFileSync(FIXTURE_IMAGE, path.join(CAPTURE_DIR, 'sample-image.svg'));

  fsSync.writeFileSync(
    path.join(CAPTURE_DIR, 'editor-main.md'),
    `# Glyfana Capture Main

This note is generated for automated screenshot capture.

## Live Markdown Editing

Glyfana keeps the document focused while preserving readable structure, code, and tables.

- Open local markdown files instantly
- Keep recent files and last-open state
- Autosave drafts while you work

## Code Sample

\`\`\`ts
function publishRelease(version: string) {
  return \`Glyfana \${version}\`;
}
\`\`\`

## Table

| Signal | Status |
| --- | --- |
| Renderer | Stable |
| Update flow | Ready |
| Release site | Live |
`,
  );

  fsSync.writeFileSync(
    path.join(CAPTURE_DIR, 'editor-image.md'),
    `# Glyfana Capture Image

This capture shows local image rendering inside a markdown document.

## Embedded Asset

![Sample image](./sample-image.svg)

## Notes

- Local assets resolve relative to the document path.
- The preview remains readable with mixed content.
- This screen is intended for the website gallery.
`,
  );

  fsSync.writeFileSync(
    path.join(CAPTURE_DIR, 'editor-tabs.md'),
    `# Glyfana Capture Multi Tab

Use this document to show tabbed editing and source mode.

## Workflow

1. Open a second file.
2. Switch modes.
3. Capture a cleaner UI state.

The final screenshot should make tabs and editor chrome visible.
`,
  );
}

function seedRecentFile(filePath) {
  fsSync.mkdirSync(path.dirname(RECENT_BACKUP), { recursive: true });
  if (fsSync.existsSync(RECENT_FILE)) {
    fsSync.copyFileSync(RECENT_FILE, RECENT_BACKUP);
  }

  fsSync.mkdirSync(path.dirname(RECENT_FILE), { recursive: true });
  fsSync.writeFileSync(
    RECENT_FILE,
    JSON.stringify({
      recentFiles: [filePath],
      lastOpenFile: filePath,
      updatedAtMs: Date.now(),
    }),
  );
}

async function restoreRecentFile() {
  try {
    await fs.copyFile(RECENT_BACKUP, RECENT_FILE);
  } catch {
    // ignore
  }
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

  await waitForPage(
    win,
    `(() => [...document.querySelectorAll('.tab-chip__label')].some((node) => (node.textContent || '').includes('editor-main.md')))()`,
    15000,
  );
  await capture(win, 'editor-main.png');

  await openPath(win, path.join(CAPTURE_DIR, 'editor-image.md'));
  await capture(win, 'editor-image.png');

  await openPath(win, path.join(CAPTURE_DIR, 'editor-tabs.md'));
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
  await capture(win, 'editor-source.png');
}

(async () => {
  process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';
  prepareCaptureFilesSync();
  seedRecentFile(path.join(CAPTURE_DIR, 'editor-main.md'));
  require(MAIN_BUNDLE);

  app.whenReady().then(async () => {
    try {
      await main();
      await restoreRecentFile();
      await app.quit();
    } catch (error) {
      await restoreRecentFile();
      console.error(error);
      await app.exit(1);
    }
  });
})().catch(async (error) => {
  await restoreRecentFile();
  console.error(error);
  app.exit(1);
});
