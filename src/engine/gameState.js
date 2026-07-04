import { ASSEMBLY_STEPS, stepForIndex } from '../content/assemblySteps.js'

export function createGame() {
  let index = 0
  const placed = []

  return {
    currentStep: () => stepForIndex(index),
    placedIds: () => [...placed],
    isComplete: () => index >= ASSEMBLY_STEPS.length,
    unlockedCodex: () => [...placed],
    tryPlace(partId) {
      const step = stepForIndex(index)
      if (!step || step.partId !== partId) return { placed: false }
      placed.push(partId)
      index += 1
      return { placed: true, done: index >= ASSEMBLY_STEPS.length }
    },
  }
}
