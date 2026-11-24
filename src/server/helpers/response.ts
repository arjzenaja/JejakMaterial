type SuccessStatus = 200 | 201 | 204;

export function ok<T>(data: T, status: SuccessStatus = 200) {
  if (status === 204) return new Response(null, { status: 204 });
  return Response.json({ data }, { status });
}

export function fail(
  code: string,
  message: string,
  status: number,
  details?: Array<{ field: string; message: string }>,
) {
  return Response.json(
    {
      error: {
        code,
        message,
        ...(details ? { details } : {}),
        requestId: crypto.randomUUID(),
      },
    },
    { status },
  );
}
