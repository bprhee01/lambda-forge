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

  return (
    <Shell>
      <section className="hero">
        <p className="hero-brand">
          λ<em>forge</em>
        </p>
        <h1>Temper pure functions. Master Scala FP.</h1>
        <p>
          A complete, standalone path through functional programming in Scala —
          all {totalChapters()} chapter-worlds with lessons you can learn from
          even if you have never opened the Red Book.
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
          <h2>Your anvil</h2>
          <p>
            Each quest teaches first, then drills. Progress saves in this
            browser. {questsDone}/{totalQuests()} quests · {progress.xp}/
            {totalXpAvailable()} XP.
          </p>
        </div>
        <div className="cta-row">
          <Link to="/map" className="btn btn-forge">
            Continue training
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
          <h2>The full path</h2>
          <p>
            Purity → recursion → ADTs → Option/Either → laziness → State →
            parallelism → property tests → parsers → monoids → monads →
            applicative/traverse → IO → local effects → streaming.
          </p>
        </div>
        <div className="world-grid">
          {worlds.map((w) => (
            <div key={w.id} className="world-row">
              <div className="world-index">
                {String(w.chapter).padStart(2, '0')}
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
        <em>Functional Programming in Scala</em> (Chiusano &amp; Bjarnason). It
        is not affiliated with Manning Publications. When you want proofs and
        deeper exercises, support the authors with a legal copy of the book.
      </p>
    </Shell>
  )
}
