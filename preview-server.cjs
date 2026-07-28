const http = require('http');
const fs = require('fs');
const path = require('path');
const root = '/agent/preview-site';
const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.json': 'application/json',
  '.woff2': 'font/woff2',
};
http
  .createServer((req, res) => {
    let url = decodeURIComponent((req.url || '/').split('?')[0]);
    if (url.endsWith('/')) url += 'index.html';
    const file = path.normalize(path.join(root, url));
    if (!file.startsWith(root + path.sep) && file !== root) {
      res.writeHead(403);
      return res.end('forbidden');
    }
    const send = (p, code = 200) => {
      const ext = path.extname(p);
      res.writeHead(code, {
        'Content-Type': mime[ext] || 'application/octet-stream',
        'Cache-Control': 'no-cache',
      });
      fs.createReadStream(p).pipe(res);
    };
    if (fs.existsSync(file) && fs.statSync(file).isFile()) return send(file);
    return send(path.join(root, 'index.html'));
  })
  .listen(4173, '0.0.0.0', () => console.log('preview host on 4173'));
