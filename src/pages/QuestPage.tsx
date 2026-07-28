import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { ChallengePlayer } from '../components/ChallengePlayer'
import { LessonView } from '../components/LessonView'
import { Shell } from '../components/Shell'
import { getQuest, worlds } from '../data/curriculum'
import { useProgress } from '../hooks/useProgress'

type Phase = 'lesson' | 'drill' | 'done'

export function QuestPage() {
  const { worldId = '', questId = '' } = useParams()
  const found = getQuest(worldId, questId)
  const {
    completeChallenge,
    completeQuest,
    isQuestComplete,
    isWorldUnlocked,
    isChallengeComplete,
  } = useProgress()

  const worldIndex = worlds.findIndex((w) => w.id === worldId)
  const unlocked = worldIndex >= 0 && isWorldUnlocked(worldIndex)

  const [phase, setPhase] = useState<Phase>('lesson')
  const [step, setStep] = useState(0)

  useEffect(() => {
    setPhase('lesson')
    setStep(0)
  }, [worldId, questId])

  const challenges = found?.quest.challenges ?? []
  const challenge = challenges[step]

  const dots = useMemo(
    () =>
      challenges.map((c, i) => {
        if (phase === 'done' || isChallengeComplete(c.id) || (phase === 'drill' && i < step))
          return 'done'
        if (phase === 'drill' && i === step) return 'on'
        return ''
      }),
    [challenges, phase, isChallengeComplete, step],
  )

  if (!found) {
    return <Navigate to="/map" replace />
  }

  if (!unlocked) {
    return <Navigate to="/map" replace />
  }

  const { world, quest } = found
  const alreadyDone = isQuestComplete(quest.id)

  function handleSolved() {
    if (challenge) completeChallenge(challenge.id)
  }

  function handleContinue() {
    if (step >= challenges.length - 1) {
      completeQuest(quest.id, quest.xp)
      setPhase('done')
      return
    }
    setStep((s) => s + 1)
  }

  function replay() {
    setPhase('lesson')
    setStep(0)
  }

  return (
    <Shell>
      <div className="quest-layout">
        <div className="quest-header">
          <div className="crumb">
            <Link to="/map">Map</Link> / Ch. {world.chapter} · {world.title}
          </div>
          <h1>{quest.title}</h1>
          <p>{quest.blurb}</p>
          {phase !== 'lesson' && (
            <div className="progress-track" aria-label="Challenge progress">
              {dots.map((d, i) => (
                <div key={i} className={`progress-dot ${d}`} />
              ))}
            </div>
          )}
          {phase === 'lesson' && (
            <p className="hint" style={{ margin: 0 }}>
              Read the lesson, then temper what you learned in the drills.
            </p>
          )}
        </div>

        {phase === 'lesson' && (
          <LessonView
            lessons={quest.lessons}
            onContinue={() => setPhase('drill')}
          />
        )}

        {phase === 'done' && (
          <div className="complete-banner">
            <h2>Quest forged.</h2>
            <p>
              +{quest.xp} XP. {alreadyDone ? 'Replay complete.' : 'Progress saved.'}{' '}
              Return to the map for the next heat.
            </p>
            <div className="cta-row">
              <Link to="/map" className="btn btn-primary">
                Back to map
              </Link>
              <button type="button" className="btn btn-ghost" onClick={replay}>
                Replay quest
              </button>
            </div>
          </div>
        )}

        {phase === 'drill' && challenge && (
          <ChallengePlayer
            key={challenge.id}
            challenge={challenge}
            onSolved={handleSolved}
            onContinue={handleContinue}
            isLast={step === challenges.length - 1}
          />
        )}
      </div>
    </Shell>
  )
}
