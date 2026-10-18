import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const template = fs.readFileSync(path.join(root, 'src/template.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'src/styles.css'), 'utf8');
const js = fs.readFileSync(path.join(root, 'src/app.js'), 'utf8');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'assets/manifest.json'), 'utf8'));
function render(styles, code, shell = template) {
  const sections = styles.split(/(?=^\/\* OFFWORK_STYLE: [^\n*]+ \*\/\r?\n)/m).filter(Boolean);
  return shell.replace('<!-- OFFWORK_STYLES -->', () => sections.map(section => {
    const id = section.match(/^\/\* OFFWORK_STYLE: ([^\n*]+) \*\//)?.[1];
    return `<style${id && !/^section-\d+$/.test(id) ? ` id="${id}"` : ''}>\n${section}</style>`;
  }).join('\n'))
    .replace('<!-- OFFWORK_SCRIPT -->', () => `<script>\n${code}</script>`);
}
fs.writeFileSync(path.join(root, 'index.html'), render(css, js));
const inline = new Map(manifest.assets.map(asset => [asset.path, `data:${asset.mime};base64,${fs.readFileSync(path.join(root, asset.path)).toString('base64')}`]));
const embed = source => source.replace(/assets\/(?:fonts|vectors|images|audio|files)\/[a-f0-9]{20}\.[a-z0-9]+/g, asset => {
  if (!inline.has(asset)) throw new Error(`Missing asset: ${asset}`);
  return inline.get(asset);
});
fs.mkdirSync(path.join(root, 'dist'), { recursive: true });
fs.writeFileSync(path.join(root, 'dist/offwork.html'), render(embed(css), embed(js), embed(template)));
console.log('Built index.html (static hosting) and dist/offwork.html (offline single file).');
