import type { MinionConfig } from "../types.js";

export const MINIONS: MinionConfig[] = [
  {
    id: "pseudodragon",
    name: "Pseudodragon",
    baseCost: 10,
    description: "+0.1 gold/sec",
    goldPerSec: 0.1,
  },
  {
    id: "miner",
    name: "Kobold Miner",
    baseCost: 20,
    description: "+0.1 capacity/sec, finds Ore & Treasures",
    capacityPerSec: 0.1,
    orePerSec: 0.05,
  },
  { id: "kobold", name: "Kobold", baseCost: 100, description: "+1 gold/sec", goldPerSec: 1 },
  {
    id: "lizardfolk",
    name: "Lizardfolk",
    baseCost: 1000,
    description: "+5 gold/sec",
    goldPerSec: 5,
  },
];
