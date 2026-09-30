"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";

import { apiRequest } from "@/lib/api/client";
import { DataTable } from "@/components/tables/DataTable";

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

const formatDate = (value: string) =>
  new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

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
    setError("");

    try {
      const response = await apiRequest<OAuthClient[]>(
        "/api/mcp/oauth-clients",
      );

      setClients(response);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Could not load OAuth clients.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function createClient(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    const scopes: Scope[] = [
      ...(read ? (["strix:read"] as const) : []),
      ...(write ? (["strix:write"] as const) : []),
    ];

    if (!scopes.length) {
      setError("Choose at least one permission.");
      return;
    }

    const uris = redirectUris
      .split(/\r?\n/)
      .map((uri) => uri.trim())
      .filter(Boolean);

    if (!uris.length) {
      setError("At least one redirect URI is required.");
      return;
    }

    setBusy(true);

    try {
      await apiRequest<OAuthClient>("/api/mcp/oauth-clients", {
        method: "POST",
        body: JSON.stringify({
          name: name.trim(),
          redirectUris: uris,
          scopes,
        }),
      });

      setName("");
      setRedirectUris("");

      await refresh();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Could not create the OAuth client.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function revoke(id: string) {
    setBusy(true);
    setError("");

    try {
      await apiRequest(`/api/mcp/oauth-clients/${id}`, {
        method: "DELETE",
      });

      await refresh();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Could not revoke the OAuth client.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function copyClientId(clientId: string) {
    try {
      await navigator.clipboard.writeText(clientId);
      setCopiedId(clientId);
    } catch {
      setError(
        "Clipboard access failed. Select and copy the client ID manually.",
      );
    }
  }

  const columns = useMemo<ColumnDef<OAuthClient>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Client",
        cell: ({ row }) => {
          const client = row.original;

          return (
            <div className="min-w-0">
              <p className="font-medium">{client.name}</p>

              <code className="mt-1 block max-w-72 truncate text-xs text-muted-foreground">
                {client.clientId}
              </code>
            </div>
          );
        },
      },

      {
        id: "scopes",
        header: "Permissions",
        accessorFn: (row) => row.scopes.join(","),
        cell: ({ row }) => {
          const scopes = row.original.scopes;

          return (
            <div className="flex flex-wrap gap-1.5">
              {scopes.includes("strix:read") && (
                <span className="rounded-md bg-muted px-2 py-1 text-xs">
                  Read
                </span>
              )}

              {scopes.includes("strix:write") && (
                <span className="rounded-md bg-muted px-2 py-1 text-xs">
                  Write
                </span>
              )}
            </div>
          );
        },
      },

      {
        id: "redirectUris",
        header: "Redirect URIs",
        accessorFn: (row) => row.redirectUris.join(", "),
        cell: ({ row }) => {
          const uris = row.original.redirectUris;

          return (
            <div className="max-w-sm">
              {uris.length === 1 ? (
                <code className="block truncate text-xs text-muted-foreground">
                  {uris[0]}
                </code>
              ) : (
                <div className="space-y-1">
                  <code className="block truncate text-xs text-muted-foreground">
                    {uris[0]}
                  </code>

                  <span className="text-xs text-muted-foreground">
                    +{uris.length - 1} more
                  </span>
                </div>
              )}
            </div>
          );
        },
      },

      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.original.status;

          return (
            <span
              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                status === "active"
                  ? "bg-emerald-500/10 text-emerald-700"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {status === "active" ? "Active" : "Revoked"}
            </span>
          );
        },
      },

      {
        accessorKey: "createdAt",
        header: "Created",
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-sm text-muted-foreground">
            {formatDate(row.original.createdAt)}
          </span>
        ),
      },

      {
        id: "actions",
        header: "Actions",
        enableSorting: false,
        cell: ({ row }) => {
          const client = row.original;

          return (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  void copyClientId(client.clientId);
                }}
                className="rounded-lg border px-3 py-1.5 text-sm font-medium hover:bg-muted"
              >
                {copiedId === client.clientId ? "Copied" : "Copy ID"}
              </button>

              {client.status === "active" && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={(event) => {
                    event.stopPropagation();
                    void revoke(client.id);
                  }}
                  className="rounded-lg border border-destructive/30 px-3 py-1.5 text-sm text-destructive hover:bg-destructive/5 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Revoke
                </button>
              )}
            </div>
          );
        },
      },
    ],
    [busy, copiedId],
  );

  return (
    <section className="max-w-7xl">
      {/* Header */}
      <div>
        <p className="text-sm text-muted-foreground">
          Manage pre-registered OAuth clients for user-delegated MCP access
        </p>

        <h2 className="mt-1 text-2xl font-semibold tracking-tight">
          MCP OAuth Clients
        </h2>
      </div>

      {/* Create OAuth Client */}
      <form
        onSubmit={createClient}
        className="mt-5 grid gap-4 rounded-xl border bg-card p-5"
      >
        <label className="text-sm font-medium">
          Client name
          <input
            required
            maxLength={120}
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="External MCP client"
            className="mt-1 w-full rounded-lg border bg-background px-3 py-2 font-normal outline-none focus:ring-2 focus:ring-ring"
          />
        </label>

        <label className="text-sm font-medium">
          Exact redirect URI(s)
          <textarea
            required
            rows={3}
            value={redirectUris}
            onChange={(event) => setRedirectUris(event.target.value)}
            placeholder={
              "https://example.com/oauth/callback\nhttps://example.com/auth/callback"
            }
            className="mt-1 w-full rounded-lg border bg-background px-3 py-2 font-normal outline-none focus:ring-2 focus:ring-ring"
          />
          <span className="mt-1 block font-normal text-muted-foreground">
            HTTPS is required in production. The URI must exactly match the
            external client registration.
          </span>
        </label>

        <fieldset className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <legend className="mb-2 font-medium">Permissions</legend>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={read}
              onChange={(event) => setRead(event.target.checked)}
            />
            Read
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={write}
              onChange={(event) => setWrite(event.target.checked)}
            />
            Write
          </label>
        </fieldset>

        <button
          type="submit"
          disabled={busy}
          className="w-fit rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          {busy ? "Working…" : "Create OAuth client"}
        </button>
      </form>

      {/* Error */}
      {error && (
        <p
          role="alert"
          className="mt-4 rounded-lg border border-destructive/30 p-3 text-sm text-destructive"
        >
          {error}
        </p>
      )}

      {/* OAuth Clients Table */}
      <div className="mt-6">
        <DataTable<OAuthClient, unknown>
          columns={columns}
          data={clients}
          loading={loading}
          enableSearch
          searchKey="name"
          searchPlaceholder="Search OAuth clients..."
          enableSorting
          enableFiltering={false}
          enablePagination
          enableColumnVisibility={false}
          enableRowSelection={false}
          emptyMessage="No OAuth clients yet."
        />
      </div>
    </section>
  );
}
