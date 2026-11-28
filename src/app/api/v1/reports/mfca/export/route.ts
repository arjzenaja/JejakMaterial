import { getAuthSession } from "@/server/helpers/session";
import { getActiveMembership } from "@/server/helpers/tenant";
import { fail } from "@/server/helpers/response";
import { periodSchema } from "@/lib/validation";
import { getMfcaReport } from "@/server/services/dashboard.service";

const CSV_HEADERS = [
  "runNumber", "productName", "productionDate", "runStatus",
  "inputKg", "productKg", "lossKg", "returnedKg",
  "varianceKg", "materialEfficiency", "materialLossRate", "materialLossCost",
];

// shortcut: naive CSV (no quoting of special chars) — upgrade if productName may contain commas/newlines
function toCSV(rows: Record<string, string>[]): string {
  const lines = [CSV_HEADERS.join(",")];
  for (const row of rows) {
    lines.push(CSV_HEADERS.map((h) => row[h] ?? "").join(","));
  }
  return lines.join("\n");
}

export async function GET(request: Request) {
  try {
    const session = await getAuthSession(request);
    const membership = await getActiveMembership(session.user.id);

    const url = new URL(request.url);
    const parsed = periodSchema.safeParse({
      from: url.searchParams.get("from") ?? undefined,
      to: url.searchParams.get("to") ?? undefined,
    });
    if (!parsed.success) {
      return fail("VALIDATION_ERROR", "Invalid period", 400,
        parsed.error.issues.map((i) => ({ field: String(i.path[0]), message: i.message })));
    }

    const report = await getMfcaReport(
      membership.organizationId,
      parsed.data.from,
      parsed.data.to,
    );

    const csv = toCSV(report as unknown as Record<string, string>[]);
    const filename = `mfca-report-${parsed.data.from ?? "all"}-${parsed.data.to ?? "all"}.csv`;

    return new Response(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (e) {
    if (e instanceof Response) return e;
    throw e;
  }
}
