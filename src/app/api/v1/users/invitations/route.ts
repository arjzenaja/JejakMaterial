import { getAuthSession } from "@/server/helpers/session";
import { ok, fail } from "@/server/helpers/response";
import { acceptInviteSchema } from "@/lib/validation";
import {
  getInvitationByToken,
  acceptInvitation,
} from "@/server/repositories/membership.repository";

export async function POST(request: Request) {
  try {
    const session = await getAuthSession(request);

    const body = await request.json().catch(() => null);
    const parsed = acceptInviteSchema.safeParse(body);
    if (!parsed.success) {
      return fail("VALIDATION_ERROR", "Invalid input", 400,
        parsed.error.issues.map((i) => ({ field: String(i.path[0]), message: i.message })),
      );
    }

    const invitation = await getInvitationByToken(parsed.data.token);
    if (!invitation) {
      return fail("NOT_FOUND", "Invitation not found or already accepted", 404);
    }

    // Invitation must belong to the authenticated user
    if (invitation.userId !== session.user.id) {
      return fail("FORBIDDEN", "This invitation is not for you", 403);
    }

    const accepted = await acceptInvitation(invitation.id);
    return ok(accepted);
  } catch (e) {
    if (e instanceof Response) return e;
    throw e;
  }
}
