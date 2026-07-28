import { useCallback, useEffect, useSyncExternalStore } from 'react'
import type { ProgressState } from '../types'
import { worlds } from '../data/curriculum'

const STORAGE_KEY = 'lambda-forge-progress-v2'
const PLAYER_KEY = 'lambda-forge-player-name'
export const PLAYER_NAME = 'ben'

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

function ensurePlayerName() {
  try {
    localStorage.setItem(PLAYER_KEY, PLAYER_NAME)
  } catch {
    // ignore
  }
  return PLAYER_NAME
}

let playerName = typeof window !== 'undefined' ? ensurePlayerName() : PLAYER_NAME
let state = typeof window !== 'undefined' ? load() : empty
let syncing = false
let hydrated = false
const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((l) => l())
}

function saveLocal(next: ProgressState) {
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

function getPlayerSnapshot() {
  return playerName
}

function getSyncingSnapshot() {
  return syncing
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

function mergeProgress(a: ProgressState, b: ProgressState): ProgressState {
  const completedQuests = [...new Set([...a.completedQuests, ...b.completedQuests])]
  const completedChallenges = [
    ...new Set([...a.completedChallenges, ...b.completedChallenges]),
  ]
  const xp = Math.max(a.xp, b.xp)
  const streak = Math.max(a.streak, b.streak)
  const lastPlayedDate =
    !a.lastPlayedDate
      ? b.lastPlayedDate
      : !b.lastPlayedDate
        ? a.lastPlayedDate
        : a.lastPlayedDate >= b.lastPlayedDate
          ? a.lastPlayedDate
          : b.lastPlayedDate
  return { completedQuests, completedChallenges, xp, streak, lastPlayedDate }
}

async function pushRemote(next: ProgressState) {
  try {
    syncing = true
    emit()
    await fetch(`/api/progress/${PLAYER_NAME}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(next),
    })
  } catch {
    // Keep local progress if offline / API down.
  } finally {
    syncing = false
    emit()
  }
}

function save(next: ProgressState) {
  saveLocal(next)
  void pushRemote(next)
}

async function hydrateFromServer() {
  if (hydrated) return
  hydrated = true
  playerName = ensurePlayerName()
  try {
    const res = await fetch(`/api/progress/${PLAYER_NAME}`)
    if (!res.ok) return
    const remote = (await res.json()) as ProgressState
    const merged = mergeProgress(state, {
      completedQuests: remote.completedQuests ?? [],
      completedChallenges: remote.completedChallenges ?? [],
      xp: remote.xp ?? 0,
      streak: remote.streak ?? 0,
      lastPlayedDate: remote.lastPlayedDate ?? null,
    })
    saveLocal(merged)
    if (
      merged.xp !== remote.xp ||
      merged.completedQuests.length !== (remote.completedQuests?.length ?? 0) ||
      merged.completedChallenges.length !==
        (remote.completedChallenges?.length ?? 0)
    ) {
      void pushRemote(merged)
    }
  } catch {
    // Ignore — localStorage remains source of truth offline.
  }
}

export function useProgress() {
  const progress = useSyncExternalStore(subscribe, getSnapshot, () => empty)
  const currentPlayer = useSyncExternalStore(
    subscribe,
    getPlayerSnapshot,
    () => PLAYER_NAME,
  )
  const isSyncing = useSyncExternalStore(subscribe, getSyncingSnapshot, () => false)

  useEffect(() => {
    void hydrateFromServer()
  }, [])

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
    playerName: currentPlayer,
    syncing: isSyncing,
    completeChallenge,
    completeQuest,
    reset,
    isQuestComplete,
    isChallengeComplete,
    isWorldUnlocked,
    questsDone,
  }
}
