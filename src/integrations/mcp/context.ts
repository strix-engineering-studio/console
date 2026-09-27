import "server-only";
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 120;
const clients = new Map<string, { start: number; count: number }>();

function allow(key: string, maxRequests: number) {
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

export function allowMcpRequest(request: Request, maxRequests = MAX_REQUESTS, bucket = "mcp") {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  return allow(`${bucket}:ip:${ip}`, maxRequests);
}

export function allowMcpIdentity(identity: string, maxRequests = 300) {
  return allow(`mcp:identity:${identity}`, maxRequests);
}
