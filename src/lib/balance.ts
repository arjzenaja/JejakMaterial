// shortcut: integer math on fixed scale-4 values, no decimal.js — upgrade if scale rises above 4 or values exceed 18 digits
const SCALE = 10000;

/** Parse a numeric string like "100.0000" into an exact integer count of 1/10000 kg units. */
function toInt(value: string): bigint {
  const [whole, frac = ""] = value.split(".");
  const padded = (frac + "0000").slice(0, 4);
  return BigInt(whole) * BigInt(SCALE) + BigInt(padded || "0");
}

export interface FlowTotals {
  inputKg: string;
  productKg: string;
  lossKg: string;
  returnedKg: string;
}

export interface BalanceResult {
  inputKg: string;
  productKg: string;
  lossKg: string;
  returnedKg: string;
  varianceKg: string;
  balanced: boolean;
}

/** varianceKg = inputKg - productKg - lossKg - returnedKg, in exact decimal arithmetic. */
export function calculateBalance(totals: FlowTotals): BalanceResult {
  const input = toInt(totals.inputKg);
  const product = toInt(totals.productKg);
  const loss = toInt(totals.lossKg);
  const returned = toInt(totals.returnedKg);

  const varianceInt = input - product - loss - returned;

  const sign = varianceInt < 0n ? "-" : "";
  const abs = varianceInt < 0n ? -varianceInt : varianceInt;
  const whole = (abs / BigInt(SCALE)).toString();
  const frac = (abs % BigInt(SCALE)).toString().padStart(4, "0");

  return {
    inputKg: totals.inputKg,
    productKg: totals.productKg,
    lossKg: totals.lossKg,
    returnedKg: totals.returnedKg,
    varianceKg: `${sign}${whole}.${frac}`,
    balanced: varianceInt === 0n,
  };
}