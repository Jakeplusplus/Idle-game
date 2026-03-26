import type { GameState } from "./types.js";

export const game = $state<GameState>({
  gold: 0,
  maxGoldCapacity: 100, // There's always a base 500 gold capacity
  ore: 0,
  generation: 1,
  stats: {
    clickPower: 1,
    luck: 1,
    beauty: 1,
    armor: 1,
  },
  minions: {
    pseudodragon: 0,
    kobold: 0,
    miner: 0,
    lizardfolk: 0,
  },
  mountain: {
    coordinates: { x: 0, y: 0 },
    currentLayerIndex: 0,
  },
  treasuresFound: 0,
  lastSaveTime: Date.now(),
});
