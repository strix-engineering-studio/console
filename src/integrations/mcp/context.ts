import "server-only";
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 120;
const clients = new Map<string, { start: number; count: number }>();

export function allowMcpRequest(request: Request, maxRequests = MAX_REQUESTS, bucket = "mcp") {
  const key = `${bucket}:${request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"}`;
  const now = Date.now();
  const entry = clients.get(key);
  if (!entry || now - entry.start >= WINDOW_MS) {
    clients.set(key, { start: now, count: 1 });
    if (clients.size > 5000)
      for (const [client, value] of clients)
        if (now - value.start >= WINDOW_MS) clients.delete(client);
    return true;
  }
  entry.count += 1;
  return entry.count <= maxRequests;
}
