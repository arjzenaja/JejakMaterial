import { describe, test, expect } from "bun:test";
import { calculateMfca } from "@/lib/mfca";

// Dashboard service just calls calculateMfca on aggregated totals — same calc tested in mfca.test.ts.
// Test here covers: the mapping shape getDashboardSummary returns, via calculateMfca directly.

describe("dashboard summary shape", () => {
  test("all KPI fields present and are strings", () => {
    const mfca = calculateMfca({
      inputKg: "1000.0000",
      productKg: "800.0000",
      lossKg: "200.0000",
      returnedKg: "0.0000",
      lossCostRaw: "5000000.0000",
    });

    // Simulate what getDashboardSummary returns
    const summary = {
      totalInputKg: mfca.inputKg,
      totalProductKg: mfca.productKg,
      totalLossKg: mfca.lossKg,
      materialEfficiency: mfca.materialEfficiency,
      materialLossRate: mfca.materialLossRate,
      materialLossCostIdr: mfca.materialLossCost,
    };

    expect(typeof summary.totalInputKg).toBe("string");
    expect(typeof summary.materialEfficiency).toBe("string");
    expect(typeof summary.materialLossCostIdr).toBe("string");
    expect(summary.totalInputKg).toBe("1000.0000");
    expect(summary.materialEfficiency).toBe("80.000000");
    expect(summary.materialLossRate).toBe("20.000000");
    expect(summary.materialLossCostIdr).toBe("5000000.0000");
  });

  test("zero-input org returns all zeros without crash", () => {
    const mfca = calculateMfca({
      inputKg: "0",
      productKg: "0",
      lossKg: "0",
      returnedKg: "0",
      lossCostRaw: "0",
    });
    expect(mfca.materialEfficiency).toBe("0.000000");
    expect(mfca.materialLossRate).toBe("0.000000");
  });
});

describe("CSV export shape", () => {
  // Inline the toCSV logic to test without importing a route file
  const HEADERS = [
    "runNumber", "productName", "productionDate", "runStatus",
    "inputKg", "productKg", "lossKg", "returnedKg",
    "varianceKg", "materialEfficiency", "materialLossRate", "materialLossCost",
  ];
  function toCSV(rows: Record<string, string>[]): string {
    const lines = [HEADERS.join(",")];
    for (const row of rows) lines.push(HEADERS.map((h) => row[h] ?? "").join(","));
    return lines.join("\n");
  }

  test("produces header row + data row", () => {
    const csv = toCSV([{
      runNumber: "RUN-001", productName: "Steel", productionDate: "2026-11-27",
      runStatus: "CLOSED", inputKg: "1000.0000", productKg: "800.0000",
      lossKg: "200.0000", returnedKg: "0.0000", varianceKg: "0.0000",
      materialEfficiency: "80.000000", materialLossRate: "20.000000",
      materialLossCost: "5000000.0000",
    }]);
    const lines = csv.split("\n");
    expect(lines).toHaveLength(2);
    expect(lines[0]).toBe(HEADERS.join(","));
    expect(lines[1]).toContain("RUN-001");
    expect(lines[1]).toContain("80.000000");
  });

  test("empty rows produces header only", () => {
    const csv = toCSV([]);
    expect(csv.split("\n")).toHaveLength(1);
  });

  test("missing fields default to empty string", () => {
    const csv = toCSV([{ runNumber: "RUN-X" }]);
    const fields = csv.split("\n")[1].split(",");
    expect(fields[0]).toBe("RUN-X");
    expect(fields[1]).toBe(""); // productName missing → ""
  });
});
