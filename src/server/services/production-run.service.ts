import { getFacilityById } from "@/server/repositories/facility.repository";
import {
  createProductionRun as createProductionRunRepo,
  getProductionRunById,
  updateProductionRun as updateProductionRunRepo,
  closeProductionRun as closeProductionRunRepo,
} from "@/server/repositories/production-run.repository";
import { getFlowTotalsByRunId } from "@/server/repositories/material-flow.repository";
import { calculateBalance } from "@/lib/balance";

export async function createProductionRun(
  organizationId: string,
  data: {
    facilityId: string;
    runNumber: string;
    productName: string;
    productionDate: string;
  },
) {
  // Verify facility belongs to same org
  const facility = await getFacilityById(data.facilityId, organizationId);
  if (!facility) {
    throw Response.json(
      {
        error: {
          code: "NOT_FOUND",
          message: "Facility not found",
          requestId: crypto.randomUUID(),
        },
      },
      { status: 404 },
    );
  }

  return createProductionRunRepo(organizationId, data);
}

export async function updateProductionRun(
  id: string,
  organizationId: string,
  data: Partial<{
    facilityId: string;
    runNumber: string;
    productName: string;
    productionDate: string;
  }>,
) {
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

  // Reject if CLOSED
  if (run.runStatus === "CLOSED") {
    throw Response.json(
      {
        error: {
          code: "CONFLICT",
          message: "Cannot edit a closed production run",
          requestId: crypto.randomUUID(),
        },
      },
      { status: 409 },
    );
  }

  // If changing facility, verify new facility belongs to org
  if (data.facilityId) {
    const facility = await getFacilityById(data.facilityId, organizationId);
    if (!facility) {
      throw Response.json(
        {
          error: {
            code: "NOT_FOUND",
            message: "Facility not found",
            requestId: crypto.randomUUID(),
          },
        },
        { status: 404 },
      );
    }
  }

  return updateProductionRunRepo(id, organizationId, data);
}

export async function closeProductionRun(id: string, organizationId: string) {
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

  // Already closed — reject, keep idempotency explicit
  if (run.runStatus === "CLOSED") {
    throw Response.json(
      {
        error: {
          code: "CONFLICT",
          message: "Production run is already closed",
          requestId: crypto.randomUUID(),
        },
      },
      { status: 409 },
    );
  }

  const rows = await getFlowTotalsByRunId(id, organizationId);
  const totals = {
    inputKg: "0",
    productKg: "0",
    lossKg: "0",
    returnedKg: "0",
  };
  for (const row of rows) {
    if (row.flowType in totals) {
      totals[row.flowType as keyof typeof totals] = row.total;
    }
  }

  const balance = calculateBalance(totals);
  if (!balance.balanced) {
    throw Response.json(
      {
        error: {
          code: "UNBALANCED",
          message: `Material balance has variance of ${balance.varianceKg} kg`,
          requestId: crypto.randomUUID(),
        },
      },
      { status: 422 },
    );
  }

  return closeProductionRunRepo(id, organizationId);
}
