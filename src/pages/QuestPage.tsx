import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { ChallengePlayer } from '../components/ChallengePlayer'
import { Shell } from '../components/Shell'
import { getQuest } from '../data/curriculum'
import { useProgress } from '../hooks/useProgress'
import { worlds } from '../data/curriculum'

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

  const [step, setStep] = useState(0)
  const [finished, setFinished] = useState(false)

  useEffect(() => {
    setStep(0)
    setFinished(false)
  }, [worldId, questId])

  const challenges = found?.quest.challenges ?? []
  const challenge = challenges[step]

  const dots = useMemo(
    () =>
      challenges.map((c, i) => {
        if (finished || isChallengeComplete(c.id) || i < step) return 'done'
        if (i === step) return 'on'
        return ''
      }),
    [challenges, finished, isChallengeComplete, step],
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
      setFinished(true)
      return
    }
    setStep((s) => s + 1)
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
          <div className="progress-track" aria-label="Challenge progress">
            {dots.map((d, i) => (
              <div key={i} className={`progress-dot ${d}`} />
            ))}
          </div>
        </div>

        {finished ? (
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
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  setStep(0)
                  setFinished(false)
                }}
              >
                Replay quest
              </button>
            </div>
          </div>
        ) : (
          challenge && (
            <ChallengePlayer
              key={challenge.id}
              challenge={challenge}
              onSolved={handleSolved}
              onContinue={handleContinue}
              isLast={step === challenges.length - 1}
            />
          )
        )}
      </div>
    </Shell>
  )
}
