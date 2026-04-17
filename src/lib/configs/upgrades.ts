import type { UpgradeConfig } from "../types.js";

export const UPGRADES: UpgradeConfig[] = [
  // Blacksmith (Metallurgy -> Strata Unlocks)
  {
    id: "copper_smelting",
    buildingId: "blacksmith",
    name: "Copper Smelting",
    oreCost: 200,
    effect: "unlock_layer_1",
    description:
      "Pierce the impenetrable dirt floor and mine directly down into the Shale Stratum.",
  },
  {
    id: "iron_smelting",
    buildingId: "blacksmith",
    name: "Iron Smelting",
    oreCost: 800,
    effect: "unlock_layer_2",
    description: "Crush through the heavy rocks and mine steadily into the Marble Stratum.",
  },
  {
    id: "steel_forging",
    buildingId: "blacksmith",
    name: "Steel Forging",
    oreCost: 3500,
    effect: "unlock_layer_3",
    description: "Precision alloys allow Kobolds to bore safely into the Slate Stratum.",
  },
  {
    id: "mithril_alloy",
    buildingId: "blacksmith",
    name: "Mithril Alloy",
    oreCost: 12000,
    effect: "unlock_layer_4",
    description: "Lightweight mithril-tipped tools slice through Limestone without fatigue.",
  },
  {
    id: "dragonite_forging",
    buildingId: "blacksmith",
    name: "Dragonite Forging",
    oreCost: 40000,
    effect: "unlock_layer_5",
    description: "Dragonfire-tempered drills bite into solid Granite with ease.",
  },
  {
    id: "volcanic_boring",
    buildingId: "blacksmith",
    name: "Volcanic Boring",
    oreCost: 120000,
    effect: "unlock_layer_6",
    description: "Magma-channeling bore heads cut through dense Basalt formations.",
  },
  {
    id: "obsidian_shattering",
    buildingId: "blacksmith",
    name: "Obsidian Shattering",
    oreCost: 350000,
    effect: "unlock_layer_7",
    description: "Resonance fracturing cracks the deepest Obsidian seam in the mountain's core.",
  },

  // Invention Lab (Engineering -> Excavation Rate Multipliers)
  {
    id: "ergonomic_shovels",
    buildingId: "workshop",
    name: "Ergonomic Shovels",
    oreCost: 500,
    effect: "capacity_boost",
    capacityMultiplier: 0.5,
    description: "Optimized shovel designs boost your Miners' excavation rate by 50%.",
  },
  {
    id: "reinforced_pickaxes",
    buildingId: "workshop",
    name: "Reinforced Pickaxes",
    oreCost: 2000,
    effect: "capacity_boost",
    capacityMultiplier: 1.0,
    description: "Heavy-duty pickaxes improve base digging speed by an additional 100%.",
  },
  {
    id: "steam_rotary_drills",
    buildingId: "workshop",
    name: "Steam Rotary Drills",
    oreCost: 10000,
    effect: "capacity_boost",
    capacityMultiplier: 3.0,
    description:
      "Mechanized drilling equipment multiplies overall excavation speed by another 300%.",
  },
];
