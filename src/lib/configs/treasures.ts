import type { TreasureRarity, PassiveEffectType } from "../types.js";

// Drop chance: baseTreasureChance * (1 + luck * LUCK_MULTIPLIER)
export const BASE_TREASURE_CHANCE = 0.01;
export const LUCK_MULTIPLIER = 0.1;

// Base rarity weights before luck adjustment.
export const TREASURE_RARITY_WEIGHTS: Record<TreasureRarity, number> = {
  Common: 60,
  Uncommon: 25,
  Rare: 12,
  Legendary: 3,
};

// Per-luck-point bonus weight added to non-Common tiers.
export const TREASURE_LUCK_WEIGHT_BONUS = 0.3;

export type TreasureDefinition = {
  name: string;
  rarity: TreasureRarity;
  flavorText: string;
  effectType: PassiveEffectType;
  effectMagnitude: number;
  tradeValue: number;
};

// Config-driven treasure definitions grouped by rarity.
export const TREASURE_POOLS: Record<TreasureRarity, TreasureDefinition[]> = {
  Common: [
    {
      name: "Quartz Shard",
      rarity: "Common",
      flavorText: "A rough crystal fragment. Faintly warm to the touch.",
      effectType: "gold_income_pct",
      effectMagnitude: 0.03,
      tradeValue: 50,
    },
    {
      name: "Copper Nugget",
      rarity: "Common",
      flavorText: "Dense and heavy — a small fortune in base metal.",
      effectType: "gold_income_pct",
      effectMagnitude: 0.02,
      tradeValue: 30,
    },
  ],
  Uncommon: [
    {
      name: "Moonstone",
      rarity: "Uncommon",
      flavorText: "Glows faintly at night. The miners like it.",
      effectType: "ore_income_pct",
      effectMagnitude: 0.08,
      tradeValue: 150,
    },
    {
      name: "Iron Geode",
      rarity: "Uncommon",
      flavorText: "A hollow stone lined with ore crystals.",
      effectType: "ore_income_pct",
      effectMagnitude: 0.06,
      tradeValue: 120,
    },
  ],
  Rare: [
    {
      name: "Dragon Eye Ruby",
      rarity: "Rare",
      flavorText: "A deep red gem that seems to watch you.",
      effectType: "click_power_flat",
      effectMagnitude: 2,
      tradeValue: 500,
    },
    {
      name: "Clover Emerald",
      rarity: "Rare",
      flavorText: "Four-leafed inclusions. Uncommonly lucky.",
      effectType: "luck_flat",
      effectMagnitude: 2,
      tradeValue: 400,
    },
  ],
  Legendary: [
    {
      name: "Heart of the Mountain",
      rarity: "Legendary",
      flavorText: "Pulses with ancient draconic resonance.",
      effectType: "gold_income_pct",
      effectMagnitude: 0.3,
      tradeValue: 2000,
    },
    {
      name: "Ancient Dragon Bone",
      rarity: "Legendary",
      flavorText: "A relic from a wyrm long dead. Still radiates power.",
      effectType: "click_power_flat",
      effectMagnitude: 5,
      tradeValue: 1800,
    },
  ],
};
