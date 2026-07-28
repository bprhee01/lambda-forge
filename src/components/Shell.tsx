import { Link } from 'react-router-dom'
import { useProgress } from '../hooks/useProgress'
import type { ReactNode } from 'react'

export function Shell({ children }: { children: ReactNode }) {
  const { progress, questsDone } = useProgress()

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link to="/" className="brand">
          λ<em style={{ fontStyle: 'normal', color: 'var(--forge)' }}>forge</em>
          <span className="brand-sub">Scala FP</span>
        </Link>
        <div className="stat-pill">
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
      </header>
      {children}
    </div>
  )
}
