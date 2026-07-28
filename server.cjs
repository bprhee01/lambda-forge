const http = require('http')
const fs = require('fs')
const path = require('path')

const root = path.join(__dirname, 'dist')
const port = Number(process.env.PORT) || 4173

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.json': 'application/json',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.map': 'application/json',
}

const server = http.createServer((req, res) => {
  let url = decodeURIComponent((req.url || '/').split('?')[0])
  if (url.endsWith('/')) url += 'index.html'

  const file = path.normalize(path.join(root, url))
  if (!file.startsWith(root)) {
    res.writeHead(403)
    return res.end('forbidden')
  }

  const send = (p, code = 200) => {
    const ext = path.extname(p)
    res.writeHead(code, {
      'Content-Type': mime[ext] || 'application/octet-stream',
      'Cache-Control':
        ext === '.html' ? 'no-cache' : 'public, max-age=31536000, immutable',
    })
    fs.createReadStream(p).pipe(res)
  }

  if (fs.existsSync(file) && fs.statSync(file).isFile()) {
    return send(file)
  }

  // SPA / HashRouter fallback
  return send(path.join(root, 'index.html'))
})

server.listen(port, '0.0.0.0', () => {
  console.log(`λforge listening on ${port}`)
})
