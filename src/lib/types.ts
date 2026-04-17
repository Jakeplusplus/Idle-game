export type GameStats = {
  clickPower: number;
  luck: number;
  beauty: number;
  // Armor activates with the future map system — excluded from suitor stat pool until then.
  armor: number;
};

export type Minions = {
  pseudodragon: number;
  kobold: number;
  miner: number;
  lizardfolk: number;
};

export type MinionConfig = {
  id: keyof Minions;
  name: string;
  baseCost: number;
  description: string;
  goldPerSec?: number;
  orePerSec?: number;
  capacityPerSec?: number;
};

export type MountainLayer = {
  name: string;
  maxCapacity: number;
};

export type Mountain = {
  name: string;
  coordinates: { x: number; y: number };
  currentLayerIndex: number;
};

export type GameState = {
  saveVersion: number;
  gold: number;
  // Passives — NOT cleared by resetHoard()
  activeGenerationPassive: PassiveEffect | null;
  lineagePassives: PassiveEffect[];
  maxCapacity: number;
  ore: number;
  generation: number;
  dragonName: string;
  stats: GameStats;
  minions: Minions;
  mountain: Mountain;
  buildings: Record<string, boolean>;
  upgrades: Record<string, boolean>;
  lastSaveTime: number;
};

export type PassiveEffectType =
  | "gold_income_pct" // adds % multiplier to passive gold income
  | "ore_income_pct" // adds % multiplier to passive ore income
  | "click_power_flat" // flat bonus to click power
  | "luck_flat" // flat bonus to luck
  | "beauty_flat"; // flat bonus to beauty

export type PassiveEffect = {
  id: string;
  name: string;
  description: string;
  type: PassiveEffectType;
  magnitude: number; // pct types: 0.10 = 10%; flat types: absolute value
};

export type BuildingConfig = {
  id: string;
  name: string;
  goldCost: number;
  description: string;
};

export type UpgradeConfig = {
  id: string;
  buildingId: string;
  name: string;
  oreCost: number;
  effect: string;
  capacityMultiplier?: number;
  description: string;
};
