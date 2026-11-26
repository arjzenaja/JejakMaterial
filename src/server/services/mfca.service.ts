import { getProductionRunById } from "@/server/repositories/production-run.repository";
import { getMfcaTotalsByRunId } from "@/server/repositories/material-flow.repository";
import { calculateMfca } from "@/lib/mfca";

export async function getRunAnalysis(id: string, organizationId: string) {
  const run = await getProductionRunById(id, organizationId);
  if (!run) {
    throw Response.json(
      {
        error: {
          code: "NOT_FOUND",
          message: "Production run not found",
          requestId: crypto.randomUUID(),
        },
      },
      { status: 404 },
    );
  }

  const totals = await getMfcaTotalsByRunId(id, organizationId);
  const analysis = calculateMfca(totals);

  return { run, analysis };
}
