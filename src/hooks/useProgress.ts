import { useCallback, useSyncExternalStore } from 'react'
import type { ProgressState } from '../types'
import { worlds } from '../data/curriculum'

const STORAGE_KEY = 'lambda-forge-progress-v1'

const empty: ProgressState = {
  completedQuests: [],
  completedChallenges: [],
  xp: 0,
  streak: 0,
  lastPlayedDate: null,
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10)
}

function load(): ProgressState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return empty
    return { ...empty, ...JSON.parse(raw) } as ProgressState
  } catch {
    return empty
  }
}

let state = typeof window !== 'undefined' ? load() : empty
const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((l) => l())
}

function save(next: ProgressState) {
  state = next
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  emit()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot() {
  return state
}

function touchStreak(prev: ProgressState): ProgressState {
  const today = todayKey()
  if (prev.lastPlayedDate === today) return prev
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yKey = yesterday.toISOString().slice(0, 10)
  const streak =
    prev.lastPlayedDate === yKey ? prev.streak + 1 : prev.streak > 0 ? 1 : 1
  return { ...prev, streak: prev.lastPlayedDate ? streak : 1, lastPlayedDate: today }
}

export function useProgress() {
  const progress = useSyncExternalStore(subscribe, getSnapshot, () => empty)

  const completeChallenge = useCallback((challengeId: string) => {
    if (state.completedChallenges.includes(challengeId)) return
    const next = touchStreak({
      ...state,
      completedChallenges: [...state.completedChallenges, challengeId],
    })
    save(next)
  }, [])

  const completeQuest = useCallback((questId: string, xp: number) => {
    if (state.completedQuests.includes(questId)) return
    const next = touchStreak({
      ...state,
      completedQuests: [...state.completedQuests, questId],
      xp: state.xp + xp,
    })
    save(next)
  }, [])

  const reset = useCallback(() => {
    save(empty)
  }, [])

  const isQuestComplete = useCallback(
    (questId: string) => progress.completedQuests.includes(questId),
    [progress.completedQuests],
  )

  const isChallengeComplete = useCallback(
    (challengeId: string) => progress.completedChallenges.includes(challengeId),
    [progress.completedChallenges],
  )

  const isWorldUnlocked = useCallback(
    (worldIndex: number) => {
      if (worldIndex === 0) return true
      const prev = worlds[worldIndex - 1]
      return prev.quests.every((q) => progress.completedQuests.includes(q.id))
    },
    [progress.completedQuests],
  )

  const questsDone = progress.completedQuests.length

  return {
    progress,
    completeChallenge,
    completeQuest,
    reset,
    isQuestComplete,
    isChallengeComplete,
    isWorldUnlocked,
    questsDone,
  }
}
