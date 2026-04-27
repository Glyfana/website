import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const siteRoot = path.join(repoRoot, 'site');
const outputRoot = path.join(repoRoot, '.site-dist');

const replacements = new Map([
  ['__GLYFANA_ANALYTICS_ENDPOINT__', process.env.ANALYTICS_ENDPOINT?.trim() || ''],
]);

async function walkFiles(rootDir) {
  const entries = await (await import('node:fs/promises')).readdir(rootDir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const targetPath = path.join(rootDir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walkFiles(targetPath)));
      continue;
    }

    files.push(targetPath);
  }

  return files;
}

function applyReplacements(content) {
  let next = content;
  for (const [token, value] of replacements) {
    next = next.split(token).join(value);
  }
  return next;
}

await rm(outputRoot, { recursive: true, force: true });
await mkdir(outputRoot, { recursive: true });
await cp(siteRoot, outputRoot, { recursive: true });

const files = await walkFiles(outputRoot);
await Promise.all(
  files
    .filter((filePath) => /\.(html|xml|txt|js|json)$/i.test(filePath))
    .map(async (filePath) => {
      const original = await readFile(filePath, 'utf8');
      const updated = applyReplacements(original);
      if (updated !== original) {
        await writeFile(filePath, updated, 'utf8');
      }
    }),
);
