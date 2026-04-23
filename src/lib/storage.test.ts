import { beforeEach, expect, test, vi } from "vite-plus/test";
import {
  calculatePassiveIncome,
  calculatePassiveOre,
  getCurrentCapacityLimit,
} from "./game.svelte.js";
import { createDefaultGameState, game, replaceGameState } from "./gameState.svelte.js";
import { applyOfflineIncome } from "./storage.svelte.js";

vi.mock("$app/environment", () => ({ browser: true }));

beforeEach(() => {
  replaceGameState(createDefaultGameState());
});

test("applyOfflineIncome: gold + ore do not exceed maxCapacity after large elapsed", () => {
  game.minions.pseudodragon = 5;
  game.minions.miner = 2;
  const limit = getCurrentCapacityLimit();
  game.maxCapacity = limit;
  // Use shared-capacity model: gold + ore must be < limit to have any headroom
  game.gold = limit * 0.45;
  game.ore = limit * 0.45; // combined = 90%, leaving 10% headroom

  applyOfflineIncome(10000);

  // Neither resource should exceed limit
  expect(game.gold).toBeLessThanOrEqual(limit + 1e-9);
  expect(game.ore).toBeLessThanOrEqual(limit + 1e-9);
  // Combined must not exceed shared capacity
  expect(game.gold + game.ore).toBeLessThanOrEqual(limit + 1e-9);
});

test("applyOfflineIncome: gold:ore ratio preserved when capacity constrained", () => {
  game.minions.pseudodragon = 3;
  game.minions.miner = 1;
  const limit = getCurrentCapacityLimit();
  game.maxCapacity = limit;
  // combined = 90% of limit, leaving 10% shared headroom
  game.gold = limit * 0.45;
  game.ore = limit * 0.45;

  const goldRate = calculatePassiveIncome();
  const oreRate = calculatePassiveOre();
  const startGold = game.gold;
  const startOre = game.ore;

  applyOfflineIncome(10000);

  const deltaGold = game.gold - startGold;
  const deltaOre = game.ore - startOre;
  const total = deltaGold + deltaOre;

  expect(total).toBeGreaterThan(0);
  expect(deltaGold).toBeGreaterThan(0);
  expect(deltaOre).toBeGreaterThan(0);

  if (goldRate + oreRate > 0) {
    const actualRatio = deltaGold / total;
    const expectedRatio = goldRate / (goldRate + oreRate);
    expect(actualRatio).toBeCloseTo(expectedRatio, 3);
  }
});

// T-009: R2 — returned goldEarned/oreEarned reflect post-clamp applied amounts, not raw earnings
test("applyOfflineIncome: returned gold and ore equal actual applied amounts when capacity constrained", () => {
  game.minions.pseudodragon = 3;
  game.minions.miner = 1;
  const limit = getCurrentCapacityLimit();
  game.maxCapacity = limit;
  game.gold = limit * 0.45;
  game.ore = limit * 0.45; // 90% full, 10% headroom

  const goldRate = calculatePassiveIncome();
  const oreRate = calculatePassiveOre();
  const startGold = game.gold;
  const startOre = game.ore;

  const result = applyOfflineIncome(10000);

  // result must equal what was actually applied, not raw earnings
  expect(result.gold).toBeCloseTo(game.gold - startGold, 6);
  expect(result.ore).toBeCloseTo(game.ore - startOre, 6);

  // raw earnings would be far larger — confirm result is clamped
  const rawGold = goldRate * 10000;
  const rawOre = oreRate * 10000;
  expect(result.gold).toBeLessThan(rawGold);
  expect(result.ore).toBeLessThan(rawOre);
});

// T-008: offline-path regression — gold not starved by ore when capacity constrained
test("applyOfflineIncome: gold non-zero when ore income dominates but capacity constrained", () => {
  game.minions.pseudodragon = 1;
  game.minions.miner = 10;
  const limit = getCurrentCapacityLimit();
  game.maxCapacity = limit;
  game.gold = limit * 0.9;
  game.ore = 0;
  const startGold = game.gold;

  applyOfflineIncome(10000);

  expect(game.gold - startGold).toBeGreaterThan(0);
  expect(game.gold + game.ore).toBeCloseTo(limit, 4);
});
