import { Link } from 'react-router-dom'
import { Shell } from '../components/Shell'
import { totalQuests, totalXpAvailable, worlds } from '../data/curriculum'
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
          A quest-based training ground for functional programming in Scala —
          purity, algebraic data, Option/Either, laziness, state, monoids, and
          monads — inspired by the Red Book’s arc.
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
            Get the book
          </a>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h2>Your anvil</h2>
          <p>
            Progress saves in this browser. {questsDone}/{totalQuests()} quests
            complete · {progress.xp}/{totalXpAvailable()} XP forged.
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
          <h2>How it works</h2>
          <p>
            Clear worlds in order. Each quest mixes multiple-choice, fill-in,
            true/false, and “spot the impurity” challenges — no Scala runtime
            required in the browser.
          </p>
        </div>
        <div className="world-grid">
          {worlds.slice(0, 3).map((w) => (
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
        λforge is an original practice app. It is not affiliated with Manning
        Publications. Study alongside{' '}
        <em>Functional Programming in Scala</em> by Paul Chiusano and Rúnar
        Bjarnason — please support the authors via legal copies of the book.
      </p>
    </Shell>
  )
}
