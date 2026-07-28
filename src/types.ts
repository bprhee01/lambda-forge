export type ChallengeKind =
  | 'multiple-choice'
  | 'fill-blank'
  | 'true-false'
  | 'spot-bug'

export interface ChallengeBase {
  id: string
  kind: ChallengeKind
  prompt: string
  hint?: string
  explanation: string
  scalaSnippet?: string
}

export interface MultipleChoiceChallenge extends ChallengeBase {
  kind: 'multiple-choice'
  choices: string[]
  correctIndex: number
}

export interface FillBlankChallenge extends ChallengeBase {
  kind: 'fill-blank'
  /** Code with ___ as blank */
  template: string
  acceptedAnswers: string[]
  placeholder?: string
}

export interface TrueFalseChallenge extends ChallengeBase {
  kind: 'true-false'
  correct: boolean
}

export interface SpotBugChallenge extends ChallengeBase {
  kind: 'spot-bug'
  lines: string[]
  /** 0-based index of the buggy line */
  buggyLine: number
}

export type Challenge =
  | MultipleChoiceChallenge
  | FillBlankChallenge
  | TrueFalseChallenge
  | SpotBugChallenge

export interface Quest {
  id: string
  title: string
  blurb: string
  xp: number
  challenges: Challenge[]
}

export interface World {
  id: string
  chapter: number
  title: string
  subtitle: string
  theme: string
  quests: Quest[]
}

export interface ProgressState {
  completedQuests: string[]
  completedChallenges: string[]
  xp: number
  streak: number
  lastPlayedDate: string | null
}
