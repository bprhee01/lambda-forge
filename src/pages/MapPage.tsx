import { Link } from 'react-router-dom'
import { Shell } from '../components/Shell'
import { worlds } from '../data/curriculum'
import { useProgress } from '../hooks/useProgress'

export function MapPage() {
  const { isQuestComplete, isWorldUnlocked } = useProgress()

  return (
    <Shell>
      <section className="section" style={{ marginTop: 0 }}>
        <div className="section-head">
          <h2>World map</h2>
          <p>
            Unlock the next chapter by finishing every quest in the current
            world. Heat rises with each pure answer.
          </p>
        </div>

        <div className="world-grid">
          {worlds.map((world, index) => {
            const unlocked = isWorldUnlocked(index)
            return (
              <article
                key={world.id}
                className={`world-row ${unlocked ? '' : 'locked'}`}
              >
                <div className="world-index">
                  {String(world.chapter).padStart(2, '0')}
                </div>
                <div className="world-body">
                  <h3>{world.title}</h3>
                  <p className="subtitle">
                    {world.subtitle}
                    <br />
                    <em style={{ fontStyle: 'normal', opacity: 0.85 }}>
                      {world.theme}
                    </em>
                  </p>
                  {unlocked ? (
                    <div className="quest-links">
                      {world.quests.map((q) => (
                        <Link
                          key={q.id}
                          to={`/world/${world.id}/quest/${q.id}`}
                          className={`quest-link ${
                            isQuestComplete(q.id) ? 'done' : ''
                          }`}
                        >
                          {q.title}
                          <span style={{ opacity: 0.6 }}> · {q.xp} XP</span>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="lock-note">
                      Locked — complete the previous world first.
                    </p>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      </section>

      <p className="footer-note">
        Chapter numbers follow the spirit of the Red Book’s progression, with a
        jump toward monoids & monads after state. Use the book for deep proofs
        and full exercises; use λforge to drill intuition.
      </p>
    </Shell>
  )
}
