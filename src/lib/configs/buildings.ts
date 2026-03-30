import type { BuildingConfig } from "../types.js";

export const BUILDINGS: BuildingConfig[] = [
  {
    id: "blacksmith",
    name: "Blacksmith",
    goldCost: 500,
    description:
      "A roaring furnace dedicated to metallurgy. Smelts harder materials capable of piercing deeper into the mountain's bedrock.",
  },
  {
    id: "invention_lab",
    name: "Invention Lab",
    goldCost: 1500,
    description:
      "A workshop dedicated to Kobold engineering. Unlocks blueprints that drastically improve physical excavation speeds.",
  },
  {
    id: "hatchery",
    name: "Hatchery",
    goldCost: 4000,
    description:
      "A furnace-warm nursery chamber for eggs and heirs. Unlocks the Bloodline wing where future generations are prepared.",
  },
  // We can add more buildings later like "Treasure Vault"
];
