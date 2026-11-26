import { describe, test, expect } from "bun:test";
import { flowEntrySchema, createFlowsSchema } from "@/lib/validation";

describe("flowEntrySchema", () => {
  test("accepts valid INPUT entry", () => {
    const result = flowEntrySchema.safeParse({
      materialId: "550e8400-e29b-41d4-a716-446655440000",
      flowType: "INPUT",
      quantityKg: 100,
      unitCostPerKg: 25000,
    });
    expect(result.success).toBe(true);
  });

  test("accepts LOSS with wasteCategory", () => {
    const result = flowEntrySchema.safeParse({
      flowType: "LOSS",
      quantityKg: 5,
      unitCostPerKg: 0,
      wasteCategory: "evaporation",
    });
    expect(result.success).toBe(true);
  });

  test("accepts null materialId", () => {
    const result = flowEntrySchema.safeParse({
      materialId: null,
      flowType: "PRODUCT",
      quantityKg: 90,
      unitCostPerKg: 30000,
    });
    expect(result.success).toBe(true);
  });

  test("rejects zero quantityKg", () => {
    const result = flowEntrySchema.safeParse({
      flowType: "INPUT",
      quantityKg: 0,
      unitCostPerKg: 100,
    });
    expect(result.success).toBe(false);
  });

  test("rejects negative quantityKg", () => {
    const result = flowEntrySchema.safeParse({
      flowType: "INPUT",
      quantityKg: -5,
      unitCostPerKg: 100,
    });
    expect(result.success).toBe(false);
  });

  test("rejects negative unitCostPerKg", () => {
    const result = flowEntrySchema.safeParse({
      flowType: "INPUT",
      quantityKg: 10,
      unitCostPerKg: -1,
    });
    expect(result.success).toBe(false);
  });

  test("accepts zero unitCostPerKg", () => {
    const result = flowEntrySchema.safeParse({
      flowType: "LOSS",
      quantityKg: 2,
      unitCostPerKg: 0,
    });
    expect(result.success).toBe(true);
  });

  test("rejects invalid flowType", () => {
    const result = flowEntrySchema.safeParse({
      flowType: "WASTE",
      quantityKg: 10,
      unitCostPerKg: 100,
    });
    expect(result.success).toBe(false);
  });

  test("accepts all four flowType values", () => {
    for (const ft of ["INPUT", "PRODUCT", "LOSS", "RETURNED"]) {
      const result = flowEntrySchema.safeParse({
        flowType: ft,
        quantityKg: 1,
        unitCostPerKg: 0,
      });
      expect(result.success).toBe(true);
    }
  });
});

describe("createFlowsSchema", () => {
  test("requires at least 1 entry", () => {
    const result = createFlowsSchema.safeParse({ entries: [] });
    expect(result.success).toBe(false);
  });

  test("accepts 1 entry", () => {
    const result = createFlowsSchema.safeParse({
      entries: [{ flowType: "INPUT", quantityKg: 10, unitCostPerKg: 100 }],
    });
    expect(result.success).toBe(true);
  });

  test("rejects missing entries", () => {
    const result = createFlowsSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
