import { apiRequest } from "@/lib/api/client";
export const authService = {
  login: (input: { email: string; password: string }) => apiRequest<{ ok: true }>("/api/auth/login", { method: "POST", body: JSON.stringify(input) }),
  logout: () => apiRequest<{ ok: true }>("/api/auth/logout", { method: "POST" }),
};
