import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.ttf': 'font/ttf', '.woff': 'font/woff', '.woff2': 'font/woff2', '.mp3': 'audio/mpeg' };
export function createStaticServer() {
  return http.createServer((req, res) => {
    try {
      const name = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
      const relative = name === '/' ? 'index.html' : name.replace(/^\/+/, '');
      const target = path.resolve(root, relative);
      if (!target.startsWith(root + path.sep) || relative.split('/').some(part => part.startsWith('.')) || !fs.existsSync(target) || !fs.statSync(target).isFile()) {
        res.writeHead(404); res.end('Not found'); return;
      }
      res.writeHead(200, { 'Content-Type': mime[path.extname(target)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
      if (req.method === 'HEAD') res.end(); else fs.createReadStream(target).pipe(res);
    } catch { res.writeHead(400); res.end('Bad request'); }
  });
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const port = Number(process.env.PORT || 4173);
  createStaticServer().listen(port, '127.0.0.1', () => console.log(`OffWork: http://127.0.0.1:${port}`));
}
