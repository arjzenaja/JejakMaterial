import { auth } from "@/lib/auth";

export async function getAuthSession(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });
  if (!session) {
    throw Response.json(
      {
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication required",
          requestId: crypto.randomUUID(),
        },
      },
      { status: 401 },
    );
  }
  return session;
}
