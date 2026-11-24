import { getFacilityById } from "@/server/repositories/facility.repository";
import {
  createProductionRun as createProductionRunRepo,
  getProductionRunById,
  updateProductionRun as updateProductionRunRepo,
} from "@/server/repositories/production-run.repository";

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
