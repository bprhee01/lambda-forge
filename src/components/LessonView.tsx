import type { LessonSection } from '../types'

export function LessonView({
  lessons,
  onContinue,
}: {
  lessons: LessonSection[]
  onContinue: () => void
}) {
  return (
    <div className="lesson-panel">
      <div className="challenge-kind">Lesson</div>
      {lessons.map((section, i) => (
        <article key={i} className="lesson-section">
          {section.heading && <h2>{section.heading}</h2>}
          {section.body.map((p, j) => (
            <p key={j}>{p}</p>
          ))}
          {section.code && <pre className="code-block">{section.code}</pre>}
          {section.callout && (
            <aside className="lesson-callout">{section.callout}</aside>
          )}
        </article>
      ))}
      <div className="actions">
        <button type="button" className="btn btn-forge" onClick={onContinue}>
          Start drills
        </button>
      </div>
    </div>
  )
}
