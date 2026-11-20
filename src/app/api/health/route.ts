// Health check endpoint (/api/health)
export async function GET() {
  return Response.json({
    status: "ok",
    service: "jejakmaterial-api",
    timestamp: new Date().toISOString(),
  });
}
