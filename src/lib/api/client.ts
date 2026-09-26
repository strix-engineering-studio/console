export class ApiError extends Error {
  constructor(message: string, readonly status: number) { super(message); this.name = "ApiError"; }
}

export async function apiRequest<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: { ...(init?.body ? { "Content-Type": "application/json" } : {}), ...init?.headers },
  });
  const body = await response.json().catch(() => ({})) as { data?: T; error?: string };
  if (!response.ok) throw new ApiError(body.error || "The request could not be completed.", response.status);
  return ("data" in body ? body.data : body) as T;
}

export const jsonBody = (value: unknown): Pick<RequestInit, "body" | "method"> => ({ method: "POST", body: JSON.stringify(value) });
