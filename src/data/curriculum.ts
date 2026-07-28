import type { World } from '../types'
import { part1 } from './part1'
import { part2 } from './part2'
import { part3 } from './part3'
import { part4 } from './part4'

/** Full λforge curriculum — original lessons covering all Red Book chapters. */
export const worlds: World[] = [...part1, ...part2, ...part3, ...part4]

export function getWorld(worldId: string): World | undefined {
  return worlds.find((w) => w.id === worldId)
}

export function getQuest(
  worldId: string,
  questId: string,
): { world: World; quest: World['quests'][number] } | undefined {
  const world = getWorld(worldId)
  if (!world) return undefined
  const quest = world.quests.find((q) => q.id === questId)
  if (!quest) return undefined
  return { world, quest }
}

export function totalQuests(): number {
  return worlds.reduce((n, w) => n + w.quests.length, 0)
}

export function totalXpAvailable(): number {
  return worlds.reduce(
    (n, w) => n + w.quests.reduce((qSum, q) => qSum + q.xp, 0),
    0,
  )
}

export function totalChapters(): number {
  return worlds.length
}
