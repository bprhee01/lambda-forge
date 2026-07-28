const http = require('http')
const fs = require('fs')
const path = require('path')
const { Pool } = require('pg')

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

const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_SSL === 'false' ? false : { rejectUnauthorized: false },
    })
  : null

async function ensureSchema() {
  if (!pool) {
    console.warn('DATABASE_URL not set — progress API disabled (localStorage only)')
    return
  }
  await pool.query(`
    CREATE TABLE IF NOT EXISTS progress (
      player_id TEXT PRIMARY KEY,
      completed_quests JSONB NOT NULL DEFAULT '[]'::jsonb,
      completed_challenges JSONB NOT NULL DEFAULT '[]'::jsonb,
      xp INTEGER NOT NULL DEFAULT 0,
      streak INTEGER NOT NULL DEFAULT 0,
      last_played_date TEXT,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)
  console.log('progress table ready')
}

function sendJson(res, status, body) {
  const payload = JSON.stringify(body)
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  })
  res.end(payload)
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', (c) => chunks.push(c))
    req.on('end', () => {
      try {
        const raw = Buffer.concat(chunks).toString('utf8')
        resolve(raw ? JSON.parse(raw) : {})
      } catch (err) {
        reject(err)
      }
    })
    req.on('error', reject)
  })
}

const ALLOWED_PLAYERS = new Set(['ben', 'james'])

function isPlayerId(id) {
  return typeof id === 'string' && ALLOWED_PLAYERS.has(id.trim().toLowerCase())
}

function normalizeProgress(input) {
  const completedQuests = Array.isArray(input.completedQuests)
    ? [...new Set(input.completedQuests.filter((x) => typeof x === 'string'))]
    : []
  const completedChallenges = Array.isArray(input.completedChallenges)
    ? [...new Set(input.completedChallenges.filter((x) => typeof x === 'string'))]
    : []
  const xp = Number.isFinite(Number(input.xp)) ? Math.max(0, Math.floor(Number(input.xp))) : 0
  const streak = Number.isFinite(Number(input.streak))
    ? Math.max(0, Math.floor(Number(input.streak)))
    : 0
  const lastPlayedDate =
    typeof input.lastPlayedDate === 'string' || input.lastPlayedDate === null
      ? input.lastPlayedDate
      : null
  return { completedQuests, completedChallenges, xp, streak, lastPlayedDate }
}

async function handleApi(req, res, urlPath) {
  if (req.method === 'OPTIONS') {
    return sendJson(res, 204, {})
  }

  if (urlPath === '/api/health') {
    let db = 'disabled'
    if (pool) {
      try {
        await pool.query('SELECT 1')
        db = 'ok'
      } catch {
        db = 'error'
      }
    }
    return sendJson(res, 200, { ok: true, db })
  }

  const match = urlPath.match(/^\/api\/progress\/([^/]+)$/)
  if (!match) {
    return sendJson(res, 404, { error: 'not found' })
  }

  const playerId = decodeURIComponent(match[1]).trim().toLowerCase()
  if (!isPlayerId(playerId)) {
    return sendJson(res, 400, { error: 'invalid player name' })
  }

  if (!pool) {
    return sendJson(res, 503, { error: 'database unavailable' })
  }

  if (req.method === 'GET') {
    const { rows } = await pool.query(
      `SELECT player_id, completed_quests, completed_challenges, xp, streak, last_played_date, updated_at
       FROM progress WHERE player_id = $1`,
      [playerId],
    )
    if (!rows.length) {
      return sendJson(res, 200, {
        playerId,
        completedQuests: [],
        completedChallenges: [],
        xp: 0,
        streak: 0,
        lastPlayedDate: null,
        updatedAt: null,
      })
    }
    const row = rows[0]
    return sendJson(res, 200, {
      playerId: row.player_id,
      completedQuests: row.completed_quests,
      completedChallenges: row.completed_challenges,
      xp: row.xp,
      streak: row.streak,
      lastPlayedDate: row.last_played_date,
      updatedAt: row.updated_at,
    })
  }

  if (req.method === 'PUT') {
    const body = await readBody(req)
    const progress = normalizeProgress(body)
    const { rows } = await pool.query(
      `INSERT INTO progress (
         player_id, completed_quests, completed_challenges, xp, streak, last_played_date, updated_at
       ) VALUES ($1, $2::jsonb, $3::jsonb, $4, $5, $6, NOW())
       ON CONFLICT (player_id) DO UPDATE SET
         completed_quests = EXCLUDED.completed_quests,
         completed_challenges = EXCLUDED.completed_challenges,
         xp = EXCLUDED.xp,
         streak = EXCLUDED.streak,
         last_played_date = EXCLUDED.last_played_date,
         updated_at = NOW()
       RETURNING updated_at`,
      [
        playerId,
        JSON.stringify(progress.completedQuests),
        JSON.stringify(progress.completedChallenges),
        progress.xp,
        progress.streak,
        progress.lastPlayedDate,
      ],
    )
    return sendJson(res, 200, {
      playerId,
      ...progress,
      updatedAt: rows[0].updated_at,
    })
  }

  return sendJson(res, 405, { error: 'method not allowed' })
}

function serveStatic(req, res, urlPath) {
  let url = urlPath
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

  return send(path.join(root, 'index.html'))
}

const server = http.createServer(async (req, res) => {
  try {
    const urlPath = decodeURIComponent((req.url || '/').split('?')[0])
    if (urlPath.startsWith('/api/')) {
      return await handleApi(req, res, urlPath)
    }
    return serveStatic(req, res, urlPath)
  } catch (err) {
    console.error(err)
    if (!res.headersSent) {
      sendJson(res, 500, { error: 'server error' })
    }
  }
})

ensureSchema()
  .catch((err) => console.error('schema init failed', err))
  .finally(() => {
    server.listen(port, '0.0.0.0', () => {
      console.log(`λforge listening on ${port}`)
    })
  })
