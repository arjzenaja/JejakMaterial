// Placeholder for Better Auth catch-all route handler (/api/auth/*)
export async function GET() {
  return Response.json(
    { message: "Better Auth route handler placeholder (/api/auth/[...all])" },
    { status: 501 }
  );
}

export async function POST() {
  return Response.json(
    { message: "Better Auth route handler placeholder (/api/auth/[...all])" },
    { status: 501 }
  );
}
