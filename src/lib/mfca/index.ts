// shortcut: BigInt integer math for efficiency/lossRate (scale 6 decimals), no decimal.js — upgrade if sub-0.0001% precision needed

const SCALE4 = 10000n;         // numeric scale for kg values
const SCALE6 = 1000000n;       // 6 decimal places for % ratios

function toInt4(v: string): bigint {
  const [whole, frac = ""] = v.split(".");
  return BigInt(whole) * SCALE4 + BigInt((frac + "0000").slice(0, 4));
}

function fmt4(n: bigint): string {
  const sign = n < 0n ? "-" : "";
  const abs = n < 0n ? -n : n;
  return `${sign}${abs / SCALE4}.${(abs % SCALE4).toString().padStart(4, "0")}`;
}

function fmt6(n: bigint): string {
  const sign = n < 0n ? "-" : "";
  const abs = n < 0n ? -n : n;
  return `${sign}${abs / SCALE6}.${(abs % SCALE6).toString().padStart(6, "0")}`;
}

export interface MfcaInput {
  inputKg: string;
  productKg: string;
  lossKg: string;
  returnedKg: string;
  /** sum(lossKg * unitCostPerKg) across all LOSS entries — computed by DB */
  lossCostRaw: string;
}

export interface MfcaResult {
  inputKg: string;
  productKg: string;
  lossKg: string;
  returnedKg: string;
  varianceKg: string;
  /** percentage, 4 decimal places */
  materialEfficiency: string;
  /** percentage, 4 decimal places */
  materialLossRate: string;
  /** monetary value, 4 decimal places */
  materialLossCost: string;
}

/**
 * Canonical MFCA calculation per backend.md §6.
 * Guards: inputKg = 0 → efficiency and lossRate = 0 (no division by zero).
 * shortcut: lossCost = material cost only (MVP); upgrade to include energy/system/waste when Phase 7+ extends.
 */
export function calculateMfca(input: MfcaInput): MfcaResult {
  const inKg = toInt4(input.inputKg);
  const prKg = toInt4(input.productKg);
  const lsKg = toInt4(input.lossKg);
  const rtKg = toInt4(input.returnedKg);

  const varianceInt = inKg - prKg - lsKg - rtKg;

  let effInt = 0n;
  let lossRateInt = 0n;
  if (inKg !== 0n) {
    // multiply numerator by SCALE6 * SCALE4 before dividing by inKg (which is in SCALE4 units)
    // result is in SCALE6 units (percentage with 6 decimal places)
    effInt = (prKg * SCALE6 * 100n) / inKg;
    lossRateInt = (lsKg * SCALE6 * 100n) / inKg;
  }

  return {
    inputKg: input.inputKg,
    productKg: input.productKg,
    lossKg: input.lossKg,
    returnedKg: input.returnedKg,
    varianceKg: fmt4(varianceInt),
    materialEfficiency: fmt6(effInt),
    materialLossRate: fmt6(lossRateInt),
    materialLossCost: input.lossCostRaw,
  };
}
