import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const input = process.argv[2];
if (!input) throw new Error('Usage: node scripts/import-prototype.mjs /path/to/final-prototype.html');
const extensions = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/svg+xml': 'svg', 'image/gif': 'gif', 'font/ttf': 'ttf', 'font/woff': 'woff', 'font/woff2': 'woff2', 'application/x-font-ttf': 'ttf', 'audio/mpeg': 'mp3', 'audio/wav': 'wav' };
const assets = new Map();
let html = fs.readFileSync(input, 'utf8').replace(/data:([\w.+/-]+);base64,([A-Za-z0-9+/=]+)/g, (uri, mime, encoded) => {
  const bytes = Buffer.from(encoded, 'base64');
  const hash = crypto.createHash('sha256').update(bytes).digest('hex');
  const group = mime.startsWith('font/') || mime.includes('font') ? 'fonts' : mime === 'image/svg+xml' ? 'vectors' : mime.startsWith('image/') ? 'images' : mime.startsWith('audio/') ? 'audio' : 'files';
  const relative = `assets/${group}/${hash.slice(0, 20)}.${extensions[mime] || 'bin'}`;
  if (!assets.has(relative)) {
    fs.mkdirSync(path.join(root, 'assets', group), { recursive: true });
    fs.writeFileSync(path.join(root, relative), bytes);
    assets.set(relative, { path: relative, mime, bytes: bytes.length, sha256: hash, references: 0 });
  }
  assets.get(relative).references++;
  return relative;
});
const styles = [], scripts = [];
html = html.replace(/<style\b([^>]*)>([\s\S]*?)<\/style>/gi, (_, attrs, css) => {
  const name = attrs.match(/\bid=["']([^"']+)["']/)?.[1] || `section-${styles.length + 1}`;
  styles.push(`/* OFFWORK_STYLE: ${name} */\n${css.trim()}`);
  return '';
});
html = html.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gi, (_, js) => {
  scripts.push(js.trim());
  return '';
});
html = html.replace(/<title>[\s\S]*?<\/title>/i, '<title>OffWork · 把时间还给自己</title>')
  .replace('</head>', '<!-- OFFWORK_STYLES -->\n</head>')
  .replace('</body>', '<!-- OFFWORK_SCRIPT -->\n</body>');
fs.mkdirSync(path.join(root, 'src'), { recursive: true });
fs.writeFileSync(path.join(root, 'src/template.html'), html);
fs.writeFileSync(path.join(root, 'src/styles.css'), styles.join('\n\n') + '\n');
fs.writeFileSync(path.join(root, 'src/app.js'), scripts.join('\n\n;\n\n') + '\n');
fs.writeFileSync(path.join(root, 'assets/manifest.json'), JSON.stringify({ version: 1, assets: [...assets.values()].sort((a, b) => a.path.localeCompare(b.path)) }, null, 2) + '\n');
console.log(`Imported ${scripts.length} script sections, ${styles.length} style sections and ${assets.size} unique assets.`);
