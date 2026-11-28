import { getDashboardTotals, getRunsWithTotals } from "@/server/repositories/dashboard.repository";
import { calculateMfca } from "@/lib/mfca";

export async function getDashboardSummary(
  organizationId: string,
  from?: string,
  to?: string,
) {
  const totals = await getDashboardTotals(organizationId, from, to);
  const mfca = calculateMfca({
    inputKg: totals.inputKg,
    productKg: totals.productKg,
    lossKg: totals.lossKg,
    returnedKg: totals.returnedKg,
    lossCostRaw: totals.lossCostRaw,
  });

  return {
    totalInputKg: mfca.inputKg,
    totalProductKg: mfca.productKg,
    totalLossKg: mfca.lossKg,
    materialEfficiency: mfca.materialEfficiency,
    materialLossRate: mfca.materialLossRate,
    materialLossCostIdr: mfca.materialLossCost,
    productionRuns: totals.productionRuns,
  };
}

export async function getMfcaReport(
  organizationId: string,
  from?: string,
  to?: string,
) {
  const rows = await getRunsWithTotals(organizationId, from, to);
  return rows.map((row) => {
    const mfca = calculateMfca({
      inputKg: row.inputKg,
      productKg: row.productKg,
      lossKg: row.lossKg,
      returnedKg: row.returnedKg,
      lossCostRaw: row.lossCostRaw,
    });
    return {
      id: row.id,
      runNumber: row.runNumber,
      productName: row.productName,
      productionDate: row.productionDate,
      runStatus: row.runStatus,
      ...mfca,
    };
  });
}
