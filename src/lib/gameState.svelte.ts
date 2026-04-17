import type { GameState } from "./types.js";
import { generateFantasyName } from "./names.js";

export const SAVE_VERSION = 1;

export function createDefaultGameState(): GameState {
  return {
    saveVersion: SAVE_VERSION,
    gold: 0,
    activeGenerationPassive: null,
    lineagePassives: [],
    pendingSuitor: null,
    treasureInventory: [],
    maxCapacity: 0, // Miners will dig this up towards the initial layout limit
    ore: 0,
    generation: 1,
    dragonName: generateFantasyName("dragon"),
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
      name: generateFantasyName("mountain"),
      coordinates: { x: 0, y: 0 },
      currentLayerIndex: 0,
    },
    buildings: {},
    upgrades: {},
    lastSaveTime: Date.now(),
  };
}

export function replaceGameState(nextState: GameState) {
  game.saveVersion = nextState.saveVersion;
  game.activeGenerationPassive = nextState.activeGenerationPassive;
  game.lineagePassives = nextState.lineagePassives;
  game.pendingSuitor = nextState.pendingSuitor;
  game.treasureInventory = nextState.treasureInventory;
  game.gold = nextState.gold;
  game.maxCapacity = nextState.maxCapacity;
  game.ore = nextState.ore;
  game.generation = nextState.generation;
  game.dragonName = nextState.dragonName;
  game.stats = nextState.stats;
  game.minions = nextState.minions;
  game.mountain = nextState.mountain;
  game.buildings = nextState.buildings;
  game.upgrades = nextState.upgrades;
  game.lastSaveTime = nextState.lastSaveTime;
}

export const game = $state<GameState>(createDefaultGameState());
