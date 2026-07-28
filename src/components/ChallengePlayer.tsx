import { useMemo, useState } from 'react'
import type { Challenge } from '../types'

function normalize(s: string): string {
  return s.trim().replace(/\s+/g, ' ')
}

function answersMatch(input: string, accepted: string[]): boolean {
  const n = normalize(input)
  return accepted.some((a) => normalize(a) === n)
}

type Props = {
  challenge: Challenge
  onSolved: () => void
  onContinue: () => void
  isLast: boolean
}

export function ChallengePlayer({
  challenge,
  onSolved,
  onContinue,
  isLast,
}: Props) {
  const [selected, setSelected] = useState<number | null>(null)
  const [fill, setFill] = useState('')
  const [tf, setTf] = useState<boolean | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [correct, setCorrect] = useState(false)
  const [showHint, setShowHint] = useState(false)

  const kindLabel = useMemo(() => {
    switch (challenge.kind) {
      case 'multiple-choice':
        return 'Multiple choice'
      case 'fill-blank':
        return 'Fill the blank'
      case 'true-false':
        return 'True or false'
      case 'spot-bug':
        return 'Spot the impurity'
    }
  }, [challenge.kind])

  function resetLocal() {
    setSelected(null)
    setFill('')
    setTf(null)
    setSubmitted(false)
    setCorrect(false)
    setShowHint(false)
  }

  function submit() {
    let ok = false
    if (challenge.kind === 'multiple-choice') {
      ok = selected === challenge.correctIndex
    } else if (challenge.kind === 'fill-blank') {
      ok = answersMatch(fill, challenge.acceptedAnswers)
    } else if (challenge.kind === 'true-false') {
      ok = tf === challenge.correct
    } else if (challenge.kind === 'spot-bug') {
      ok = selected === challenge.buggyLine
    }
    setCorrect(ok)
    setSubmitted(true)
    if (ok) onSolved()
  }

  function handleContinue() {
    resetLocal()
    onContinue()
  }

  return (
    <div className="challenge-panel" key={challenge.id}>
      <div className="challenge-kind">{kindLabel}</div>
      <h2>{challenge.prompt}</h2>

      {challenge.scalaSnippet && challenge.kind !== 'fill-blank' && (
        <pre className="code-block">{challenge.scalaSnippet}</pre>
      )}

      {challenge.kind === 'fill-blank' && (
        <pre className="code-block">{challenge.template}</pre>
      )}

      {challenge.kind === 'spot-bug' && (
        <pre className="code-block">
          {challenge.lines.map((line, i) => {
            let cls = 'line selectable'
            if (selected === i) cls += ' selected'
            if (submitted && i === challenge.buggyLine && correct) cls += ' correct'
            if (submitted && selected === i && !correct) cls += ' wrong'
            if (submitted && !correct && i === challenge.buggyLine) cls += ' correct'
            return (
              <span
                key={i}
                className={cls}
                onClick={() => !submitted && setSelected(i)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (!submitted && (e.key === 'Enter' || e.key === ' ')) {
                    setSelected(i)
                  }
                }}
              >
                {line.length === 0 ? ' ' : line}
              </span>
            )
          })}
        </pre>
      )}

      {challenge.kind === 'multiple-choice' && (
        <div className="choices">
          {challenge.choices.map((c, i) => {
            let cls = 'choice'
            if (selected === i) cls += ' selected'
            if (submitted && i === challenge.correctIndex) cls += ' correct'
            if (submitted && selected === i && i !== challenge.correctIndex)
              cls += ' incorrect'
            return (
              <button
                key={i}
                type="button"
                className={cls}
                disabled={submitted}
                onClick={() => setSelected(i)}
              >
                {c}
              </button>
            )
          })}
        </div>
      )}

      {challenge.kind === 'true-false' && (
        <div className="tf-row">
          {[true, false].map((val) => {
            let cls = 'choice'
            if (tf === val) cls += ' selected'
            if (submitted && val === challenge.correct) cls += ' correct'
            if (submitted && tf === val && val !== challenge.correct)
              cls += ' incorrect'
            return (
              <button
                key={String(val)}
                type="button"
                className={cls}
                disabled={submitted}
                onClick={() => setTf(val)}
              >
                {val ? 'True' : 'False'}
              </button>
            )
          })}
        </div>
      )}

      {challenge.kind === 'fill-blank' && (
        <div className="fill-row">
          <input
            value={fill}
            disabled={submitted}
            placeholder={challenge.placeholder ?? 'your answer'}
            onChange={(e) => setFill(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !submitted && fill.trim()) submit()
            }}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
          />
        </div>
      )}

      {challenge.hint && !submitted && (
        <div>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => setShowHint((h) => !h)}
          >
            {showHint ? 'Hide hint' : 'Show hint'}
          </button>
          {showHint && <p className="hint">{challenge.hint}</p>}
        </div>
      )}

      <div className="actions">
        {!submitted && (
          <button
            type="button"
            className="btn btn-primary"
            disabled={
              (challenge.kind === 'multiple-choice' && selected === null) ||
              (challenge.kind === 'spot-bug' && selected === null) ||
              (challenge.kind === 'true-false' && tf === null) ||
              (challenge.kind === 'fill-blank' && !fill.trim())
            }
            onClick={submit}
          >
            Check answer
          </button>
        )}
        {submitted && correct && (
          <button type="button" className="btn btn-forge" onClick={handleContinue}>
            {isLast ? 'Finish quest' : 'Next challenge'}
          </button>
        )}
        {submitted && !correct && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              setSubmitted(false)
              setCorrect(false)
            }}
          >
            Try again
          </button>
        )}
      </div>

      {submitted && (
        <div className={`feedback ${correct ? 'ok' : 'bad'}`}>
          <strong>{correct ? 'Tempered.' : 'Not yet.'}</strong>
          <p>{challenge.explanation}</p>
        </div>
      )}
    </div>
  )
}
