import { getAuthSession } from "@/server/helpers/session";
import { getActiveMembership } from "@/server/helpers/tenant";
import { ok, fail } from "@/server/helpers/response";
import { periodSchema } from "@/lib/validation";
import { getMfcaReport } from "@/server/services/dashboard.service";

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
    return ok(report);
  } catch (e) {
    if (e instanceof Response) return e;
    throw e;
  }
}
