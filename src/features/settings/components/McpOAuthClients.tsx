"use client";

import { useCallback, useEffect, useState } from "react";
import { apiRequest } from "@/lib/api/client";

type Scope = "strix:read" | "strix:write";
type OAuthClient = {
  id: string;
  clientId: string;
  name: string;
  redirectUris: string[];
  scopes: Scope[];
  status: "active" | "revoked";
  revokedAt: string | null;
  createdAt: string;
};

const date = (value: string) =>
  new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));

export default function McpOAuthClients() {
  const [clients, setClients] = useState<OAuthClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [redirectUris, setRedirectUris] = useState("");
  const [read, setRead] = useState(true);
  const [write, setWrite] = useState(false);
  const [busy, setBusy] = useState(false);
  const [copiedId, setCopiedId] = useState("");
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    try { setClients(await apiRequest<OAuthClient[]>("/api/mcp/oauth-clients")); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Could not load OAuth clients."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  async function createClient(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const scopes: Scope[] = [...(read ? ["strix:read" as const] : []), ...(write ? ["strix:write" as const] : [])];
    if (!scopes.length) { setError("Choose at least one permission."); return; }
    const uris = redirectUris.split(/\r?\n/).map((uri) => uri.trim()).filter(Boolean);
    setBusy(true);
    try {
      await apiRequest<OAuthClient>("/api/mcp/oauth-clients", {
        method: "POST",
        body: JSON.stringify({ name, redirectUris: uris, scopes }),
      });
      setName("");
      setRedirectUris("");
      await refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not create the OAuth client."); }
    finally { setBusy(false); }
  }

  async function revoke(id: string) {
    setBusy(true);
    setError("");
    try {
      await apiRequest(`/api/mcp/oauth-clients/${id}`, { method: "DELETE" });
      await refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not revoke the OAuth client."); }
    finally { setBusy(false); }
  }

  async function copyClientId(clientId: string) {
    try { await navigator.clipboard.writeText(clientId); setCopiedId(clientId); }
    catch { setError("Clipboard access failed. Select and copy the client ID manually."); }
  }

  return <section className="mt-10 max-w-4xl">
    <div>
      <p className="text-sm text-muted-foreground">Manage pre-registered OAuth clients for user-delegated MCP access</p>
      <h2 className="mt-1 text-2xl font-semibold tracking-tight">MCP OAuth Clients</h2>
    </div>

    <form onSubmit={createClient} className="mt-5 grid gap-4 rounded-xl border bg-card p-5">
      <label className="text-sm font-medium">Client name
        <input required maxLength={120} value={name} onChange={(event) => setName(event.target.value)} placeholder="External MCP client" className="mt-1 w-full rounded-lg border bg-background px-3 py-2 font-normal" />
      </label>
      <label className="text-sm font-medium">Exact redirect URI(s)
        <textarea required rows={3} value={redirectUris} onChange={(event) => setRedirectUris(event.target.value)} placeholder="Enter each registered redirect URI on a separate line" className="mt-1 w-full rounded-lg border bg-background px-3 py-2 font-normal" />
        <span className="mt-1 block font-normal text-muted-foreground">HTTPS is required in production. The URI must exactly match the external client registration.</span>
      </label>
      <fieldset className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
        <legend className="mb-2 font-medium">Permissions</legend>
        <label className="flex items-center gap-2"><input type="checkbox" checked={read} onChange={(event) => setRead(event.target.checked)} />Read</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={write} onChange={(event) => setWrite(event.target.checked)} />Write</label>
      </fieldset>
      <button disabled={busy} className="w-fit rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">{busy ? "Working…" : "Create OAuth client"}</button>
    </form>

    {error && <p role="alert" className="mt-4 rounded-lg border border-destructive/30 p-3 text-sm text-destructive">{error}</p>}
    <div className="mt-5 grid gap-3">
      {loading && <p className="text-sm text-muted-foreground">Loading OAuth clients…</p>}
      {!loading && clients.length === 0 && <p className="rounded-xl border p-5 text-sm text-muted-foreground">No OAuth clients yet.</p>}
      {clients.map((client) => <article key={client.id} className="rounded-xl border bg-card p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0"><h3 className="font-medium">{client.name}</h3><code className="mt-1 block break-all text-sm text-muted-foreground">{client.clientId}</code></div>
          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${client.status === "active" ? "bg-emerald-500/10 text-emerald-700" : "bg-muted text-muted-foreground"}`}>{client.status === "active" ? "Active" : "Revoked"}</span>
        </div>
        <button onClick={() => void copyClientId(client.clientId)} className="mt-3 rounded-lg border px-3 py-1.5 text-sm font-medium">{copiedId === client.clientId ? "Copied" : "Copy client ID"}</button>
        <div className="mt-3 grid gap-2 text-sm text-muted-foreground">
          <div><span className="font-medium text-foreground">Redirect URIs</span>{client.redirectUris.map((uri) => <code key={uri} className="mt-1 block break-all">{uri}</code>)}</div>
          <span><span className="font-medium text-foreground">Scopes:</span> {client.scopes.join(", ")}</span>
          <span><span className="font-medium text-foreground">Created:</span> {date(client.createdAt)}</span>
        </div>
        {client.status === "active" && <button disabled={busy} onClick={() => void revoke(client.id)} className="mt-4 rounded-lg border border-destructive/30 px-3 py-1.5 text-sm text-destructive disabled:opacity-50">Revoke client</button>}
      </article>)}
    </div>
  </section>;
}
