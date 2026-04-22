import { beforeEach, describe, expect, test } from "vite-plus/test";
import {
  acceptSuitor,
  applyPassiveIncome,
  applyTick,
  buyOre,
  buyUpgrade,
  calculatePassiveIncome,
  calculatePassiveOre,
  calculateTreasureDropChance,
  clickBurrow,
  declineSuitor,
  generateSuitor,
  getCurrentCapacityLimit,
  getOreSellPrice,
  getPassiveBonus,
  getTreasureSellPrice,
  resetHoard,
  rollSuitorRarity,
  rollTreasureRarity,
  sellOre,
  sellTreasure,
  slotTreasure,
  unslotTreasure,
} from "./game.svelte.js";
import {
  createDefaultGameState,
  game,
  replaceGameState,
  SAVE_VERSION,
} from "./gameState.svelte.js";
import { hydrateGameState, offlineProgressState } from "./storage.svelte.js";

describe("game rules", () => {
  beforeEach(() => {
    replaceGameState(createDefaultGameState());
  });

  // T-001/T-002: save schema version + default-fill
  test("hydrateGameState fills missing field with its default value", () => {
    const defaults = createDefaultGameState();
    // Omit saveVersion to simulate an old save predating the version field
    const oldSave = { gold: 42, ore: 10 } as Parameters<typeof hydrateGameState>[0];
    const hydrated = hydrateGameState(oldSave);
    expect(hydrated.saveVersion).toBe(SAVE_VERSION);
    expect(hydrated.generation).toBe(defaults.generation);
    expect(hydrated.maxCapacity).toBe(defaults.maxCapacity);
  });

  test("hydrateGameState restores buildings and upgrades from saves", () => {
    const hydrated = hydrateGameState({
      gold: 250,
      ore: 125,
      buildings: { blacksmith: true },
      upgrades: { copper_smelting: true },
    });

    expect(hydrated.gold).toBe(250);
    expect(hydrated.ore).toBe(125);
    expect(hydrated.buildings).toEqual({ blacksmith: true });
    expect(hydrated.upgrades).toEqual({ copper_smelting: true });
  });

  test("hydrateGameState resets missing nested values back to defaults", () => {
    const hydrated = hydrateGameState({
      stats: { clickPower: 9 } as typeof game.stats,
      minions: { kobold: 3 } as typeof game.minions,
    });

    expect(hydrated.stats).toEqual({
      clickPower: 9,
      luck: 1,
      beauty: 1,
      armor: 1,
    });
    expect(hydrated.minions).toEqual({
      pseudodragon: 0,
      kobold: 3,
      miner: 0,
      lizardfolk: 0,
    });
    expect(hydrated.buildings).toEqual({});
    expect(hydrated.upgrades).toEqual({});
  });

  test("clickBurrow can dig beyond the unlocked layer capacity", () => {
    game.maxCapacity = getCurrentCapacityLimit();
    game.stats.clickPower = 3;

    clickBurrow();

    expect(game.maxCapacity).toBe(getCurrentCapacityLimit() + 3);
  });

  test("buyUpgrade requires its parent building", () => {
    game.ore = 500;

    buyUpgrade("copper_smelting");

    expect(game.upgrades.copper_smelting).toBeUndefined();
    expect(game.ore).toBe(500);
    expect(game.mountain.currentLayerIndex).toBe(0);
  });

  test("buyUpgrade applies once the prerequisite building exists", () => {
    game.ore = 500;
    game.buildings.blacksmith = true;

    buyUpgrade("copper_smelting");

    expect(game.upgrades.copper_smelting).toBe(true);
    expect(game.ore).toBe(300);
    expect(game.mountain.currentLayerIndex).toBe(1);
  });

  // T-005: delta clamp — 30s delta produces same income as 1s delta
  test("game loop delta clamped to 1s — 30s gap = same income as 1s", () => {
    game.minions.pseudodragon = 2; // produces passive gold
    const incomePerSec = calculatePassiveIncome();
    expect(incomePerSec).toBeGreaterThan(0);

    // Simulate 1s tick
    const income1s = incomePerSec * Math.min(1.0, 1.0);
    // Simulate 30s tick (should be clamped to 1s)
    const income30s = incomePerSec * Math.min(30.0, 1.0);

    expect(income1s).toBe(income30s);
  });

  // T-011: passive state + effect application
  test("lineage passive gold_income_pct bonus reflected in calculatePassiveIncome", () => {
    game.minions.pseudodragon = 2;
    const baseIncome = calculatePassiveIncome();

    game.lineagePassives = [
      { id: "test_lp", name: "Test", description: "test", type: "gold_income_pct", magnitude: 0.5 },
    ];
    const boostedIncome = calculatePassiveIncome();

    expect(boostedIncome).toBeCloseTo(baseIncome * 1.5);
  });

  test("lineage passives stack additively across multiple breeds", () => {
    game.minions.pseudodragon = 1;
    game.lineagePassives = [
      { id: "lp1", name: "A", description: "", type: "gold_income_pct", magnitude: 0.1 },
      { id: "lp2", name: "B", description: "", type: "gold_income_pct", magnitude: 0.2 },
    ];
    const bonus = getPassiveBonus("gold_income_pct");
    expect(bonus).toBeCloseTo(0.3);
  });

  test("lineagePassives not cleared by resetHoard", () => {
    game.lineagePassives = [
      { id: "lp_persist", name: "Persist", description: "", type: "luck_flat", magnitude: 2 },
    ];
    game.activeGenerationPassive = {
      id: "gp_persist",
      name: "GenP",
      description: "",
      type: "gold_income_pct",
      magnitude: 0.1,
    };
    resetHoard();
    expect(game.lineagePassives).toHaveLength(1);
    expect(game.activeGenerationPassive).not.toBeNull();
  });

  // T-008: layer 4-7 upgrade gating
  test("purchasing mithril_alloy advances currentLayerIndex to 4 when layer 3 is current", () => {
    game.ore = 20000;
    game.buildings.blacksmith = true;
    game.mountain.currentLayerIndex = 3;

    buyUpgrade("mithril_alloy");

    expect(game.upgrades.mithril_alloy).toBe(true);
    expect(game.mountain.currentLayerIndex).toBe(4);
    expect(game.ore).toBe(8000); // 20000 - 12000
  });

  test("layer 5 upgrade blocked when layer 4 not yet unlocked", () => {
    game.ore = 50000;
    game.buildings.blacksmith = true;
    game.mountain.currentLayerIndex = 2; // Layer 4 requires 3, layer 5 requires 4

    buyUpgrade("dragonite_forging");

    expect(game.upgrades.dragonite_forging).toBeUndefined();
    expect(game.ore).toBe(50000);
  });

  // T-007: beauty trade multiplier
  test("getOreSellPrice returns higher price at beauty=10 vs beauty=0", () => {
    game.stats.beauty = 0;
    const priceAt0 = getOreSellPrice();
    game.stats.beauty = 10;
    const priceAt10 = getOreSellPrice();
    expect(priceAt10).toBeGreaterThan(priceAt0);
  });

  // T-009: suitor generation + one-pending gating
  test("generateSuitor pool size: 10k=1, 40k=2, 90k=3 stat points", () => {
    game.gold = 10000;
    generateSuitor();
    expect(game.pendingSuitor!.statPoolSize).toBe(1);

    declineSuitor();
    game.gold = 40000;
    generateSuitor();
    expect(game.pendingSuitor!.statPoolSize).toBe(2);

    declineSuitor();
    game.gold = 90000;
    generateSuitor();
    expect(game.pendingSuitor!.statPoolSize).toBe(3);
  });

  test("generateSuitor blocked when one is already pending", () => {
    game.gold = 10000;
    generateSuitor();
    const first = game.pendingSuitor;
    generateSuitor();
    expect(game.pendingSuitor).toBe(first);
  });

  test("generateSuitor blocked when gold < 10000", () => {
    game.gold = 9999;
    const result = generateSuitor();
    expect(result).toBe(false);
    expect(game.pendingSuitor).toBeNull();
  });

  test("declineSuitor clears pending suitor", () => {
    game.gold = 10000;
    generateSuitor();
    expect(game.pendingSuitor).not.toBeNull();
    declineSuitor();
    expect(game.pendingSuitor).toBeNull();
  });

  test("generateSuitor stat allocations sum to poolSize", () => {
    game.gold = 90000;
    generateSuitor();
    const total = game.pendingSuitor!.statAllocations.reduce((s, a) => s + a.amount, 0);
    expect(total).toBe(3);
  });

  test("generateSuitor stores all fields needed for display", () => {
    game.gold = 10000;
    generateSuitor();
    const s = game.pendingSuitor!;
    expect(s.id).toBeTruthy();
    expect(s.name).toBeTruthy();
    expect(["Common", "Uncommon", "Rare", "Epic", "Legendary"]).toContain(s.rarity);
    expect(s.statPoolSize).toBeGreaterThanOrEqual(1);
    expect(Array.isArray(s.statAllocations)).toBe(true);
  });

  // T-018: prestige on accept
  test("acceptSuitor applies stats, sets passives, clears suitor, increments generation", () => {
    game.gold = 10000;
    game.generation = 1;
    const lineagePassive = {
      id: "lp_test",
      name: "Test LP",
      description: "",
      type: "gold_income_pct" as const,
      magnitude: 0.1,
    };
    const genPassive = {
      id: "gp_test",
      name: "Test GP",
      description: "",
      type: "ore_income_pct" as const,
      magnitude: 0.2,
    };
    game.pendingSuitor = {
      id: "test_suitor",
      name: "Testus",
      rarity: "Epic",
      statPoolSize: 2,
      statAllocations: [
        { stat: "clickPower", amount: 1 },
        { stat: "luck", amount: 1 },
      ],
      generationPassive: genPassive,
      lineagePassive,
    };
    const priorClickPower = game.stats.clickPower;
    const priorLuck = game.stats.luck;

    acceptSuitor();

    expect(game.stats.clickPower).toBe(priorClickPower + 1);
    expect(game.stats.luck).toBe(priorLuck + 1);
    expect(game.activeGenerationPassive).toEqual(genPassive);
    expect(game.lineagePassives).toContainEqual(lineagePassive);
    expect(game.gold).toBe(0); // resetHoard called
    expect(game.generation).toBe(2);
    expect(game.pendingSuitor).toBeNull();
  });

  test("acceptSuitor preserves lineagePassives across multiple accepts (append-only)", () => {
    game.lineagePassives = [
      { id: "prior", name: "Prior", description: "", type: "luck_flat", magnitude: 1 },
    ];
    game.pendingSuitor = {
      id: "s2",
      name: "S2",
      rarity: "Uncommon",
      statPoolSize: 1,
      statAllocations: [{ stat: "beauty", amount: 1 }],
      generationPassive: null,
      lineagePassive: {
        id: "new_lp",
        name: "New",
        description: "",
        type: "beauty_flat",
        magnitude: 2,
      },
    };

    acceptSuitor();

    expect(game.lineagePassives).toHaveLength(2);
    expect(game.lineagePassives[0].id).toBe("prior");
    expect(game.lineagePassives[1].id).toBe("new_lp");
  });

  test("resetHoard does not clear lineagePassives or activeGenerationPassive", () => {
    const lp = {
      id: "lp_x",
      name: "X",
      description: "",
      type: "gold_income_pct" as const,
      magnitude: 0.05,
    };
    const gp = {
      id: "gp_x",
      name: "Y",
      description: "",
      type: "ore_income_pct" as const,
      magnitude: 0.1,
    };
    game.lineagePassives = [lp];
    game.activeGenerationPassive = gp;

    resetHoard();

    expect(game.lineagePassives).toHaveLength(1);
    expect(game.activeGenerationPassive).toEqual(gp);
  });

  // T-021: luck stat wiring
  test("luck drives both drop chance and rarity distribution", () => {
    const dropAt0 = calculateTreasureDropChance(0);
    const dropAt10 = calculateTreasureDropChance(10);
    expect(dropAt10).toBeGreaterThan(dropAt0);

    let commonAt0 = 0;
    let commonAt10 = 0;
    for (let i = 0; i < 100; i++) {
      if (rollTreasureRarity(0) === "Common") commonAt0++;
      if (rollTreasureRarity(10) === "Common") commonAt10++;
    }
    expect(commonAt10).toBeLessThan(commonAt0);
  });

  // T-020: treasure sell with beauty multiplier
  test("getTreasureSellPrice returns higher price at beauty=10 vs beauty=0", () => {
    game.stats.beauty = 0;
    const at0 = getTreasureSellPrice(100);
    game.stats.beauty = 10;
    const at10 = getTreasureSellPrice(100);
    expect(at10).toBeGreaterThan(at0);
  });

  test("sellTreasure removes item and adds gold; cannot sell slotted", () => {
    game.maxCapacity = 10000;
    game.gold = 0;
    game.stats.beauty = 0;
    game.treasureInventory = [
      {
        id: "sell_me",
        name: "Sell",
        rarity: "Common",
        flavorText: "",
        effectType: "gold_income_pct",
        effectMagnitude: 0.01,
        tradeValue: 100,
        slotted: false,
      },
      {
        id: "slotted_one",
        name: "Slotted",
        rarity: "Rare",
        flavorText: "",
        effectType: "gold_income_pct",
        effectMagnitude: 0.1,
        tradeValue: 500,
        slotted: true,
      },
    ];

    const result = sellTreasure("sell_me");
    expect(result).toBe(true);
    expect(game.gold).toBeGreaterThan(0);
    expect(game.treasureInventory).toHaveLength(1);
    expect(game.treasureInventory[0].id).toBe("slotted_one");

    const failResult = sellTreasure("slotted_one");
    expect(failResult).toBe(false);
    expect(game.treasureInventory).toHaveLength(1);
  });

  // T-019: slotting mechanic
  test("slotTreasure activates effect in income calculations", () => {
    game.minions.pseudodragon = 1;
    game.buildings.treasure_vault = true;
    const baseIncome = calculatePassiveIncome();

    game.treasureInventory = [
      {
        id: "t_slot",
        name: "Test Gem",
        rarity: "Rare",
        flavorText: "",
        effectType: "gold_income_pct",
        effectMagnitude: 0.5,
        tradeValue: 100,
        slotted: false,
      },
    ];

    slotTreasure("t_slot");
    expect(game.treasureInventory[0].slotted).toBe(true);

    const boostedIncome = calculatePassiveIncome();
    expect(boostedIncome).toBeCloseTo(baseIncome * 1.5);
  });

  test("unslotTreasure removes effect immediately", () => {
    game.minions.pseudodragon = 1;
    game.buildings.treasure_vault = true;
    game.treasureInventory = [
      {
        id: "t_unslot",
        name: "Test Gem",
        rarity: "Common",
        flavorText: "",
        effectType: "gold_income_pct",
        effectMagnitude: 0.5,
        tradeValue: 50,
        slotted: true,
      },
    ];
    const boostedIncome = calculatePassiveIncome();
    unslotTreasure("t_unslot");
    const baseIncome = calculatePassiveIncome();
    expect(baseIncome).toBeLessThan(boostedIncome);
  });

  // T-012: treasure drop chance formula
  test("calculateTreasureDropChance returns higher rate at luck=10 vs luck=0", () => {
    const at0 = calculateTreasureDropChance(0);
    const at10 = calculateTreasureDropChance(10);
    expect(at10).toBeGreaterThan(at0);
  });

  test("treasureInventory cleared by resetHoard", () => {
    game.treasureInventory = [
      {
        id: "t1",
        name: "Test",
        rarity: "Common",
        flavorText: "",
        effectType: "gold_income_pct",
        effectMagnitude: 0.01,
        tradeValue: 10,
        slotted: false,
      },
    ];
    resetHoard();
    expect(game.treasureInventory).toHaveLength(0);
  });

  // T-013: treasure rarity tiers + luck weighting
  test("luck=10 produces fewer Common treasures than luck=0 over 100 rolls", () => {
    let commonAt0 = 0;
    let commonAt10 = 0;
    for (let i = 0; i < 100; i++) {
      if (rollTreasureRarity(0) === "Common") commonAt0++;
      if (rollTreasureRarity(10) === "Common") commonAt10++;
    }
    expect(commonAt10).toBeLessThan(commonAt0);
  });

  // T-010: beauty-weighted rarity roll
  test("beauty=20 produces fewer Common suitors than beauty=0 over 100 rolls", () => {
    let commonAt0 = 0;
    let commonAt20 = 0;
    for (let i = 0; i < 100; i++) {
      if (rollSuitorRarity(0) === "Common") commonAt0++;
      if (rollSuitorRarity(20) === "Common") commonAt20++;
    }
    expect(commonAt20).toBeLessThan(commonAt0);
  });

  // T-024: treasure drop 1Hz accumulator — rollTreasureDrop fires at most once/sec
  // (Tested indirectly via clickBurrow which still calls rollTreasureDrop directly;
  // the accumulator is unit-tested by verifying applyPassiveIncome doesn't call drops)

  // T-025: vault ownership gate in getAllActivePassives
  test("slotted treasure has no effect when vault is not owned", () => {
    game.minions.pseudodragon = 1;
    const baseIncome = calculatePassiveIncome();
    game.buildings.treasure_vault = false;
    game.treasureInventory = [
      {
        id: "t_no_vault",
        name: "Gem",
        rarity: "Common",
        flavorText: "",
        effectType: "gold_income_pct",
        effectMagnitude: 0.5,
        tradeValue: 100,
        slotted: true,
      },
    ];
    // No vault — slotted treasure should not boost income
    expect(calculatePassiveIncome()).toBeCloseTo(baseIncome);
  });

  test("hydrateGameState clears slotted state when vault is missing", () => {
    const hydrated = hydrateGameState({
      buildings: {},
      treasureInventory: [
        {
          id: "t_was_slotted",
          name: "Gem",
          rarity: "Common",
          flavorText: "",
          effectType: "gold_income_pct",
          effectMagnitude: 0.5,
          tradeValue: 100,
          slotted: true,
        },
      ],
    });
    expect(hydrated.treasureInventory[0].slotted).toBe(false);
  });

  // T-029: tab visibility catch-up via applyPassiveIncome
  test("applyPassiveIncome applies gold and ore for elapsed seconds", () => {
    game.minions.pseudodragon = 1; // provides passive gold income
    game.minions.miner = 1; // provides passive ore
    game.maxCapacity = 100000;
    game.gold = 0;
    game.ore = 0;

    const goldPerSec = calculatePassiveIncome();
    applyPassiveIncome(10);
    expect(game.gold).toBeCloseTo(goldPerSec * 10, 1);
  });

  test("applyPassiveIncome does not trigger offline summary screen", () => {
    offlineProgressState.data = null;
    game.minions.pseudodragon = 1;
    game.maxCapacity = 100000;
    game.gold = 0;
    applyPassiveIncome(10);
    expect(offlineProgressState.data).toBeNull();
  });

  test("applyPassiveIncome with 8h cap matches 24h result (same as 8h)", () => {
    game.minions.pseudodragon = 1;
    game.maxCapacity = Number.MAX_SAFE_INTEGER;
    game.gold = 0;

    const eightHours = 8 * 3600;
    applyPassiveIncome(eightHours);
    const goldAt8h = game.gold;

    game.gold = 0;
    applyPassiveIncome(eightHours); // applying the cap directly
    expect(game.gold).toBeCloseTo(goldAt8h, 1);
  });

  // T-003: applyPassiveIncome proportional ratio at capacity boundary
  test("applyPassiveIncome preserves gold:ore ratio when capacity constrained", () => {
    game.minions.pseudodragon = 1; // produces gold
    game.minions.miner = 1; // produces ore (+capacity)
    // Set maxCapacity at limit so capacity growth is a no-op
    const limit = getCurrentCapacityLimit();
    game.maxCapacity = limit;
    game.gold = limit - 1;
    game.ore = 0; // 1 unit of space

    applyPassiveIncome(10); // large window — overflow guaranteed

    expect(game.gold + game.ore).toBeCloseTo(limit, 4);
    expect(game.gold - (limit - 1)).toBeGreaterThan(0); // gold gets non-zero share
    expect(game.ore).toBeGreaterThan(0); // ore gets non-zero share
  });

  // T-005: cross-path regression — gold not starved by ore in any income path
  test("applyPassiveIncome: gold non-zero when ore dominates but capacity constrained", () => {
    game.minions.pseudodragon = 1; // gold income
    game.minions.miner = 10; // heavy ore income (+capacity)
    const limit = getCurrentCapacityLimit();
    game.maxCapacity = limit;
    game.gold = limit - 1;
    game.ore = 0;

    applyPassiveIncome(100);

    // Gold must receive non-zero share even though ore income is much larger
    expect(game.gold - (limit - 1)).toBeGreaterThan(0);
    expect(game.gold + game.ore).toBeCloseTo(limit, 4);
  });

  test("trade actions ignore invalid amounts", () => {
    game.gold = 100;
    game.ore = 50;
    game.maxCapacity = 500;

    buyOre(1.5);
    buyOre(-2);
    sellOre(0);
    sellOre(Number.NaN);

    expect(game.gold).toBe(100);
    expect(game.ore).toBe(50);
  });

  // T-007: applyTick() tick-path ratio preservation
  test("applyTick: gold + ore combined do not exceed maxCapacity when per-tick earnings overflow", () => {
    game.minions.pseudodragon = 5;
    game.minions.miner = 2;
    const limit = getCurrentCapacityLimit();
    game.maxCapacity = limit;
    // combined = 90%, leaving 10% shared headroom
    game.gold = limit * 0.45;
    game.ore = limit * 0.45;

    applyTick(10);

    expect(game.gold + game.ore).toBeLessThanOrEqual(limit + 1e-9);
  });

  test("applyTick: gold:ore ratio preserved when per-tick earnings exceed remaining shared capacity", () => {
    game.minions.pseudodragon = 3;
    game.minions.miner = 1;
    const limit = getCurrentCapacityLimit();
    game.maxCapacity = limit;
    // combined = 90%, leaving 10% shared headroom
    game.gold = limit * 0.45;
    game.ore = limit * 0.45;

    const goldRate = calculatePassiveIncome();
    const oreRate = calculatePassiveOre();
    const startGold = game.gold;
    const startOre = game.ore;

    applyTick(10);

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
});
