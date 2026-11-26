import { describe, test, expect } from "bun:test";
import { calculateBalance } from "@/lib/balance";

describe("calculateBalance", () => {
  test("balanced when input equals product+loss+returned", () => {
    const r = calculateBalance({
      inputKg: "100.0000",
      productKg: "90.0000",
      lossKg: "5.0000",
      returnedKg: "5.0000",
    });
    expect(r.varianceKg).toBe("0.0000");
    expect(r.balanced).toBe(true);
  });

  test("unbalanced (positive variance)", () => {
    const r = calculateBalance({
      inputKg: "100.0000",
      productKg: "90.0000",
      lossKg: "5.0000",
      returnedKg: "0.0000",
    });
    expect(r.varianceKg).toBe("5.0000");
    expect(r.balanced).toBe(false);
  });

  test("unbalanced (negative variance)", () => {
    const r = calculateBalance({
      inputKg: "90.0000",
      productKg: "95.0000",
      lossKg: "0.0000",
      returnedKg: "0.0000",
    });
    expect(r.varianceKg).toBe("-5.0000");
    expect(r.balanced).toBe(false);
  });

  test("handles fractional quantities without float error", () => {
    const r = calculateBalance({
      inputKg: "0.1000",
      productKg: "0.0500",
      lossKg: "0.0500",
      returnedKg: "0.0000",
    });
    expect(r.varianceKg).toBe("0.0000");
    expect(r.balanced).toBe(true);
  });

  test("handles values without trailing zeros", () => {
    const r = calculateBalance({
      inputKg: "100",
      productKg: "90",
      lossKg: "5",
      returnedKg: "5",
    });
    expect(r.varianceKg).toBe("0.0000");
    expect(r.balanced).toBe(true);
  });
});