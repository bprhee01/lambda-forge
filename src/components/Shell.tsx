import { Link } from 'react-router-dom'
import { useProgress } from '../hooks/useProgress'
import { totalXpAvailable } from '../data/curriculum'
import type { ReactNode } from 'react'

export function Shell({ children }: { children: ReactNode }) {
  const { progress, questsDone } = useProgress()
  const xpMax = totalXpAvailable()
  const xpPct = Math.min(100, Math.round((progress.xp / Math.max(xpMax, 1)) * 100))

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
          </div>
          <div className="xp-track" aria-label={`XP progress ${xpPct}%`}>
            <div className="xp-fill" style={{ width: `${xpPct}%` }} />
          </div>
        </div>
      </header>
      {children}
    </div>
  )
}
