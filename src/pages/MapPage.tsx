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
            Clear a world to unlock the next node. Tap a quest, read the lesson,
            then run the drills for XP.
          </p>
        </div>

        <div className="world-grid">
          {worlds.map((world, index) => {
            const unlocked = isWorldUnlocked(index)
            const allDone = world.quests.every((q) => isQuestComplete(q.id))
            const isCurrent = unlocked && !allDone
            return (
              <article
                key={world.id}
                className={`world-row ${unlocked ? '' : 'locked'} ${
                  isCurrent ? 'current' : ''
                }`}
              >
                <div className="world-rail">
                  <div className="world-node">
                    {String(world.chapter).padStart(2, '0')}
                  </div>
                </div>
                <div className="world-body">
                  <h3>{world.title}</h3>
                  <p className="subtitle">
                    {world.subtitle}
                    <br />
                    <em style={{ fontStyle: 'normal', opacity: 0.88 }}>
                      {world.theme}
                    </em>
                  </p>
                  <p className="subtitle" style={{ marginTop: '0.2rem' }}>
                    {world.overview}
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
                          <span className="xp"> · {q.xp} XP</span>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="lock-note">
                      Locked — finish the previous world first.
                    </p>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      </section>

      <p className="footer-note">
        Lessons stand alone. The Red Book is the deeper companion for proofs and
        extended exercises.
      </p>
    </Shell>
  )
}
