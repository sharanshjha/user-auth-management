import { copyFileSync, cpSync, existsSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';

const isNetlify = process.env.NETLIFY === 'true';
if (!isNetlify) {
  console.log('[netlify-postbuild] NETLIFY env not set, skipping publish mirror.');
  process.exit(0);
}

const frontendRoot = process.cwd();
const distRoot = resolve(frontendRoot, 'dist');
const distIndex = resolve(distRoot, 'index.html');
const distAssets = resolve(distRoot, 'assets');
const distRedirects = resolve(distRoot, '_redirects');

if (!existsSync(distIndex) || !existsSync(distAssets)) {
  throw new Error('[netlify-postbuild] dist output is missing. Build likely failed.');
}

const rootIndex = resolve(frontendRoot, 'index.html');
const rootAssets = resolve(frontendRoot, 'assets');
const rootRedirects = resolve(frontendRoot, '_redirects');

copyFileSync(distIndex, rootIndex);

if (existsSync(rootAssets)) {
  rmSync(rootAssets, { recursive: true, force: true });
}
cpSync(distAssets, rootAssets, { recursive: true });

if (existsSync(distRedirects)) {
  copyFileSync(distRedirects, rootRedirects);
}

console.log('[netlify-postbuild] Mirrored dist output into frontend/ publish root.');
