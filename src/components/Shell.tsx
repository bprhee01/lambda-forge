import { Link } from 'react-router-dom'
import { useProgress } from '../hooks/useProgress'
import { totalXpAvailable } from '../data/curriculum'
import { useState, type FormEvent, type ReactNode } from 'react'

export function Shell({ children }: { children: ReactNode }) {
  const { progress, questsDone, playerName, syncing, switchPlayer } = useProgress()
  const xpMax = totalXpAvailable()
  const xpPct = Math.min(100, Math.round((progress.xp / Math.max(xpMax, 1)) * 100))
  const [open, setOpen] = useState(false)
  const [nameInput, setNameInput] = useState(playerName)
  const [msg, setMsg] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function onSwitch(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setMsg(null)
    try {
      await switchPlayer(nameInput)
      setMsg(`Synced as ${nameInput.trim().toLowerCase()}.`)
      setOpen(false)
    } catch (err) {
      setMsg(err instanceof Error ? err.message : 'Could not switch player.')
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
              onClick={() => {
                setNameInput(playerName)
                setOpen((v) => !v)
              }}
              title="Player"
            >
              {syncing ? 'Syncing…' : playerName}
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
            <strong>Playing as {playerName}</strong>
            <span>
              Progress is saved on Railway under this name. On another device,
              just use the same name.
            </span>
          </div>
          <form className="restore-row" onSubmit={onSwitch}>
            <input
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="ben"
              spellCheck={false}
              autoCapitalize="off"
              autoCorrect="off"
            />
            <button
              type="submit"
              className="btn btn-forge"
              disabled={busy || !nameInput.trim()}
            >
              Use name
            </button>
          </form>
          {msg && <p className="save-msg">{msg}</p>}
        </div>
      )}

      {children}
    </div>
  )
}
