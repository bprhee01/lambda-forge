import { Link } from 'react-router-dom'
import { useProgress } from '../hooks/useProgress'
import { totalXpAvailable } from '../data/curriculum'
import { useState, type FormEvent, type ReactNode } from 'react'

export function Shell({ children }: { children: ReactNode }) {
  const { progress, questsDone, playerId, syncing, restorePlayer } = useProgress()
  const xpMax = totalXpAvailable()
  const xpPct = Math.min(100, Math.round((progress.xp / Math.max(xpMax, 1)) * 100))
  const [open, setOpen] = useState(false)
  const [restoreCode, setRestoreCode] = useState('')
  const [msg, setMsg] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(playerId)
      setMsg('Save code copied.')
    } catch {
      setMsg('Copy failed — select the code manually.')
    }
  }

  async function onRestore(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setMsg(null)
    try {
      await restorePlayer(restoreCode)
      setMsg('Progress restored from Railway.')
      setRestoreCode('')
      setOpen(false)
    } catch (err) {
      setMsg(err instanceof Error ? err.message : 'Restore failed.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link to="/" className="brand">
          λ<em>forge</em>
          <span className="brand-sub">Scala FP</span>
        </Link>
        <div className="stat-cluster">
          <div className="stat-row">
            <span>
              XP <strong>{progress.xp}</strong>
            </span>
            <span>
              Quests <strong>{questsDone}</strong>
            </span>
            <span>
              Streak <strong>{progress.streak}</strong>
            </span>
            <button
              type="button"
              className="save-chip"
              onClick={() => setOpen((v) => !v)}
              title="Cloud save"
            >
              {syncing ? 'Syncing…' : 'Save'}
            </button>
          </div>
          <div className="xp-track" aria-label={`XP progress ${xpPct}%`}>
            <div className="xp-fill" style={{ width: `${xpPct}%` }} />
          </div>
        </div>
      </header>

      {open && (
        <div className="save-panel">
          <div className="save-panel-head">
            <strong>Cloud save</strong>
            <span>Progress syncs to Railway Postgres. Keep this code to continue on another device.</span>
          </div>
          <div className="save-code-row">
            <code className="save-code">{playerId}</code>
            <button type="button" className="btn btn-ghost" onClick={copyCode}>
              Copy
            </button>
          </div>
          <form className="restore-row" onSubmit={onRestore}>
            <input
              value={restoreCode}
              onChange={(e) => setRestoreCode(e.target.value)}
              placeholder="Paste a save code to restore"
              spellCheck={false}
              autoCapitalize="off"
              autoCorrect="off"
            />
            <button type="submit" className="btn btn-forge" disabled={busy || !restoreCode.trim()}>
              Restore
            </button>
          </form>
          {msg && <p className="save-msg">{msg}</p>}
        </div>
      )}

      {children}
    </div>
  )
}
