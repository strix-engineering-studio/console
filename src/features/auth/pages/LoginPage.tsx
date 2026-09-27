"use client";

import { useRouter } from "next/navigation";
import { useLogin } from "../services/auth.mutations";

export default function LoginPage() {
  const router = useRouter();
  const login = useLogin();

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      await login.mutateAsync({ email: String(form.get("email") ?? ""), password: String(form.get("password") ?? "") });
      const requestedDestination = new URLSearchParams(window.location.search).get("returnTo");
      const destination = requestedDestination?.startsWith("/") &&
        !requestedDestination.startsWith("//") &&
        !requestedDestination.includes("\\")
        ? requestedDestination
        : "/dashboard";
      router.replace(destination);
      router.refresh();
    } catch { /* The mutation exposes the error state below. */ }
  }

  return (
    <main className="w-full max-w-sm rounded-2xl border bg-card p-8 shadow-xl">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">Strix Engineering Studio</p>
      <h1 className="mt-3 text-2xl font-semibold">Strix Lead</h1>
      <p className="mt-1 text-sm text-muted-foreground">Sign in to your lead intelligence console.</p>
      <form onSubmit={submit} className="mt-7 space-y-4">
        <label className="block space-y-1.5 text-sm font-medium">Email
          <input name="email" type="email" autoComplete="username" required className="mt-1 w-full rounded-lg border bg-background px-3 py-2.5" />
        </label>
        <label className="block space-y-1.5 text-sm font-medium">Password
          <input name="password" type="password" autoComplete="current-password" required className="mt-1 w-full rounded-lg border bg-background px-3 py-2.5" />
        </label>
        {login.isError && <p role="alert" className="text-sm text-destructive">{login.error.message}</p>}
        <button disabled={login.isPending} className="w-full rounded-lg bg-primary px-4 py-2.5 font-medium text-primary-foreground disabled:opacity-60">
          {login.isPending ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </main>
  );
}
