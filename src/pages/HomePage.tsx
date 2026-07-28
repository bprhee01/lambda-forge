import { Link } from 'react-router-dom'
import { Shell } from '../components/Shell'
import {
  totalChapters,
  totalQuests,
  totalXpAvailable,
  worlds,
} from '../data/curriculum'
import { useProgress } from '../hooks/useProgress'

export function HomePage() {
  const { progress, questsDone, reset } = useProgress()
  const xpMax = totalXpAvailable()
  const xpPct = Math.min(100, Math.round((progress.xp / Math.max(xpMax, 1)) * 100))

  return (
    <Shell>
      <section className="hero">
        <p className="hero-brand">
          λ<em>forge</em>
        </p>
        <h1>Temper pure functions. Master Scala FP.</h1>
        <p>
          Short lessons, sticky drills, and a path that keeps unlocking —
          {totalChapters()} worlds from purity to streaming, learnable without
          the Red Book.
        </p>
        <div className="cta-row">
          <Link to="/map" className="btn btn-primary">
            Enter the forge
          </Link>
          <a
            className="btn btn-ghost"
            href="https://www.manning.com/books/functional-programming-in-scala-second-edition"
            target="_blank"
            rel="noreferrer"
          >
            Red Book (legal)
          </a>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h2>Your streak fuel</h2>
          <p>
            Lesson first, then drills. Progress saves in this browser and syncs
            to Railway. {questsDone}/{totalQuests()} quests · {progress.xp}/
            {xpMax} XP.
          </p>
          <div className="meter-line">
            <div className="xp-track">
              <div className="xp-fill" style={{ width: `${xpPct}%` }} />
            </div>
            <span className="meter-label">{xpPct}%</span>
          </div>
        </div>
        <div className="cta-row">
          <Link to="/map" className="btn btn-forge">
            Keep going
          </Link>
          {questsDone > 0 && (
            <button type="button" className="btn btn-ghost" onClick={reset}>
              Reset progress
            </button>
          )}
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h2>The trail</h2>
          <p>
            Purity → recursion → ADTs → Option/Either → laziness → State →
            parallelism → properties → parsers → monoids → monads →
            applicative → IO → local effects → streaming.
          </p>
        </div>
        <div className="world-grid">
          {worlds.slice(0, 4).map((w, i) => (
            <div key={w.id} className={`world-row ${i === 0 ? 'current' : ''}`}>
              <div className="world-rail">
                <div className="world-node">
                  {String(w.chapter).padStart(2, '0')}
                </div>
              </div>
              <div className="world-body">
                <h3>{w.title}</h3>
                <p className="subtitle">{w.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <p className="footer-note">
        λforge is original teaching material aligned to the chapter arc of{' '}
        <em>Functional Programming in Scala</em> (Chiusano &amp; Bjarnason). Not
        affiliated with Manning — support the authors with a legal copy when you
        go deeper.
      </p>
    </Shell>
  )
}
