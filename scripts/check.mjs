import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
new vm.Script(read('src/app.js'), { filename: 'src/app.js' });
const manifest = JSON.parse(read('assets/manifest.json'));
const entries = new Map(manifest.assets.map(asset => [asset.path, asset]));
for (const asset of entries.values()) {
  const target = path.resolve(root, asset.path);
  if (!target.startsWith(path.join(root, 'assets') + path.sep)) throw new Error(`Unsafe asset path: ${asset.path}`);
  const bytes = fs.readFileSync(target);
  if (bytes.length !== asset.bytes || crypto.createHash('sha256').update(bytes).digest('hex') !== asset.sha256) throw new Error(`Asset mismatch: ${asset.path}`);
}
for (const file of ['src/template.html', 'src/styles.css', 'src/app.js']) {
  for (const [asset] of read(file).matchAll(/assets\/(?:fonts|vectors|images|audio|files)\/[a-f0-9]{20}\.[a-z0-9]+/g)) {
    if (!entries.has(asset)) throw new Error(`Unlisted reference in ${file}: ${asset}`);
  }
}
const shell = read('src/template.html');
if (!shell.includes('<!-- OFFWORK_STYLES -->') || !shell.includes('<!-- OFFWORK_SCRIPT -->')) throw new Error('Missing build insertion points');
console.log(`Source syntax and ${entries.size} asset files verified.`);
