import { useCallback, useEffect, useSyncExternalStore } from 'react'
import type { ProgressState } from '../types'
import { worlds } from '../data/curriculum'

const STORAGE_KEY = 'lambda-forge-progress-v2'
const PLAYER_KEY = 'lambda-forge-player-name'

export const PLAYERS = ['ben', 'james'] as const
export type PlayerName = (typeof PLAYERS)[number]
export const DEFAULT_PLAYER: PlayerName = 'ben'

const empty: ProgressState = {
  completedQuests: [],
  completedChallenges: [],
  xp: 0,
  streak: 0,
  lastPlayedDate: null,
}

export function isAllowedPlayer(name: string): name is PlayerName {
  return (PLAYERS as readonly string[]).includes(name.trim().toLowerCase())
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

function readPlayer(): PlayerName {
  try {
    const existing = localStorage.getItem(PLAYER_KEY)
    if (existing && isAllowedPlayer(existing)) return existing.trim().toLowerCase() as PlayerName
    localStorage.setItem(PLAYER_KEY, DEFAULT_PLAYER)
    return DEFAULT_PLAYER
  } catch {
    return DEFAULT_PLAYER
  }
}

function writePlayer(name: PlayerName) {
  localStorage.setItem(PLAYER_KEY, name)
}

let playerName: PlayerName =
  typeof window !== 'undefined' ? readPlayer() : DEFAULT_PLAYER
let state = typeof window !== 'undefined' ? load() : empty
let syncing = false
let hydratedFor: string | null = null
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
    await fetch(`/api/progress/${playerName}`, {
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

async function hydrateFromServer(force = false) {
  if (!force && hydratedFor === playerName) return
  hydratedFor = playerName
  try {
    const res = await fetch(`/api/progress/${playerName}`)
    if (!res.ok) return
    const remote = (await res.json()) as ProgressState
    const base = force ? empty : state
    const merged = mergeProgress(base, {
      completedQuests: remote.completedQuests ?? [],
      completedChallenges: remote.completedChallenges ?? [],
      xp: remote.xp ?? 0,
      streak: remote.streak ?? 0,
      lastPlayedDate: remote.lastPlayedDate ?? null,
    })
    // When switching players, prefer remote profile over previous player's local cache.
    const next = force
      ? {
          completedQuests: remote.completedQuests ?? [],
          completedChallenges: remote.completedChallenges ?? [],
          xp: remote.xp ?? 0,
          streak: remote.streak ?? 0,
          lastPlayedDate: remote.lastPlayedDate ?? null,
        }
      : merged
    saveLocal(next)
    if (
      !force &&
      (merged.xp !== remote.xp ||
        merged.completedQuests.length !== (remote.completedQuests?.length ?? 0) ||
        merged.completedChallenges.length !==
          (remote.completedChallenges?.length ?? 0))
    ) {
      void pushRemote(merged)
    }
  } catch {
    if (force) saveLocal(empty)
  }
}

export function useProgress() {
  const progress = useSyncExternalStore(subscribe, getSnapshot, () => empty)
  const currentPlayer = useSyncExternalStore(
    subscribe,
    getPlayerSnapshot,
    () => DEFAULT_PLAYER,
  )
  const isSyncing = useSyncExternalStore(subscribe, getSyncingSnapshot, () => false)

  useEffect(() => {
    void hydrateFromServer(false)
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

  const switchPlayer = useCallback(async (name: string) => {
    if (!isAllowedPlayer(name)) {
      throw new Error('Only ben or james can play.')
    }
    const next = name.trim().toLowerCase() as PlayerName
    if (next === playerName) return
    playerName = next
    writePlayer(next)
    emit()
    await hydrateFromServer(true)
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
    players: PLAYERS,
    syncing: isSyncing,
    completeChallenge,
    completeQuest,
    reset,
    switchPlayer,
    isQuestComplete,
    isChallengeComplete,
    isWorldUnlocked,
    questsDone,
  }
}
