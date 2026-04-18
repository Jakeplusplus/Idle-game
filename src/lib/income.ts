/**
 * Clamps passive income against shared capacity, preserving the gold:ore ratio.
 * Pure function — no gameState access.
 */
export function clampPassiveIncome(
  earnedGold: number,
  earnedOre: number,
  currentGold: number,
  currentOre: number,
  maxCapacity: number,
): { gold: number; ore: number } {
  const available = maxCapacity - (currentGold + currentOre);

  if (available <= 0) return { gold: 0, ore: 0 };

  const total = earnedGold + earnedOre;
  if (total === 0) return { gold: 0, ore: 0 };

  if (total <= available) return { gold: earnedGold, ore: earnedOre };

  const ratio = earnedGold / total;
  return { gold: available * ratio, ore: available * (1 - ratio) };
}
