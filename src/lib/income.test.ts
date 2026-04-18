import { describe, expect, test } from "vite-plus/test";
import { clampPassiveIncome } from "./income.js";

describe("clampPassiveIncome", () => {
  test("at full capacity returns zero/zero", () => {
    const r = clampPassiveIncome(10, 5, 50, 50, 100);
    expect(r.gold).toBeCloseTo(0, 6);
    expect(r.ore).toBeCloseTo(0, 6);
  });

  test("earnings fit — pass-through unchanged", () => {
    const r = clampPassiveIncome(10, 5, 0, 0, 100);
    expect(r.gold).toBeCloseTo(10, 6);
    expect(r.ore).toBeCloseTo(5, 6);
  });

  test("earnings exceed available — sum == available, ratio preserved", () => {
    const r = clampPassiveIncome(60, 40, 0, 0, 50);
    expect(r.gold + r.ore).toBeCloseTo(50, 6);
    expect(r.gold / (r.gold + r.ore)).toBeCloseTo(60 / 100, 6);
  });

  test("gold-only overflow — applied gold = available, ore = 0", () => {
    const r = clampPassiveIncome(100, 0, 80, 0, 100);
    expect(r.gold).toBeCloseTo(20, 6);
    expect(r.ore).toBeCloseTo(0, 6);
  });

  test("ore-only overflow — applied ore = available, gold = 0", () => {
    const r = clampPassiveIncome(0, 100, 0, 80, 100);
    expect(r.gold).toBeCloseTo(0, 6);
    expect(r.ore).toBeCloseTo(20, 6);
  });

  test("zero earnings — returns zero/zero, no NaN", () => {
    const r = clampPassiveIncome(0, 0, 0, 0, 100);
    expect(r.gold).toBeCloseTo(0, 6);
    expect(r.ore).toBeCloseTo(0, 6);
  });

  test("proportional scaling: earned=60g+40o, available=50 → gold=30, ore=20", () => {
    const r = clampPassiveIncome(60, 40, 0, 0, 50);
    expect(r.gold).toBeCloseTo(30, 6);
    expect(r.ore).toBeCloseTo(20, 6);
  });
});
