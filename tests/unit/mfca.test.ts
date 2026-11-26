import { describe, test, expect } from "bun:test";
import { calculateMfca } from "@/lib/mfca";

describe("calculateMfca", () => {
  // Reference example from backend.md acceptance: input 1000, product 800, loss 200 @ 25000
  test("reference example: eff=80, lossRate=20, lossCost=5000000, variance=0", () => {
    const r = calculateMfca({
      inputKg: "1000.0000",
      productKg: "800.0000",
      lossKg: "200.0000",
      returnedKg: "0.0000",
      lossCostRaw: "5000000.0000",
    });
    expect(r.varianceKg).toBe("0.0000");
    expect(r.materialEfficiency).toBe("80.000000");
    expect(r.materialLossRate).toBe("20.000000");
    expect(r.materialLossCost).toBe("5000000.0000");
  });

  test("zero inputKg → efficiency and lossRate are 0, no division by zero", () => {
    const r = calculateMfca({
      inputKg: "0.0000",
      productKg: "0.0000",
      lossKg: "0.0000",
      returnedKg: "0.0000",
      lossCostRaw: "0",
    });
    expect(r.materialEfficiency).toBe("0.000000");
    expect(r.materialLossRate).toBe("0.000000");
    expect(r.varianceKg).toBe("0.0000");
  });

  test("partial flows: only INPUT and PRODUCT, no LOSS", () => {
    const r = calculateMfca({
      inputKg: "500.0000",
      productKg: "500.0000",
      lossKg: "0.0000",
      returnedKg: "0.0000",
      lossCostRaw: "0",
    });
    expect(r.materialEfficiency).toBe("100.000000");
    expect(r.materialLossRate).toBe("0.000000");
    expect(r.varianceKg).toBe("0.0000");
  });

  test("positive variance when outputs < input", () => {
    const r = calculateMfca({
      inputKg: "100.0000",
      productKg: "80.0000",
      lossKg: "10.0000",
      returnedKg: "0.0000",
      lossCostRaw: "0",
    });
    expect(r.varianceKg).toBe("10.0000");
    expect(r.materialEfficiency).toBe("80.000000");
    expect(r.materialLossRate).toBe("10.000000");
  });

  test("returned flows reduce variance", () => {
    const r = calculateMfca({
      inputKg: "100.0000",
      productKg: "80.0000",
      lossKg: "10.0000",
      returnedKg: "10.0000",
      lossCostRaw: "250000.0000",
    });
    expect(r.varianceKg).toBe("0.0000");
    expect(r.materialLossCost).toBe("250000.0000");
  });

  test("fractional efficiency without float rounding error", () => {
    // 1/3 = 33.333333...
    const r = calculateMfca({
      inputKg: "3.0000",
      productKg: "1.0000",
      lossKg: "0.0000",
      returnedKg: "0.0000",
      lossCostRaw: "0",
    });
    // BigInt division truncates: (1 * 1000000 * 100) / 3 = 33333333 → 33.333333
    expect(r.materialEfficiency).toBe("33.333333");
  });
});
