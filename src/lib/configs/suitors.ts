import type { SuitorRarity } from "../types.js";

// Base rarity weights before beauty adjustment.
// T-010 applies per-beauty-point bonus to non-Common tiers via SUITOR_BEAUTY_WEIGHT_BONUS.
export const SUITOR_RARITY_WEIGHTS: Record<SuitorRarity, number> = {
  Common: 60,
  Uncommon: 25,
  Rare: 10,
  Epic: 4,
  Legendary: 1,
};

// Added to each non-Common tier weight per beauty point (T-010 wiring).
export const SUITOR_BEAUTY_WEIGHT_BONUS = 0.5;
