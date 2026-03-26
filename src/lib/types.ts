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

export type MountainLayer = {
  name: string;
  maxCapacity: number;
};

export type Mountain = {
  coordinates: { x: number; y: number };
  currentLayerIndex: number;
};

export type GameState = {
  gold: number;
  maxGoldCapacity: number;
  ore: number;
  generation: number;
  stats: GameStats;
  minions: Minions;
  mountain: Mountain;
  treasuresFound: number;
  lastSaveTime: number;
};
