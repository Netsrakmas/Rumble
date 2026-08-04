// export-art.mjs — renders every placeholder sheet to a real PNG in
// src/assets/art/, giving artists editable files at exact manifest geometry.
// Usage: node tools/export-art.mjs   (re-run after changing placeholders.js)

import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const PORT = 8129;

const server = spawn('python3', ['-m', 'http.server', String(PORT)], { cwd: root, stdio: 'ignore' });
await new Promise(r => setTimeout(r, 800));

const browser = await chromium.launch({
  executablePath: process.env.RUMBLE_CHROMIUM || '/opt/pw-browsers/chromium',
});
const page = await browser.newPage();
await page.goto(`http://localhost:${PORT}/index.html`);

const sheets = await page.evaluate(async () => {
  const { MANIFEST } = await import('/src/assets/manifest.js');
  const { generateSheet } = await import('/src/assets/placeholders.js');
  const out = {};
  for (const [name, def] of Object.entries(MANIFEST.sheets)) {
    out[name] = generateSheet(name, def).toDataURL('image/png');
  }
  return out;
});

for (const [name, dataUrl] of Object.entries(sheets)) {
  const b64 = dataUrl.split(',')[1];
  const path = join(root, 'src', 'assets', 'art', `${name}.png`);
  writeFileSync(path, Buffer.from(b64, 'base64'));
  console.log('wrote', path);
}

await browser.close();
server.kill();
