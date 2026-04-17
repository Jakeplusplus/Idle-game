import type { PassiveEffect } from "../types.js";

// Lineage passive pools — drawn from when Uncommon/Rare/Epic/Legendary suitors accepted.
// Lineage passives stack additively across generations and are never cleared.
export const LINEAGE_PASSIVE_POOLS: Record<string, PassiveEffect[]> = {
  small: [
    {
      id: "lp_gold_sm",
      name: "Gilded Veins",
      description: "+5% passive gold income",
      type: "gold_income_pct",
      magnitude: 0.05,
    },
    {
      id: "lp_ore_sm",
      name: "Stone Hunger",
      description: "+5% passive ore income",
      type: "ore_income_pct",
      magnitude: 0.05,
    },
    {
      id: "lp_luck_sm",
      name: "Sharp Eyes",
      description: "+1 Luck",
      type: "luck_flat",
      magnitude: 1,
    },
  ],
  medium: [
    {
      id: "lp_gold_md",
      name: "Hoardsong",
      description: "+12% passive gold income",
      type: "gold_income_pct",
      magnitude: 0.12,
    },
    {
      id: "lp_ore_md",
      name: "Deep Claws",
      description: "+12% passive ore income",
      type: "ore_income_pct",
      magnitude: 0.12,
    },
    {
      id: "lp_beauty_md",
      name: "Lustrous Scales",
      description: "+2 Beauty",
      type: "beauty_flat",
      magnitude: 2,
    },
  ],
  strong: [
    {
      id: "lp_gold_lg",
      name: "Dragon's Fortune",
      description: "+25% passive gold income",
      type: "gold_income_pct",
      magnitude: 0.25,
    },
    {
      id: "lp_click_lg",
      name: "Ancestral Might",
      description: "+3 Click Power",
      type: "click_power_flat",
      magnitude: 3,
    },
    {
      id: "lp_luck_lg",
      name: "Wyrmblood Sight",
      description: "+3 Luck",
      type: "luck_flat",
      magnitude: 3,
    },
  ],
};

// Generation passive pools — active for current generation only, replaced on next breed.
export const GENERATION_PASSIVE_POOLS: Record<string, PassiveEffect[]> = {
  medium: [
    {
      id: "gp_gold_md",
      name: "Blazing Greed",
      description: "+20% gold income this generation",
      type: "gold_income_pct",
      magnitude: 0.2,
    },
    {
      id: "gp_ore_md",
      name: "Iron Gaze",
      description: "+20% ore income this generation",
      type: "ore_income_pct",
      magnitude: 0.2,
    },
  ],
  strong: [
    {
      id: "gp_gold_lg",
      name: "Infernal Hunger",
      description: "+40% gold income this generation",
      type: "gold_income_pct",
      magnitude: 0.4,
    },
    {
      id: "gp_click_lg",
      name: "Draconic Fury",
      description: "+5 Click Power this generation",
      type: "click_power_flat",
      magnitude: 5,
    },
  ],
};
