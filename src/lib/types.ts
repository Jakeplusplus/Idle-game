export type GameStats = {
  clickPower: number;
  luck: number;
  beauty: number;
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
  gold: number;
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
